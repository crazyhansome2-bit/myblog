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

    const renderGitalk = async () => {
      containerRef.current!.innerHTML = "";

      try {
        await fetch("/api/gitalk-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: pagePath }),
        });
      } catch {
        // Gitalk can still render and show the normal admin-init prompt.
      }

      if (cancelled || !containerRef.current) return;

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
      <div className="w-full mt-16 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none z-0" />
        <div className="relative z-10 custom-gitalk-glass pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="mx-auto max-w-2xl rounded-2xl border border-sky-200/70 dark:border-sky-300/20 bg-white/55 dark:bg-slate-900/45 px-5 py-4 text-center shadow-lg backdrop-blur-xl">
            <p className="text-sm md:text-base font-bold text-slate-800 dark:text-sky-50">
              留言通道等待接入：请配置 GitHub OAuth 登录。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-16 relative">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none z-0" />
      <div className="relative z-10 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/45 p-5 md:p-7 shadow-xl backdrop-blur-xl">
          <div className="mb-5 text-center">
            <h4 className="text-lg md:text-2xl font-black tracking-widest text-slate-900 dark:text-white">
              终端留言通道
            </h4>
            <p className="mt-2 text-xs md:text-sm font-semibold text-slate-600 dark:text-sky-100">
              使用 GitHub 登录后发言，留言会记录到站点仓库 Issue。
            </p>
          </div>
          <div ref={containerRef} className="custom-gitalk-glass" />
        </div>
      </div>

      <style jsx global>{`
        .custom-gitalk-glass .gt-container {
          color: inherit !important;
        }

        .custom-gitalk-glass .gt-container .gt-header-textarea {
          background: rgba(255, 255, 255, 0.68) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(99, 102, 241, 0.24) !important;
          border-radius: 16px !important;
          color: #0f172a !important;
          transition: all 0.3s ease;
        }

        .dark .custom-gitalk-glass .gt-container .gt-header-textarea {
          background: rgba(2, 6, 23, 0.52) !important;
          color: #e0f2fe !important;
          border-color: rgba(125, 211, 252, 0.22) !important;
        }

        .custom-gitalk-glass .gt-container .gt-header-textarea:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 18px rgba(99, 102, 241, 0.3) !important;
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
          background: rgba(255, 255, 255, 0.76) !important;
          color: #334155 !important;
          border: 1px solid rgba(148, 163, 184, 0.42) !important;
          box-shadow: none !important;
        }

        .dark .custom-gitalk-glass .gt-container .gt-btn-preview {
          background: rgba(15, 23, 42, 0.72) !important;
          color: #e0f2fe !important;
          border-color: rgba(148, 163, 184, 0.3) !important;
        }

        .custom-gitalk-glass .gt-container .gt-comment-content {
          background: rgba(255, 255, 255, 0.58) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(148, 163, 184, 0.26) !important;
          border-radius: 16px !important;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06) !important;
        }

        .dark .custom-gitalk-glass .gt-container .gt-comment-content {
          background: rgba(15, 23, 42, 0.48) !important;
          border-color: rgba(125, 211, 252, 0.16) !important;
        }

        .custom-gitalk-glass .gt-container .gt-comment-body,
        .custom-gitalk-glass .gt-container .gt-header-preview {
          color: #334155 !important;
        }

        .dark .custom-gitalk-glass .gt-container .gt-comment-body,
        .dark .custom-gitalk-glass .gt-container .gt-header-preview {
          color: #e2e8f0 !important;
        }

        .custom-gitalk-glass .gt-container a {
          color: #4f46e5 !important;
        }

        .dark .custom-gitalk-glass .gt-container a {
          color: #7dd3fc !important;
        }

        .custom-gitalk-glass .gt-container .gt-avatar {
          border-radius: 999px !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
