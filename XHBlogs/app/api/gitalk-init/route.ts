import { NextRequest, NextResponse } from "next/server";

const OWNER = "crazyhansome2-bit";
const REPO = "myblog";
const GITHUB_API = "https://api.github.com";
const BASE_LABEL = "Gitalk";
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const allowedExactPaths = new Set([
  "/",
  "/about",
  "/friends",
  "/moments",
  "/music",
  "/photowall",
  "/projects",
  "/timeline",
  "/tree",
]);

type InitCacheStore = {
  __linxGitalkInitCache?: Map<string, { issue: number; expiresAt: number }>;
};

const cacheStore = globalThis as typeof globalThis & InitCacheStore;
cacheStore.__linxGitalkInitCache ||= new Map<string, { issue: number; expiresAt: number }>();

function normalizePath(value: unknown) {
  const path = String(value || "/").replace(/\/$/, "") || "/";
  if (!path.startsWith("/") || path.includes("://") || path.length > 120) return "/";
  return path;
}

function isAllowedPath(path: string) {
  return (
    allowedExactPaths.has(path) ||
    path.startsWith("/posts/") ||
    path.startsWith("/chatter/")
  );
}

function issueId(path: string) {
  return path.substring(0, 49);
}

function issueTitle(path: string) {
  if (path === "/") return "rogerlinx.com";
  return `rogerlinx.com${path}`;
}

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubFetch<T>(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      ...headers(token),
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub request failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

async function ensureLabel(name: string, color: string, token: string) {
  const encodedName = encodeURIComponent(name);
  const existing = await fetch(
    `${GITHUB_API}/repos/${OWNER}/${REPO}/labels/${encodedName}`,
    { headers: headers(token) },
  );

  if (existing.ok) return;

  await githubFetch(`/repos/${OWNER}/${REPO}/labels`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      color,
      description: name === BASE_LABEL ? "Gitalk comment issue" : "Gitalk page id",
    }),
  });
}

export async function POST(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN || "";

  if (!token) {
    return NextResponse.json({ ok: false, error: "GITHUB_TOKEN is not configured." });
  }

  try {
    const payload = await request.json();
    const path = normalizePath(payload.path);

    if (!isAllowedPath(path)) {
      return NextResponse.json({ ok: false, error: "Path is not allowed." }, { status: 400 });
    }

    const id = issueId(path);
    const cached = cacheStore.__linxGitalkInitCache?.get(id);

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ ok: true, created: false, issue: cached.issue, cached: true });
    }

    const labels = [BASE_LABEL, id];
    const labelQuery = encodeURIComponent(labels.join(","));
    const issues = await githubFetch<Array<{ number: number }>>(
      `/repos/${OWNER}/${REPO}/issues?state=all&labels=${labelQuery}&per_page=1`,
      token,
    );

    if (issues.length > 0) {
      cacheStore.__linxGitalkInitCache?.set(id, {
        issue: issues[0].number,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return NextResponse.json({ ok: true, created: false, issue: issues[0].number });
    }

    await ensureLabel(BASE_LABEL, "4f46e5", token);
    await ensureLabel(id, "0ea5e9", token);

    const issue = await githubFetch<{ number: number }>(`/repos/${OWNER}/${REPO}/issues`, token, {
      method: "POST",
      body: JSON.stringify({
        title: issueTitle(path),
        body: `Comment channel for https://rogerlinx.com${path}\n\nInitialized automatically by rogerlinx.com.`,
        labels,
      }),
    });

    cacheStore.__linxGitalkInitCache?.set(id, {
      issue: issue.number,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({ ok: true, created: true, issue: issue.number });
  } catch (error) {
    console.error("[api/gitalk-init] failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to initialize issue." }, { status: 500 });
  }
}
