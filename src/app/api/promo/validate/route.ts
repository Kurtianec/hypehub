import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/promo/validate — validate promo code
export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = (body.code || "").toString().toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ error: "Введите код" }, { status: 400 });
  }

  const promo = await db.promoCode.findUnique({
    where: { code },
  });

  if (!promo || !promo.active) {
    return NextResponse.json({ error: "Недействительный код" }, { status: 404 });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "Срок действия истёк" }, { status: 400 });
  }

  if (promo.maxUses > 0 && promo.uses >= promo.maxUses) {
    return NextResponse.json({ error: "Лимит использований исчерпан" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    code: promo.code,
    discount: promo.discount,
  });
}
