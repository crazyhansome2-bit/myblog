import { NextRequest, NextResponse } from "next/server";
import { ADMIN_WELCOME_COOKIE, adminCookieOptions, getCookie, requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const session = requireAdmin(request);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  const showWelcome = getCookie(request, ADMIN_WELCOME_COOKIE) === "1";
  const response = NextResponse.json({ authenticated: true, username: session.username, showWelcome });
  if (showWelcome) response.cookies.set(ADMIN_WELCOME_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
