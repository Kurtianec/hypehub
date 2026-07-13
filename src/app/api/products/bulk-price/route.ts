import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

// POST /api/products/bulk-price — mass update prices
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
