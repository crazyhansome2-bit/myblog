"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, LogIn, LogOut, MessageCircle, NotebookPen, Pencil, Plus, Save, Trash2 } from "lucide-react";

type ContentType = "post" | "chatter" | "moment";
type ContentItem = {
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

const labels: Record<ContentType, string> = {
  post: "文章",
  chatter: "杂谈",
  moment: "说说",
};

const icons: Record<ContentType, typeof FileText> = {
  post: FileText,
  chatter: NotebookPen,
  moment: MessageCircle,
};

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

function emptyItem(type: ContentType): ContentItem {
  const date = today();
  return {
    type,
    slug: `${date}-new-entry`,
    title: "",
    date,
    description: "",
    tags: [],
    cover: "",
    mood: "",
    location: "",
    images: [],
    content: "",
  };
}

function arrayInput(values?: string[]) {
  return (values || []).join("\n");
}

function inputArray(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

export default function StudioClient() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [type, setType] = useState<ContentType>("post");
  const [items, setItems] = useState<Array<{ slug: string; title: string }>>([]);
  const [item, setItem] = useState<ContentItem>(() => emptyItem("post"));
  const [mode, setMode] = useState<"create" | "update">("create");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  const itemLabel = useMemo(() => labels[type], [type]);

  const checkSession = useCallback(async () => {
    const response = await fetch("/api/admin/session", { cache: "no-store" });
    if (!response.ok) {
      setAuthenticated(false);
      return;
    }
    const data = await response.json();
    setAuthenticated(Boolean(data.authenticated));
    setUsername(data.username || "");
    setShowWelcome(Boolean(data.showWelcome));
  }, []);

  const loadItems = useCallback(async (nextType: ContentType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/content?type=${nextType}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "无法读取内容列表。");
      setItems(data.items || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法读取内容列表。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void checkSession(); }, [checkSession]);
  useEffect(() => {
    if (!showWelcome) return;
    const timer = window.setTimeout(() => setShowWelcome(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showWelcome]);
  useEffect(() => {
    if (authenticated) void loadItems(type);
  }, [authenticated, loadItems, type]);

  const selectType = (nextType: ContentType) => {
    setType(nextType);
    setItem(emptyItem(nextType));
    setMode("create");
    setMessage("");
  };

  const startNew = () => {
    setItem(emptyItem(type));
    setMode("create");
    setMessage("");
  };

  const loadItem = async (slug: string) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/content?type=${type}&slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "无法读取内容。");
      setItem(data.item);
      setMode("update");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法读取内容。");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof ContentItem, value: string | string[]) => {
    setItem((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, item }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败。");
      setMessage("已提交到 GitHub，网站将在 Vercel 构建完成后自动更新。通常需要约一分钟。");
      setMode("update");
      await loadItems(type);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败。");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (mode !== "update" || !window.confirm(`确定删除这条${itemLabel}吗？此操作会提交到 GitHub。`)) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug: item.slug }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "删除失败。");
      setMessage("已提交删除，网站将在下一次自动部署后更新。");
      startNew();
      await loadItems(type);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败。");
    } finally {
      setLoading(false);
    }
  };

  if (authenticated === null) {
    return <main className="mx-auto min-h-[70vh] w-[90%] max-w-6xl pt-28 text-center text-slate-600 dark:text-slate-300">正在确认管理权限...</main>;
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-[78vh] w-[92%] max-w-2xl items-center justify-center pt-24">
        <section className="system-panel shore-auth relative w-full overflow-hidden border border-white/55 bg-white/58 p-8 text-center shadow-[0_24px_80px_rgba(15,45,70,.2)] backdrop-blur-xl dark:border-sky-200/15 dark:bg-[#102033]/84 dark:shadow-[0_24px_80px_rgba(0,12,24,.48)] md:p-12">
          <div className="pointer-events-none absolute inset-3 border border-sky-400/15 dark:border-cyan-200/10" />
          <div className="shore-butterfly pointer-events-none absolute -left-8 top-5 opacity-35" />
          <div className="shore-butterfly shore-butterfly-reverse pointer-events-none absolute -right-5 bottom-2 opacity-25" />
          <div className="pointer-events-none absolute left-0 top-0 h-px w-2/5 bg-sky-400/75 dark:bg-cyan-300/75" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-px w-2/5 bg-amber-300/85" />
          <div className="relative mx-auto mb-7 flex h-16 w-16 items-center justify-center border border-sky-400/55 bg-sky-400/10 text-sky-600 shadow-[0_0_35px_rgba(56,189,248,.2)] dark:border-cyan-200/50 dark:text-cyan-200">
            <Pencil size={30} strokeWidth={1.4} />
          </div>
          <p className="relative text-[10px] font-bold tracking-[0.35em] text-sky-700/75 dark:text-cyan-200/70">LINX // SHORELINE ARCHIVE</p>
          <h1 className="relative mt-4 text-3xl font-black tracking-[0.12em] text-slate-900 dark:text-white md:text-4xl">系统认证</h1>
          <p className="relative mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">漂泊者身份校验节点</p>
          <p className="relative mt-1 text-xs tracking-wider text-slate-500 dark:text-slate-400">仅接受已授权的 GitHub 账号</p>
          <a href="/api/admin/login" className="relative mt-8 inline-flex items-center gap-3 border border-sky-500/55 bg-sky-500/10 px-6 py-3 text-sm font-bold tracking-wider text-sky-800 transition-all hover:bg-sky-500/20 hover:shadow-[0_0_28px_rgba(56,189,248,.18)] dark:border-cyan-200/60 dark:text-cyan-100">
            <LogIn size={16} /> 开始身份认证
          </a>
          <div className="relative mt-7 flex items-center justify-center gap-2 text-[10px] tracking-widest text-amber-700/75 dark:text-amber-100/65"><span className="h-1.5 w-1.5 bg-amber-300" /> CONNECTION STANDBY</div>
        </section>
      </main>
    );
  }

  const Icon = icons[type];
  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04111a]/45 px-5 backdrop-blur-sm">
          <div className="system-panel relative w-full max-w-md overflow-hidden border border-cyan-200/45 bg-[#091b27]/95 px-7 py-10 text-center shadow-[0_24px_90px_rgba(0,12,24,.6)]">
            <div className="pointer-events-none absolute inset-3 border border-cyan-200/10" />
            <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-amber-200/70 text-amber-100"><span className="text-xl">✓</span></div>
            <p className="relative text-[10px] font-bold tracking-[0.32em] text-cyan-200/70">IDENTITY VERIFIED</p>
            <h2 className="relative mt-4 text-xl font-black leading-relaxed tracking-wider text-white md:text-2xl">认证成功，黑海岸终端等待你的下一条记录</h2>
            <p className="relative mt-5 text-xs leading-6 text-slate-400">终端权限已确认，内容节点现已开放。</p>
          </div>
        </div>
      )}
      <main className="mx-auto w-[94%] max-w-7xl pt-24 md:pt-28">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300/70 pb-5 dark:border-slate-700 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.28em] text-cyan-700 dark:text-cyan-200">SYSTEM AUTHENTICATION // CONTENT NODE</p>
          <h1 className="mt-1 text-3xl font-black tracking-wider text-slate-900 dark:text-white">系统认证</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>{username}</span>
          <a href="/studio/photos" className="border border-cyan-200/40 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-300/10 dark:text-cyan-100">相册管理</a>
          <a href="/api/admin/logout" title="退出登录" className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 bg-white/60 text-slate-600 hover:text-rose-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"><LogOut size={16} /></a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="system-panel border border-cyan-800/20 bg-[#0b1d29]/90 p-3 shadow-lg backdrop-blur-xl dark:border-cyan-200/15 dark:bg-[#091b27]/90">
          <div className="grid grid-cols-3 gap-1 lg:grid-cols-1">
            {(Object.keys(labels) as ContentType[]).map((entryType) => {
              const EntryIcon = icons[entryType];
              return <button key={entryType} onClick={() => selectType(entryType)} className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold transition-colors lg:justify-start ${type === entryType ? "bg-indigo-600 text-white dark:bg-sky-500" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}><EntryIcon size={16} />{labels[entryType]}</button>;
            })}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button onClick={startNew} className="flex w-full items-center justify-center gap-2 border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200"><Plus size={15} />新建{itemLabel}</button>
            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto lg:max-h-[52vh]">
              {items.map((entry) => <button key={entry.slug} onClick={() => void loadItem(entry.slug)} className={`block w-full truncate px-3 py-2 text-left text-xs transition-colors ${mode === "update" && item.slug === entry.slug ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:bg-white/80 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`} title={entry.slug}>{entry.title || entry.slug}</button>)}
              {!loading && items.length === 0 && <p className="px-2 py-3 text-xs text-slate-400">还没有{itemLabel}</p>}
            </div>
          </div>
        </aside>

        <section className="system-panel border border-cyan-800/20 bg-white/65 p-4 shadow-lg backdrop-blur-xl dark:border-cyan-200/15 dark:bg-[#091b27]/90 md:p-7">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <div className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white"><Icon size={19} className="text-indigo-600 dark:text-sky-300" />{mode === "create" ? `新建${itemLabel}` : `编辑${itemLabel}`}</div>
            <span className="text-xs text-slate-400">Markdown</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {type !== "moment" && <Field label="标题"><input value={item.title || ""} onChange={(event) => update("title", event.target.value)} className="studio-input" /></Field>}
            <Field label="日期"><input type="date" value={item.date.slice(0, 10)} onChange={(event) => update("date", event.target.value)} className="studio-input" /></Field>
            <Field label="链接标识"><input value={item.slug} onChange={(event) => update("slug", event.target.value)} placeholder="2026-08-06-entry-name" className="studio-input font-mono" /></Field>
            {type === "chatter" && <Field label="心情"><input value={item.mood || ""} onChange={(event) => update("mood", event.target.value)} className="studio-input" /></Field>}
            {type === "moment" && <Field label="地点"><input value={item.location || ""} onChange={(event) => update("location", event.target.value)} className="studio-input" /></Field>}
          </div>

          {type !== "moment" && <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="摘要"><input value={item.description || ""} onChange={(event) => update("description", event.target.value)} className="studio-input" /></Field>
            <Field label="标签，用逗号或换行分隔"><input value={arrayInput(item.tags)} onChange={(event) => update("tags", inputArray(event.target.value))} className="studio-input" /></Field>
            <div className="md:col-span-2"><Field label="封面图片链接"><input value={item.cover || ""} onChange={(event) => update("cover", event.target.value)} placeholder="/linx-style/example.jpg 或 https://..." className="studio-input" /></Field></div>
          </div>}
          {type === "moment" && <div className="mt-4"><Field label="图片链接，用逗号或换行分隔"><textarea value={arrayInput(item.images)} onChange={(event) => update("images", inputArray(event.target.value))} className="studio-input min-h-20" /></Field></div>}

          <div className="mt-4"><Field label="正文"><textarea value={item.content} onChange={(event) => update("content", event.target.value)} placeholder={type === "moment" ? "记录此刻..." : "支持 Markdown 格式"} className="studio-input min-h-80 font-mono text-sm leading-7" /></Field></div>

          {message && <p className="mt-4 border-l-2 border-indigo-500 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-sky-500/10 dark:text-sky-100">{message}</p>}
          <div className="mt-6 flex justify-between gap-3">
            {mode === "update" ? <button onClick={() => void remove()} disabled={loading} className="inline-flex items-center gap-2 border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-400/30 dark:hover:bg-rose-500/10"><Trash2 size={16} />删除</button> : <span />}
            <button onClick={() => void save()} disabled={loading} className="inline-flex items-center gap-2 bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-sky-500 dark:hover:bg-sky-400"><Save size={16} />{loading ? "处理中..." : "提交发布"}</button>
          </div>
        </section>
      </div>
      <style jsx>{`.system-panel { clip-path: polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%); } .shore-butterfly { width: 88px; height: 54px; background: linear-gradient(135deg, rgba(103,232,249,.75), rgba(56,189,248,.15)); clip-path: polygon(50% 48%, 12% 0, 0 44%, 34% 100%, 50% 62%, 66% 100%, 100% 44%, 88% 0); filter: drop-shadow(0 0 12px rgba(103,232,249,.45)); transform: rotate(-16deg); } .shore-butterfly-reverse { transform: rotate(152deg) scale(.82); } .studio-input { width: 100%; border: 1px solid rgba(79,127,164,.5); background: rgba(240,248,250,.7); padding: .65rem .75rem; color: #102a3a; outline: none; } .studio-input:focus { border-color: #67e8f9; box-shadow: 0 0 0 2px rgba(103,232,249,.16); } :global(.dark) .studio-input { border-color: rgba(125,211,252,.3); background: rgba(4,17,26,.72); color: #e2e8f0; }`}</style>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-slate-700 dark:text-slate-200"><span className="mb-1.5 block">{label}</span>{children}</label>;
}
