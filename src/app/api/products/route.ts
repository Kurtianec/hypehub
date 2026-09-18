import { encryptSecret, requireAdmin } from "@/lib/security";
import { releaseExpiredReservations } from "@/lib/reservations";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  await releaseExpiredReservations();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";
  const search = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "0", 10);

  const where: Record<string, unknown> = { status: { in: ["available", "coming_soon"] } };
  if (category) where.categoryId = category;
  if (featured) where.featured = true;
  if (search) {
    // Case-insensitive search
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    ...(limit > 0 ? { take: limit } : {}),
  });

  // Strip credentials from public list
  const safe = products.map(({ login, password, deliveryNote, ...rest }) => rest);
  return NextResponse.json({ products: safe });
}

export async function POST(req: NextRequest) {
  // Admin-only
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const parsed = z.object({ categoryId: z.string().min(1), title: z.string().min(1).max(200), description: z.string().max(10_000).optional(), price: z.coerce.number().positive(), oldPrice: z.coerce.number().positive().nullable().optional(), image: z.string().url().nullable().optional(), badges: z.string().max(500).nullable().optional(), followers: z.string().max(100).nullable().optional(), metadata: z.string().max(10_000).nullable().optional(), login: z.string().min(1).max(1000), password: z.string().min(1).max(1000), deliveryNote: z.string().max(5000).nullable().optional(), status: z.enum(["available", "sold", "reserved", "archived", "coming_soon"]).optional(), featured: z.boolean().optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const product = await db.product.create({
    data: {
      categoryId: body.categoryId,
      title: body.title,
      description: body.description || "",
      price: body.price,
      oldPrice: body.oldPrice || null,
      image: body.image || null,
      badges: body.badges || null,
      followers: body.followers || null,
      metadata: body.metadata || null,
      login: encryptSecret(body.login),
      password: encryptSecret(body.password),
      deliveryNote: body.deliveryNote ? encryptSecret(body.deliveryNote) : null,
      status: body.status || "available",
      featured: !!body.featured,
    },
  });
  return NextResponse.json({ product });
}
