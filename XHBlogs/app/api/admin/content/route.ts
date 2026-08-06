import { NextRequest, NextResponse } from "next/server";
import { getAdminConfig, requireAdmin } from "@/lib/admin";
import { contentPath, contentToMarkdown, githubRequest, isContentType, markdownToContent, readGithubFile, validateContent } from "@/lib/content-admin";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "请先使用授权的 GitHub 账号登录。" }, { status: 401 });
}

function contentConfig() {
  const { repository, contentToken } = getAdminConfig();
  return repository && contentToken ? { repository, contentToken } : null;
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  const config = contentConfig();
  if (!config) return NextResponse.json({ error: "后台内容写入尚未完成部署配置。" }, { status: 503 });

  const type = request.nextUrl.searchParams.get("type");
  const slug = request.nextUrl.searchParams.get("slug");
  if (!isContentType(type)) return NextResponse.json({ error: "内容类型不正确。" }, { status: 400 });

  if (slug) {
    const file = await readGithubFile(config.repository, config.contentToken, contentPath(type, slug));
    if (!file.response.ok || !file.markdown) return NextResponse.json({ error: "未找到该内容。" }, { status: file.response.status });
    return NextResponse.json({ item: markdownToContent(type, slug, file.markdown) });
  }

  const directory = type === "post" ? "posts" : type === "chatter" ? "chatters" : "moments";
  const response = await githubRequest(config.repository, config.contentToken, directory);
  if (!response.ok) return NextResponse.json({ error: "无法读取内容列表。" }, { status: response.status });
  const files = await response.json() as Array<{ name: string; type: string }>;
  return NextResponse.json({
    items: files
      .filter((file) => file.type === "file" && file.name.endsWith(".md"))
      .map((file) => ({ slug: file.name.replace(/\.md$/, ""), title: file.name.replace(/\.md$/, "") })),
  });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  const config = contentConfig();
  if (!config) return NextResponse.json({ error: "后台内容写入尚未完成部署配置。" }, { status: 503 });

  try {
    const payload = await request.json() as { action?: string; item?: unknown };
    const validation = validateContent(payload.item);
    if (!validation.item) return NextResponse.json({ error: validation.error }, { status: 400 });
    const item = validation.item;
    const path = contentPath(item.type, item.slug);
    const current = await readGithubFile(config.repository, config.contentToken, path);

    if (payload.action === "create" && current.response.ok) {
      return NextResponse.json({ error: "这个链接标识已经存在，请换一个。" }, { status: 409 });
    }
    if (payload.action === "update" && !current.response.ok) {
      return NextResponse.json({ error: "原内容不存在，无法更新。" }, { status: 404 });
    }
    if (payload.action !== "create" && payload.action !== "update") {
      return NextResponse.json({ error: "操作不正确。" }, { status: 400 });
    }

    const response = await githubRequest(config.repository, config.contentToken, path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `${payload.action === "create" ? "Publish" : "Update"} ${item.type}: ${item.slug}`,
        content: Buffer.from(contentToMarkdown(item), "utf8").toString("base64"),
        ...(current.file?.sha ? { sha: current.file.sha } : {}),
      }),
    });
    if (!response.ok) {
      console.error("[admin] GitHub write failed:", await response.text());
      return NextResponse.json({ error: "GitHub 未能保存这次修改。" }, { status: response.status });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin] Content write failed:", error);
    return NextResponse.json({ error: "保存失败，请稍后再试。" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  const config = contentConfig();
  if (!config) return NextResponse.json({ error: "后台内容写入尚未完成部署配置。" }, { status: 503 });

  try {
    const payload = await request.json() as { type?: unknown; slug?: unknown };
    if (!isContentType(payload.type) || typeof payload.slug !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,110}$/.test(payload.slug)) {
      return NextResponse.json({ error: "删除参数不正确。" }, { status: 400 });
    }
    const path = contentPath(payload.type, payload.slug);
    const current = await readGithubFile(config.repository, config.contentToken, path);
    if (!current.response.ok || !current.file) return NextResponse.json({ error: "原内容不存在。" }, { status: 404 });

    const response = await githubRequest(config.repository, config.contentToken, path, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Delete ${payload.type}: ${payload.slug}`, sha: current.file.sha }),
    });
    if (!response.ok) return NextResponse.json({ error: "GitHub 未能删除这条内容。" }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin] Content delete failed:", error);
    return NextResponse.json({ error: "删除失败，请稍后再试。" }, { status: 500 });
  }
}
