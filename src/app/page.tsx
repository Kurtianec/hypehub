import { Storefront } from "@/components/store/Storefront";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { db } from "@/lib/db";

// Force dynamic rendering — settings must be fresh on every load
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getData() {
  const [categories, products, faqs, settings] = await Promise.all([
    db.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: { where: { status: "available" } } } } },
    }),
    db.product.findMany({
      where: { status: { in: ["available", "coming_soon"] }, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    db.faqItem.findMany({ orderBy: { order: "asc" } }),
    db.setting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) if (s.key !== "admin_pass") settingsMap[s.key] = s.value;

  // Strip credentials
  const safeProducts = products.map(({ login, password, deliveryNote, internalNote, ...rest }) => { void login; void password; void deliveryNote; void internalNote; return rest; });

  return {
    categories: JSON.parse(JSON.stringify(categories)),
    products: JSON.parse(JSON.stringify(safeProducts)),
    faqs: JSON.parse(JSON.stringify(faqs)),
    settings: settingsMap,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string }>;
}) {
  const params = await searchParams;
  const data = await getData();

  if (params.admin === "1") {
    return <AdminPanel initialData={data} />;
  }

  return <Storefront {...data} />;
}
