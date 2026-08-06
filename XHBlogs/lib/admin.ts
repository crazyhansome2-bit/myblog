import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE = "linx_admin_session";
export const ADMIN_STATE_COOKIE = "linx_admin_oauth_state";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSession = {
  username: string;
  exp: number;
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function safelyMatches(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAdminConfig() {
  return {
    clientId: process.env.ADMIN_GITHUB_CLIENT_ID || "",
    clientSecret: process.env.ADMIN_GITHUB_CLIENT_SECRET || "",
    username: process.env.ADMIN_GITHUB_USERNAME || "",
    repository: process.env.ADMIN_GITHUB_REPOSITORY || "",
    contentToken: process.env.ADMIN_GITHUB_TOKEN || "",
  };
}

export function isAdminAuthConfigured() {
  const config = getAdminConfig();
  return Boolean(getSessionSecret() && config.clientId && config.clientSecret && config.username);
}

export function createOAuthState() {
  const state = crypto.randomBytes(32).toString("base64url");
  return `${state}.${sign(state)}`;
}

export function verifyOAuthState(value: string | undefined) {
  if (!value || !getSessionSecret()) return false;
  const [state, signature] = value.split(".");
  return Boolean(state && signature && safelyMatches(sign(state), signature));
}

export function createAdminSession(username: string) {
  const payload: AdminSession = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readAdminSession(cookie: string | undefined): AdminSession | null {
  if (!cookie || !getSessionSecret()) return null;
  const [encoded, signature] = cookie.split(".");
  if (!encoded || !signature || !safelyMatches(sign(encoded), signature)) return null;

  try {
    const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSession;
    if (!session.username || !session.exp || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const entry = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

export function requireAdmin(request: Request) {
  const session = readAdminSession(getCookie(request, ADMIN_SESSION_COOKIE));
  const configuredUsername = getAdminConfig().username;
  if (!session || !configuredUsername || session.username.toLowerCase() !== configuredUsername.toLowerCase()) {
    return null;
  }
  return session;
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
