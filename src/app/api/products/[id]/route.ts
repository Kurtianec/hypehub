import { encryptSecret, requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  const allowed = [
    "categoryId", "title", "description", "price", "oldPrice", "image",
    "badges", "followers", "metadata", "login", "password", "deliveryNote",
    "status", "featured", "warrantyDays", "lastCheckedAt", "publishedAt", "internalNote",
  ];
  for (const k of allowed) {
    if (body[k] !== undefined) {
      if (k === "price" || k === "oldPrice" || k === "warrantyDays") {
        data[k] = body[k] !== null ? parseFloat(body[k]) : null;
      } else if (k === "lastCheckedAt" || k === "publishedAt") {
        data[k] = body[k] ? new Date(body[k]) : null;
      } else if (k === "featured") {
        data[k] = !!body[k];
      } else {
        data[k] = ["login", "password", "deliveryNote"].includes(k) && body[k] ? encryptSecret(String(body[k])) : body[k];
      }
    }
  }

  const product = await db.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  await db.product.delete({ where: { id } });
  await db.adminLog.create({ data: { action: "product_deleted", entity: "product", entityId: id } });
  return NextResponse.json({ ok: true });
}
