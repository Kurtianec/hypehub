import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { db } from "@/lib/db";

type AdminPushPayload = {
  title: string;
  body: string;
  tab?: "dashboard" | "orders" | "support" | "reviews";
  entityId?: string;
};

function messaging() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  if (!getApps().length) {
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getMessaging();
}

export async function sendAdminPush(payload: AdminPushPayload) {
  try {
    const client = messaging();
    if (!client) return { sent: 0, skipped: true };
    const devices = await db.adminPushDevice.findMany({ where: { active: true }, select: { token: true } });
    if (!devices.length) return { sent: 0, skipped: false };
    const tokens = devices.map((device) => device.token);
    const result = await client.sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: {
        tab: payload.tab || "dashboard",
        entityId: payload.entityId || "",
        url: `https://hypehub.vercel.app/?admin=1&mobile_app=1&tab=${payload.tab || "dashboard"}`,
      },
      android: {
        priority: "high",
        notification: { channelId: "hypehub_admin_events", sound: "default", color: "#8E1537" },
      },
    });
    const invalid = result.responses.flatMap((response, index) => {
      const code = response.error?.code || "";
      return !response.success && (code.includes("registration-token-not-registered") || code.includes("invalid-registration-token")) ? [tokens[index]] : [];
    });
    if (invalid.length) await db.adminPushDevice.updateMany({ where: { token: { in: invalid } }, data: { active: false } });
    return { sent: result.successCount, failed: result.failureCount, skipped: false };
  } catch (error) {
    console.error("Admin push failed", error);
    return { sent: 0, failed: 1, skipped: false };
  }
}
