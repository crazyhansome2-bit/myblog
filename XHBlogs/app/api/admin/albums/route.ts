import { NextRequest, NextResponse } from "next/server";
import { getAdminConfig, requireAdmin } from "@/lib/admin";
import { githubRequest, readGithubFile } from "@/lib/content-admin";

export const runtime = "nodejs";

type Photo = { url: string; caption?: string };
type Album = { id: string; title: string; description: string; cover: string; date: string; photos: Photo[] };

const albumPath = "data/albums.json";

function unauthorized() {
  return NextResponse.json({ error: "请先完成系统认证。" }, { status: 401 });
}

function getWriteConfig() {
  const { repository, contentToken } = getAdminConfig();
  return repository && contentToken ? { repository, contentToken } : null;
}

function isImageUrl(value: unknown) {
  return typeof value === "string" && value.length <= 1200 && (value.startsWith("/") || /^https:\/\//.test(value));
}

function validateAlbums(value: unknown): { albums?: Album[]; error?: string } {
  if (!Array.isArray(value) || value.length > 50) return { error: "相册数据不正确。" };
  const ids = new Set<string>();
  const albums: Album[] = [];

  for (const source of value) {
    if (!source || typeof source !== "object") return { error: "相册格式不正确。" };
    const item = source as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id.trim() : "";
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const description = typeof item.description === "string" ? item.description.trim() : "";
    const cover = typeof item.cover === "string" ? item.cover.trim() : "";
    const date = typeof item.date === "string" ? item.date.trim() : "";
    if (!/^[a-z0-9][a-z0-9-]{0,60}$/.test(id) || ids.has(id)) return { error: "相册标识只能使用小写字母、数字和短横线，且不能重复。" };
    if (!title || title.length > 80 || description.length > 300 || !/^\d{4}\.\d{2}$/.test(date)) return { error: "请检查相册名称、描述和日期。" };
    if (!Array.isArray(item.photos) || item.photos.length === 0 || item.photos.length > 100 || !isImageUrl(cover)) return { error: "每个相册至少需要一张照片和有效封面。" };

    const photos: Photo[] = [];
    for (const photo of item.photos) {
      if (!photo || typeof photo !== "object") return { error: "照片格式不正确。" };
      const input = photo as Record<string, unknown>;
      if (!isImageUrl(input.url)) return { error: "照片链接无效。" };
      const caption = typeof input.caption === "string" ? input.caption.trim().slice(0, 160) : "";
      photos.push({ url: input.url.trim(), ...(caption ? { caption } : {}) });
    }
    ids.add(id);
    albums.push({ id, title, description, cover, date, photos });
  }
  return { albums };
}

async function loadAlbums(repository: string, token: string) {
  const file = await readGithubFile(repository, token, albumPath);
  if (!file.response.ok || !file.markdown || !file.file) return { error: file.response.status === 404 ? "相册数据文件不存在。" : "无法读取相册数据。", status: file.response.status };
  try {
    const albums = JSON.parse(file.markdown) as unknown;
    const validation = validateAlbums(albums);
    if (!validation.albums) return { error: "相册数据格式异常。", status: 500 };
    return { albums: validation.albums, sha: file.file.sha };
  } catch {
    return { error: "相册数据无法解析。", status: 500 };
  }
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  const config = getWriteConfig();
  if (!config) return NextResponse.json({ error: "图片管理尚未完成部署配置。" }, { status: 503 });
  const result = await loadAlbums(config.repository, config.contentToken);
  if (!result.albums) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ albums: result.albums });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return unauthorized();
  const config = getWriteConfig();
  if (!config) return NextResponse.json({ error: "图片管理尚未完成部署配置。" }, { status: 503 });

  try {
    const payload = await request.json() as { albums?: unknown };
    const validation = validateAlbums(payload.albums);
    if (!validation.albums) return NextResponse.json({ error: validation.error }, { status: 400 });
    const current = await loadAlbums(config.repository, config.contentToken);
    if (!current.sha) return NextResponse.json({ error: current.error }, { status: current.status });

    const response = await githubRequest(config.repository, config.contentToken, albumPath, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update photo albums",
        content: Buffer.from(`${JSON.stringify(validation.albums, null, 2)}\n`, "utf8").toString("base64"),
        sha: current.sha,
      }),
    });
    if (!response.ok) {
      console.error("[admin] Album save failed:", await response.text());
      return NextResponse.json({ error: "GitHub 未能保存相册。" }, { status: response.status });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin] Album save failed:", error);
    return NextResponse.json({ error: "保存相册失败，请稍后再试。" }, { status: 500 });
  }
}
