import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hypehub.vercel.app";
  const now = new Date();

  const [categories, products, blogPosts] = await Promise.all([
    db.category.findMany({
      where: { products: { some: { status: "available" } } },
      orderBy: { order: "asc" },
      select: { id: true, slug: true },
    }),
    db.product.findMany({
      where: { status: "available" },
      select: { id: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const urls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kupit-akkaunt-tiktok`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kupit-gruppu-vk`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kupit-kanal-youtube`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/otzyvy`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Blog posts
  for (const p of blogPosts) {
    urls.push({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Category filter pages
  for (const c of categories) {
    urls.push({
      url: `${baseUrl}/?cat=${c.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  // All products
  for (const p of products) {
    urls.push({
      url: `${baseUrl}/?p=${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return urls;
}
