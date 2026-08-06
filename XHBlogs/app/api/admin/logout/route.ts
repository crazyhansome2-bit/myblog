import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminCookieOptions } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/studio", request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
