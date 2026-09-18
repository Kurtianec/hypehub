import { requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


// GET — list all promo codes (admin)
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const codes = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ codes });
}

// POST — create new promo code
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

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
