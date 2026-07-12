import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Track referral click and redirect to home
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const normalized = code.toUpperCase();

  const referral = await db.referral.findUnique({
    where: { code: normalized },
  });

  if (referral) {
    // Increment clicks
    await db.referral.update({
      where: { id: referral.id },
      data: { clicks: { increment: 1 } },
    });
    // Set cookie and redirect to home
    const response = NextResponse.redirect(new URL("/?ref=" + normalized, "http://localhost:3000"));
    response.cookies.set("hypehub_ref", normalized, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
    return response;
  }

  // Invalid code — just redirect home
  return NextResponse.redirect(new URL("/", "http://localhost:3000"));
}
