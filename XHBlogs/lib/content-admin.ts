import matter from "gray-matter";

export type ContentType = "post" | "chatter" | "moment";

export type ManagedContent = {
  type: ContentType;
  slug: string;
  title?: string;
  date: string;
  description?: string;
  tags?: string[];
  cover?: string;
  mood?: string;
  location?: string;
  images?: string[];
  content: string;
};

type GithubContent = {
  sha: string;
  content: string;
  encoding: string;
};

const contentTypes: ContentType[] = ["post", "chatter", "moment"];
const maxContentLength = 50000;

export function isContentType(value: unknown): value is ContentType {
  return typeof value === "string" && contentTypes.includes(value as ContentType);
}

export function contentPath(type: ContentType, slug: string) {
  const directory = type === "post" ? "posts" : type === "chatter" ? "chatters" : "moments";
  return `${directory}/${slug}.md`;
}

export function validateContent(value: unknown): { item?: ManagedContent; error?: string } {
  if (!value || typeof value !== "object") return { error: "内容格式不正确。" };
  const input = value as Record<string, unknown>;
  if (!isContentType(input.type)) return { error: "内容类型不正确。" };

  const slug = typeof input.slug === "string" ? input.slug.trim() : "";
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,110}$/.test(slug)) {
    return { error: "链接标识只能使用字母、数字、点、下划线和短横线。" };
  }

  const date = typeof input.date === "string" ? input.date.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}(?:[T ][\d:.+-]+)?$/.test(date) || Number.isNaN(new Date(date).getTime())) {
    return { error: "请填写有效日期。" };
  }

  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (!content) return { error: "正文不能为空。" };
  if (content.length > maxContentLength) return { error: "正文过长，请控制在 5 万字符以内。" };

  const text = (key: string, limit = 300) => {
    const result = typeof input[key] === "string" ? input[key].trim() : "";
    return result.slice(0, limit);
  };
  const list = (key: string, limit: number) => Array.isArray(input[key])
    ? input[key].filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, limit)
    : [];

  const title = text("title", 160);
  if (input.type !== "moment" && !title) return { error: "标题不能为空。" };

  return {
    item: {
      type: input.type,
      slug,
      date,
      title,
      description: text("description", 400),
      tags: list("tags", 12).map((tag) => tag.slice(0, 40)),
      cover: text("cover", 1000),
      mood: text("mood", 80),
      location: text("location", 160),
      images: list("images", 9).map((image) => image.slice(0, 1000)),
      content,
    },
  };
}

export function contentToMarkdown(item: ManagedContent) {
  const data: Record<string, unknown> = { date: item.date };
  if (item.type !== "moment") {
    data.title = item.title;
    if (item.description) data.description = item.description;
    if (item.tags?.length) data.tags = item.tags;
    if (item.cover) data.cover = item.cover;
    if (item.type === "chatter" && item.mood) data.mood = item.mood;
  } else {
    if (item.location) data.location = item.location;
    if (item.images?.length) data.images = item.images;
  }
  return matter.stringify(`${item.content.trim()}\n`, data);
}

export function markdownToContent(type: ContentType, slug: string, markdown: string): ManagedContent {
  const { data, content } = matter(markdown);
  return {
    type,
    slug,
    title: typeof data.title === "string" ? data.title : "",
    date: typeof data.date === "string" ? data.date : String(data.date || ""),
    description: typeof data.description === "string" ? data.description : "",
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
    cover: typeof data.cover === "string" ? data.cover : "",
    mood: typeof data.mood === "string" ? data.mood : "",
    location: typeof data.location === "string" ? data.location : "",
    images: Array.isArray(data.images) ? data.images.filter((image): image is string => typeof image === "string") : [],
    content: content.trim(),
  };
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function githubPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function githubRequest(repository: string, token: string, path: string, init?: RequestInit) {
  return fetch(`https://api.github.com/repos/${repository}/contents/${githubPath(path)}`, {
    ...init,
    headers: { ...githubHeaders(token), ...(init?.headers || {}) },
    cache: "no-store",
  });
}

export async function readGithubFile(repository: string, token: string, path: string) {
  const response = await githubRequest(repository, token, path);
  if (!response.ok) return { response };
  const file = await response.json() as GithubContent;
  const markdown = Buffer.from(file.content.replace(/\n/g, ""), file.encoding as BufferEncoding).toString("utf8");
  return { response, file, markdown };
}
