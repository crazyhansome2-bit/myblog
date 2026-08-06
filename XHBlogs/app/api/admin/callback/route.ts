import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, ADMIN_STATE_COOKIE, adminCookieOptions, createAdminSession, getAdminConfig, getCookie, verifyOAuthState } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") || "";
  const stateCookie = getCookie(request, ADMIN_STATE_COOKIE);
  const config = getAdminConfig();

  if (!code || !stateCookie || state !== stateCookie || !verifyOAuthState(state)) {
    return NextResponse.redirect(new URL("/studio?error=login", origin));
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: `${origin}/api/admin/callback`,
      }),
      cache: "no-store",
    });
    const tokenData = await tokenResponse.json() as { access_token?: string };
    if (!tokenData.access_token) throw new Error("GitHub did not return an access token.");

    const profileResponse = await fetch("https://api.github.com/user", {
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store",
    });
    const profile = await profileResponse.json() as { login?: string };
    if (!profileResponse.ok || profile.login?.toLowerCase() !== config.username.toLowerCase()) {
      return NextResponse.redirect(new URL("/studio?error=forbidden", origin));
    }

    const response = NextResponse.redirect(new URL("/studio?login=success", origin));
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(profile.login), { ...adminCookieOptions, maxAge: 60 * 60 * 8 });
    response.cookies.set(ADMIN_STATE_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
    return response;
  } catch (error) {
    console.error("[admin] GitHub login failed:", error);
    return NextResponse.redirect(new URL("/studio?error=login", origin));
  }
}
