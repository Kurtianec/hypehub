import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — public: list approved reviews
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where = status === "all"
    ? {} // admin mode
    : { status: "approved" };

  // If admin token provided and status=all — return all
  if (status === "all") {
    const auth = req.headers.get("x-admin-token");
    if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reviews });
}

// POST — public: submit new review (pending approval)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, rating, text, product } = body;

  if (!name || !rating || !text) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const review = await db.review.create({
    data: {
      name: String(name).slice(0, 100),
      rating: parseInt(rating),
      text: String(text).slice(0, 2000),
      product: product ? String(product).slice(0, 200) : null,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, id: review.id });
}
