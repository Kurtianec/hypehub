import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

// GET — list all promo codes (admin)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const codes = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ codes });
}

// POST — create new promo code
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code, discount, maxUses, expiresAt } = await req.json();
  if (!code || !discount) return NextResponse.json({ error: "code and discount required" }, { status: 400 });

  const promo = await db.promoCode.create({
    data: {
      code: code.toUpperCase(),
      discount: parseFloat(discount),
      maxUses: maxUses ? parseInt(maxUses) : 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
  return NextResponse.json({ promo });
}
