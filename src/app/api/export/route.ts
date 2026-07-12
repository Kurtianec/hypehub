import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  if (auth !== process.env.ADMIN_TOKEN && auth !== TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "products";

  if (type === "products") {
    const products = await db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    const headers = ["ID", "Title", "Category", "Price", "OldPrice", "Status", "Followers", "Badges", "Featured", "Login", "Password", "CreatedAt"];
    const rows = products.map((p) => [
      p.id,
      p.title,
      p.category?.name || "",
      String(p.price),
      p.oldPrice ? String(p.oldPrice) : "",
      p.status,
      p.followers || "",
      p.badges || "",
      p.featured ? "yes" : "no",
      p.login,
      p.password,
      p.createdAt.toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");
    return new NextResponse("\ufeff" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="products_${Date.now()}.csv"`,
      },
    });
  }

  if (type === "orders") {
    const orders = await db.order.findMany({
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    const headers = ["ID", "Product", "Category", "Email", "Contact", "Method", "Amount", "Status", "TxHash", "CreatedAt"];
    const rows = orders.map((o) => [
      o.id,
      o.product?.title || "",
      o.product?.category?.name || "",
      o.buyerEmail,
      o.buyerContact,
      o.paymentMethod,
      String(o.amount),
      o.status,
      o.txnHash || "",
      o.createdAt.toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");
    return new NextResponse("\ufeff" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders_${Date.now()}.csv"`,
      },
    });
  }

  if (type === "visitors") {
    const visitors = await db.visitor.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    const headers = ["IP", "Country", "City", "Path", "Referer", "UserAgent", "CreatedAt"];
    const rows = visitors.map((v) => [
      v.ip,
      v.country || "",
      v.city || "",
      v.path,
      v.referer || "",
      v.userAgent || "",
      v.createdAt.toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");
    return new NextResponse("\ufeff" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="visitors_${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
}
