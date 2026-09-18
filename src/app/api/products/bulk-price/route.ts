import { requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// POST /api/products/bulk-price — mass update prices
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { ids, mode, value } = await req.json();
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !mode || value === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let updated = 0;
  for (const id of ids) {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) continue;

    let newPrice = product.price;
    if (mode === "percent") {
      newPrice = Math.round(product.price * (1 + parseFloat(value) / 100));
    } else if (mode === "fixed") {
      newPrice = parseFloat(value);
    } else if (mode === "add") {
      newPrice = product.price + parseFloat(value);
    }

    if (newPrice < 0) newPrice = 0;

    await db.product.update({ where: { id }, data: { price: newPrice } });
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
