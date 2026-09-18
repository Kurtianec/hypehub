import { requireAdmin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — public: get single post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!post.published) {
    const denied = await requireAdmin(req);
    if (denied) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

// PATCH — admin
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { slug } = await params;
  const body = await req.json();
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.blogPost.update({
    where: { id: post.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.published !== undefined && { published: !!body.published }),
    },
  });
  return NextResponse.json({ post: updated });
}

// DELETE — admin
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.blogPost.delete({ where: { id: post.id } });
  return NextResponse.json({ ok: true });
}
