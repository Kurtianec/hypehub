import { NextRequest } from "next/server";
import { db } from "@/lib/db";

const TOKEN = "hypehub-admin-2024";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// SSE endpoint for real-time admin notifications
// Client subscribes via EventSource; server polls DB every 3s and pushes changes
export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-token");
  // For EventSource, we can't set custom headers, so also accept token via query param
  const url = new URL(req.url);
  const tokenParam = url.searchParams.get("token");
  if (auth !== TOKEN && tokenParam !== TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastCounts = { orders: 0, support: 0, reviews: 0, totalOrders: 0 };
      let initialized = false;

      const sendEvent = (data: unknown) => {
        const msg = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(msg));
        } catch {
          // stream closed
        }
      };

      const check = async () => {
        try {
          const [orders, supportMsgs, reviews] = await Promise.all([
            db.order.findMany({
              select: { id: true, status: true, createdAt: true, amount: true, buyerEmail: true },
              orderBy: { createdAt: "desc" },
              take: 200,
            }),
            db.supportMessage.findMany({
              where: { status: "new" },
              select: { id: true },
            }),
            db.review.findMany({
              where: { status: "pending" },
              select: { id: true },
            }),
          ]);

          const pendingOrders = orders.filter((o) => o.status === "pending").length;
          const newSupport = supportMsgs.length;
          const pendingReviews = reviews.length;
          const totalOrders = orders.length;

          if (!initialized) {
            lastCounts = { orders: pendingOrders, support: newSupport, reviews: pendingReviews, totalOrders };
            initialized = true;
            sendEvent({ type: "init", counts: lastCounts });
            return;
          }

          if (totalOrders > lastCounts.totalOrders) {
            const newest = orders[0];
            sendEvent({
              type: "new-order",
              counts: { orders: pendingOrders, support: newSupport, reviews: pendingReviews, totalOrders },
              order: newest
                ? { id: newest.id, amount: newest.amount, email: newest.buyerEmail }
                : null,
            });
          }
          if (newSupport > lastCounts.support) {
            sendEvent({
              type: "new-support",
              counts: { orders: pendingOrders, support: newSupport, reviews: pendingReviews, totalOrders },
            });
          }
          if (pendingReviews > lastCounts.reviews) {
            sendEvent({
              type: "new-review",
              counts: { orders: pendingOrders, support: newSupport, reviews: pendingReviews, totalOrders },
            });
          }

          if (
            pendingOrders !== lastCounts.orders ||
            newSupport !== lastCounts.support ||
            pendingReviews !== lastCounts.reviews
          ) {
            sendEvent({
              type: "counts",
              counts: { orders: pendingOrders, support: newSupport, reviews: pendingReviews, totalOrders },
            });
          }

          lastCounts = { orders: pendingOrders, support: newSupport, reviews: pendingReviews, totalOrders };
        } catch {
          // DB error — don't crash the stream
        }
      };

      await check();
      const interval = setInterval(check, 3000);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(interval);
          clearInterval(heartbeat);
        }
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
