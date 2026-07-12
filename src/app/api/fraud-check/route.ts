import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/fraud-check — check order for suspicious activity
// Returns warning level (no auto-actions, only admin notification)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, contact, ip } = body;

  const warnings: { level: "low" | "medium" | "high"; reason: string }[] = [];

  // Check 1: Multiple orders from same email in last 24h
  if (email) {
    const recentOrders = await db.order.count({
      where: {
        buyerEmail: email.toLowerCase(),
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentOrders >= 5) {
      warnings.push({
        level: "high",
        reason: `${recentOrders} заказов за 24 часа с email ${email}`,
      });
    } else if (recentOrders >= 3) {
      warnings.push({
        level: "medium",
        reason: `${recentOrders} заказа за 24 часа с email ${email}`,
      });
    }
  }

  // Check 2: Multiple orders from same IP
  if (ip && ip !== "0.0.0.0") {
    const recentVisitors = await db.visitor.count({
      where: {
        ip,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentVisitors >= 20) {
      warnings.push({
        level: "medium",
        reason: `${recentVisitors} посещений с IP ${ip} за час`,
      });
    }
  }

  // Check 3: Same contact used in multiple orders
  if (contact) {
    const contactOrders = await db.order.count({
      where: { buyerContact: contact },
    });
    if (contactOrders >= 5) {
      warnings.push({
        level: "medium",
        reason: `Контакт ${contact} использовался в ${contactOrders} заказах`,
      });
    }
  }

  // Check 4: Disposable email domains
  if (email) {
    const disposableDomains = ["tempmail", "guerrillamail", "10minutemail", "throwaway", "mailinator"];
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (disposableDomains.some((d) => domain.includes(d))) {
      warnings.push({
        level: "low",
        reason: `Временный email домен: ${domain}`,
      });
    }
  }

  return NextResponse.json({
    warnings,
    level: warnings.length === 0 ? "clean" : warnings[0].level,
    count: warnings.length,
  });
}
