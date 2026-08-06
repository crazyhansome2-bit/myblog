import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminConfig, requireAdmin } from "@/lib/admin";
import { githubRequest } from "@/lib/content-admin";

export const runtime = "nodejs";

const maxUploadBytes = 900 * 1024;

function getWriteConfig() {
  const { repository, contentToken } = getAdminConfig();
  return repository && contentToken ? { repository, contentToken } : null;
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: "请先完成系统认证。" }, { status: 401 });
  const config = getWriteConfig();
  if (!config) return NextResponse.json({ error: "图片上传尚未完成部署配置。" }, { status: 503 });

  try {
    const formData = await request.formData();
    const albumId = formData.get("albumId");
    const file = formData.get("file");
    if (typeof albumId !== "string" || !/^[a-z0-9][a-z0-9-]{0,60}$/.test(albumId)) {
      return NextResponse.json({ error: "请先填写有效的相册标识。" }, { status: 400 });
    }
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "只支持 JPG、PNG 和 WebP 图片。" }, { status: 400 });
    }
    if (file.size === 0 || file.size > maxUploadBytes) {
      return NextResponse.json({ error: "图片需压缩至 900KB 以内后再上传。" }, { status: 400 });
    }

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const path = `public/photowall/${albumId}/${filename}`;
    const response = await githubRequest(config.repository, config.contentToken, path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Upload photo for ${albumId}`,
        content: Buffer.from(await file.arrayBuffer()).toString("base64"),
      }),
    });
    if (!response.ok) {
      console.error("[admin] Photo upload failed:", await response.text());
      return NextResponse.json({ error: "GitHub 未能上传图片。" }, { status: response.status });
    }
    return NextResponse.json({ url: `/photowall/${albumId}/${filename}` });
  } catch (error) {
    console.error("[admin] Photo upload failed:", error);
    return NextResponse.json({ error: "上传失败，请稍后再试。" }, { status: 500 });
  }
}
