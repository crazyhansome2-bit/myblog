"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type CommentItem = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
  url: string;
};

type CommentsResponse = {
  configured: boolean;
  comments: CommentItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Comments() {
  const pathname = usePathname();
  const pagePath = useMemo(() => pathname.replace(/\/$/, "") || "/", [pathname]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isConfigured, setIsConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments?path=${encodeURIComponent(pagePath)}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as CommentsResponse;
      setIsConfigured(data.configured);
      setComments(data.comments || []);
    } catch {
      setStatus("留言通道暂时无法连接，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagePath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      setStatus("请先填写昵称和留言内容。");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pagePath,
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim(),
          website,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "留言发送失败");
      }

      setMessage("");
      setStatus("留言已写入终端记录。");
      await loadComments();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "留言发送失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mt-16 relative">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/45 p-5 md:p-7 shadow-xl backdrop-blur-xl">
          <div className="mb-5 text-center">
            <h4 className="text-lg md:text-2xl font-black tracking-widest text-slate-900 dark:text-white">
              终端留言通道
            </h4>
            <p className="mt-2 text-xs md:text-sm font-semibold text-slate-600 dark:text-sky-100">
              留下你的坐标、想法，或者友链申请。
            </p>
          </div>

          {!isConfigured ? (
            <div className="rounded-2xl border border-sky-200/70 dark:border-sky-300/20 bg-white/55 dark:bg-slate-950/45 px-5 py-4 text-center">
              <p className="text-sm md:text-base font-bold text-slate-800 dark:text-sky-50">
                留言服务等待接入：请在 Vercel 配置 GITHUB_TOKEN。
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={40}
                    placeholder="昵称"
                    className="rounded-2xl border border-white/50 dark:border-slate-700/60 bg-white/70 dark:bg-slate-950/50 px-4 py-3 text-sm font-bold text-slate-800 dark:text-sky-50 outline-none transition focus:border-indigo-400"
                  />
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    maxLength={80}
                    placeholder="联系方式，可选"
                    className="rounded-2xl border border-white/50 dark:border-slate-700/60 bg-white/70 dark:bg-slate-950/50 px-4 py-3 text-sm font-bold text-slate-800 dark:text-sky-50 outline-none transition focus:border-indigo-400"
                  />
                </div>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="写点什么..."
                  className="w-full rounded-2xl border border-white/50 dark:border-slate-700/60 bg-white/70 dark:bg-slate-950/50 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-800 dark:text-sky-50 outline-none transition focus:border-indigo-400"
                />
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="min-h-5 text-xs font-bold text-slate-600 dark:text-sky-100">
                    {status}
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-2.5 text-sm font-black tracking-widest text-white shadow-lg shadow-indigo-500/30 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "发送中..." : "发送留言"}
                  </button>
                </div>
              </form>

              <div className="mt-8 space-y-4">
                {isLoading ? (
                  <p className="text-center text-sm font-bold text-slate-600 dark:text-sky-100">
                    正在同步留言记录...
                  </p>
                ) : comments.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300/70 dark:border-slate-600/70 px-5 py-6 text-center text-sm font-bold text-slate-600 dark:text-sky-100">
                    暂无留言，来做第一个留下坐标的人。
                  </p>
                ) : (
                  comments.map((comment) => (
                    <article
                      key={comment.id}
                      className="rounded-2xl border border-white/45 dark:border-slate-700/55 bg-white/55 dark:bg-slate-950/40 p-4 text-left shadow-sm"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {comment.author}
                        </span>
                        <a
                          href={comment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-300"
                        >
                          {formatDate(comment.createdAt)}
                        </a>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        {comment.body}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
