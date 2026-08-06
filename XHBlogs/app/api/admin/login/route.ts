import { NextRequest, NextResponse } from "next/server";
import { ADMIN_STATE_COOKIE, adminCookieOptions, createOAuthState, getAdminConfig, isAdminAuthConfigured } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "后台登录尚未完成部署配置。" }, { status: 503 });
  }

  const state = createOAuthState();
  const { clientId } = getAdminConfig();
  const callback = new URL("/api/admin/callback", request.url).toString();
  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", callback);
  authorizationUrl.searchParams.set("scope", "read:user");
  authorizationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(ADMIN_STATE_COOKIE, state, { ...adminCookieOptions, maxAge: 600 });
  return response;
}
