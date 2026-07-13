import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    availableProducts,
    soldProducts,
    reservedProducts,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    revenue30d,
    revenue7d,
    revenue24h,
    orders30d,
    orders7d,
    orders24h,
    newMessages,
    totalVisitors30d,
    uniqueVisitors30d,
    topProducts,
    topProductsByViews,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "available" } }),
    db.product.count({ where: { status: "sold" } }),
    db.product.count({ where: { status: "reserved" } }),
    db.order.count(),
    db.order.count({ where: { status: "pending" } }),
    db.order.count({ where: { status: "delivered" } }),
    db.order.aggregate({
      where: { status: "delivered", createdAt: { gte: last30d } },
      _sum: { amount: true },
    }),
    db.order.aggregate({
      where: { status: "delivered", createdAt: { gte: last7d } },
      _sum: { amount: true },
    }),
    db.order.aggregate({
      where: { status: "delivered", createdAt: { gte: last24h } },
      _sum: { amount: true },
    }),
    db.order.count({ where: { createdAt: { gte: last30d } } }),
    db.order.count({ where: { createdAt: { gte: last7d } } }),
    db.order.count({ where: { createdAt: { gte: last24h } } }),
    db.supportMessage.count({ where: { status: "new" } }),
    db.visitor.count({ where: { createdAt: { gte: last30d } } }),
    db.visitor.groupBy({
      by: ["ip"],
      where: { createdAt: { gte: last30d } },
      _count: true,
    }),
    db.order.groupBy({
      by: ["productId"],
      where: { status: "delivered", createdAt: { gte: last30d } },
      _count: true,
      _sum: { amount: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
    // Top products by VIEWS (new — item 26)
    db.product.findMany({
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, views: true, price: true, status: true },
    }),
  ]);

  // Enrich top products with names
  const topProductIds = topProducts.map((t) => t.productId);
  const productDetails = await db.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, title: true },
  });
  const productMap = new Map(productDetails.map((p) => [p.id, p.title]));
  const topProductsWithNames = topProducts.map((t) => ({
    productId: t.productId,
    title: productMap.get(t.productId) || "Unknown",
    count: t._count,
    revenue: t._sum.amount || 0,
  }));

  // Top products by views (mapped for frontend)
  const topProductsByViewsWithNames = topProductsByViews.map((p) => ({
    productId: p.id,
    title: p.title,
    views: p.views || 0,
    price: p.price,
    status: p.status,
  }));

  // Daily orders chart (last 14 days)
  const last14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const recentOrders = await db.order.findMany({
    where: { createdAt: { gte: last14d } },
    select: { createdAt: true, amount: true, status: true },
  });
  const daily = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayOrders = recentOrders.filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd);
    return {
      date: dayStart.toISOString().split("T")[0],
      orders: dayOrders.length,
      revenue: dayOrders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + o.amount, 0),
    };
  });

  // Conversion rate = orders / unique visitors (last 30 days)
  const uniqueVisitors30dCount = uniqueVisitors30d.length;
  const conversionRate = uniqueVisitors30dCount > 0
    ? (orders30d / uniqueVisitors30dCount) * 100
    : 0;

  return NextResponse.json({
    products: {
      total: totalProducts,
      available: availableProducts,
      sold: soldProducts,
      reserved: reservedProducts,
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      delivered: deliveredOrders,
      last30d: orders30d,
      last7d: orders7d,
      last24h: orders24h,
    },
    revenue: {
      last30d: revenue30d._sum.amount || 0,
      last7d: revenue7d._sum.amount || 0,
      last24h: revenue24h._sum.amount || 0,
    },
    visitors: {
      total30d: totalVisitors30d,
      unique30d: uniqueVisitors30dCount,
    },
    conversion: {
      rate: Number(conversionRate.toFixed(2)),
      orders: orders30d,
      visitors: uniqueVisitors30dCount,
    },
    support: {
      newMessages,
    },
    topProducts: topProductsWithNames,
    topProductsByViews: topProductsByViewsWithNames,
    daily,
  });
}
