import { requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — public: list published blog posts (or all for admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";

  if (all) {
    const denied = await requireAdmin(req);
    if (denied) return denied;
    const posts = await db.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ posts });
  }

  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      tags: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ posts });
}

// POST — admin: create new blog post
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  const post = await db.blogPost.create({
    data: {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt || "",
      content: body.content || "",
      tags: body.tags || "",
      published: !!body.published,
    },
  });
  return NextResponse.json({ post });
}
