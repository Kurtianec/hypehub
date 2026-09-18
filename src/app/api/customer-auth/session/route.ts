import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_SESSION_COOKIE, getCustomerSession, sha256 } from "@/lib/security";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getCustomerSession(req);
  return session ? NextResponse.json({ authenticated: true, email: session.email }) : NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) await db.customerSession.deleteMany({ where: { tokenHash: sha256(token) } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", { expires: new Date(0), path: "/" });
  return response;
}
