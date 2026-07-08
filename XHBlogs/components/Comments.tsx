"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Gitalk from "gitalk";
import "gitalk/dist/gitalk.css";

import { siteConfig } from "../siteConfig";

export default function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const hasGitalkConfig = Boolean(
    siteConfig.gitalkConfig.clientID &&
      siteConfig.gitalkConfig.repo &&
      siteConfig.gitalkConfig.owner &&
      siteConfig.gitalkConfig.admin?.some(Boolean),
  );

  useEffect(() => {
    if (!hasGitalkConfig || !containerRef.current) return;

    let cancelled = false;
    const pagePath = pathname.replace(/\/$/, "") || "/";
    const initKey = `linx:gitalk:init:${pagePath}`;

    const mountGitalk = () => {
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";

      const gitalk = new Gitalk({
        clientID: siteConfig.gitalkConfig.clientID,
        clientSecret: siteConfig.gitalkConfig.clientSecret,
        repo: siteConfig.gitalkConfig.repo,
        owner: siteConfig.gitalkConfig.owner,
        admin: siteConfig.gitalkConfig.admin,
        proxy: "/api/github",
        id: pagePath.substring(0, 49),
        distractionFreeMode: false,
        createIssueManually: false,
      });

      gitalk.render(containerRef.current);
    };

    const initIssue = async () => {
      const res = await fetch("/api/gitalk-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pagePath }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data?.ok) {
        window.localStorage.setItem(initKey, "1");
        return Boolean(data.created);
      }

      return false;
    };

    const renderGitalk = async () => {
      if (window.localStorage.getItem(initKey)) {
        mountGitalk();
        return;
      }

      mountGitalk();
      const initPromise = initIssue().catch(() => false);

      initPromise.then((created) => {
        if (created && !cancelled) mountGitalk();
      });
    };

    renderGitalk();

    const url = new URL(window.location.href);
    if (url.searchParams.has("code")) {
      url.searchParams.delete("code");
      window.history.replaceState({}, document.title, url.toString());
    }

    return () => {
      cancelled = true;
    };
  }, [pathname, hasGitalkConfig]);

  if (!hasGitalkConfig) {
    return (
      <section className="relative mt-16 w-full">
        <div className="absolute -top-10 left-1/2 z-0 h-32 w-3/4 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none dark:bg-indigo-500/20" />
        <div className="relative z-10 border-t border-slate-200/50 pt-6 dark:border-slate-700/50">
          <div className="mx-auto max-w-2xl rounded-2xl border border-sky-200/70 bg-white/55 px-5 py-4 text-center shadow-lg backdrop-blur-xl dark:border-sky-300/20 dark:bg-slate-900/45">
            <p className="text-sm font-bold text-slate-800 md:text-base dark:text-sky-50">
              留言通道等待接入：请配置 GitHub OAuth 登录。
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mt-16 w-full">
      <div className="absolute -top-10 left-1/2 z-0 h-32 w-3/4 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none dark:bg-indigo-500/20" />

      <div className="relative z-10 border-t border-slate-200/50 pt-7 dark:border-slate-700/50">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <h4 className="text-xl font-black tracking-[0.22em] text-slate-900 md:text-2xl dark:text-white">
              星港回声
            </h4>
          </div>

          <div ref={containerRef} className="custom-gitalk-glass" />
        </div>
      </div>

      <style jsx global>{`
        .custom-gitalk-glass .gt-container {
          color: inherit !important;
          font-family: inherit !important;
        }

        .custom-gitalk-glass .gt-container .gt-meta {
          border-bottom-color: rgba(148, 163, 184, 0.45) !important;
        }

        .custom-gitalk-glass .gt-container .gt-counts,
        .custom-gitalk-glass .gt-container .gt-user .gt-ico-text {
          color: #e0f2fe !important;
        }

        .custom-gitalk-glass .gt-container .gt-header-textarea {
          background: rgba(15, 23, 42, 0.42) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(125, 211, 252, 0.22) !important;
          border-radius: 16px !important;
          color: #e0f2fe !important;
          min-height: 88px !important;
          transition: all 0.3s ease;
        }

        .custom-gitalk-glass .gt-container .gt-header-textarea:focus {
          background: rgba(15, 23, 42, 0.58) !important;
          border-color: #7dd3fc !important;
          box-shadow: 0 0 18px rgba(14, 165, 233, 0.28) !important;
        }

        .custom-gitalk-glass .gt-container .gt-header-textarea::placeholder {
          color: rgba(226, 232, 240, 0.52) !important;
        }

        .custom-gitalk-glass .gt-container .gt-btn {
          background: linear-gradient(90deg, #6366f1, #0ea5e9) !important;
          border: none !important;
          border-radius: 999px !important;
          color: white !important;
          box-shadow: 0 10px 28px rgba(99, 102, 241, 0.28) !important;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .custom-gitalk-glass .gt-container .gt-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(14, 165, 233, 0.34) !important;
        }

        .custom-gitalk-glass .gt-container .gt-btn-preview {
          background: rgba(15, 23, 42, 0.72) !important;
          color: #e0f2fe !important;
          border: 1px solid rgba(148, 163, 184, 0.3) !important;
          box-shadow: none !important;
        }

        .custom-gitalk-glass .gt-container .gt-comment-content {
          background: rgba(15, 23, 42, 0.36) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(125, 211, 252, 0.16) !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08) !important;
        }

        .custom-gitalk-glass .gt-container .gt-comment-body,
        .custom-gitalk-glass .gt-container .gt-header-preview {
          color: #e2e8f0 !important;
        }

        .custom-gitalk-glass .gt-container a {
          color: #7dd3fc !important;
        }

        .custom-gitalk-glass .gt-container .gt-avatar {
          border-radius: 999px !important;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
