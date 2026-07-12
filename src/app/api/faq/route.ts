import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const faqs = await db.faqItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== "hypehub-admin-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const faq = await db.faqItem.create({
    data: {
      question: body.question,
      answer: body.answer,
      order: body.order || 0,
    },
  });
  return NextResponse.json({ faq });
}
