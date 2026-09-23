import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consumeRateLimit, requestIp } from "@/lib/security";
import { sendAdminPush } from "@/lib/admin-push";

const schema = z.object({ txnHash: z.string().trim().max(300).optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = requestIp(req);
  if (!(await consumeRateLimit(`payment-notice:${ip}`, 8, 15 * 60_000)).allowed) {
    return NextResponse.json({ error: "Слишком много попыток. Повторите позже." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  if (order.status !== "pending") return NextResponse.json({ error: "Заказ уже обработан" }, { status: 409 });

  await db.$transaction([
    db.order.update({ where: { id }, data: parsed.data.txnHash ? { txnHash: parsed.data.txnHash } : {} }),
    db.orderEvent.create({
      data: {
        orderId: id,
        type: "payment_detected",
        label: "Покупатель сообщил об оплате",
        actor: "Покупатель",
        details: parsed.data.txnHash ? JSON.stringify({ txnHash: parsed.data.txnHash }) : null,
      },
    }),
  ]);

  void sendAdminPush({ title: "Покупатель сообщил об оплате", body: `Заказ ${id.slice(0, 8)} ожидает проверки${parsed.data.txnHash ? " · TX hash указан" : ""}`, tab: "orders", entityId: id });

  return NextResponse.json({ ok: true });
}
