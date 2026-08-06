"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Gitalk from "gitalk";
import "gitalk/dist/gitalk.css";
import { siteConfig } from "../siteConfig";

export default function LabComments({ pageId }: { pageId?: string }) {
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
    const id = (pageId || pathname.replace(/\/$/, "") || "/").substring(0, 49);
    const initKey = `linx:gitalk:init:${id}`;

    const mount = () => {
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      new Gitalk({
        clientID: siteConfig.gitalkConfig.clientID,
        clientSecret: siteConfig.gitalkConfig.clientSecret,
        repo: siteConfig.gitalkConfig.repo,
        owner: siteConfig.gitalkConfig.owner,
        admin: siteConfig.gitalkConfig.admin,
        proxy: "/api/github",
        id,
        distractionFreeMode: false,
        createIssueManually: false,
      }).render(containerRef.current);
    };

    const initialize = async () => {
      if (window.localStorage.getItem(initKey)) return false;
      const response = await fetch("/api/gitalk-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/tree", id }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) return false;
      window.localStorage.setItem(initKey, "1");
      return Boolean(data.created);
    };

    mount();
    initialize().then((created) => {
      if (created && !cancelled) mount();
    }).catch(() => undefined);

    const url = new URL(window.location.href);
    if (url.searchParams.has("code")) {
      url.searchParams.delete("code");
      window.history.replaceState({}, document.title, url.toString());
    }
    return () => { cancelled = true; };
  }, [pathname, pageId, hasGitalkConfig]);

  if (!hasGitalkConfig) return null;

  return (
    <section className="tree-gitalk relative mt-16 w-full">
      <div className="relative border-t border-slate-200/50 pt-7 dark:border-slate-700/50">
        <div className="mb-6 text-center"><h4 className="text-xl font-black tracking-[0.22em] text-slate-900 md:text-2xl dark:text-white">星港回响</h4></div>
        <div ref={containerRef} />
      </div>
      <style jsx global>{`
        .tree-gitalk .gt-container { color: inherit !important; font-family: inherit !important; }
        .tree-gitalk .gt-container .gt-meta { border-bottom-color: rgba(148,163,184,.45) !important; }
        .tree-gitalk .gt-container .gt-counts, .tree-gitalk .gt-container .gt-user .gt-ico-text { color: #e0f2fe !important; }
        .tree-gitalk .gt-container .gt-header-textarea { min-height: 88px !important; border: 1px solid rgba(125,211,252,.22) !important; border-radius: 12px !important; background: rgba(15,23,42,.42) !important; color: #e0f2fe !important; }
        .tree-gitalk .gt-container .gt-header-textarea:focus { border-color: #7dd3fc !important; background: rgba(15,23,42,.58) !important; box-shadow: 0 0 18px rgba(14,165,233,.28) !important; }
        .tree-gitalk .gt-container .gt-btn { border: none !important; border-radius: 8px !important; background: #4f7fa4 !important; color: white !important; box-shadow: 0 8px 22px rgba(79,127,164,.28) !important; }
        .tree-gitalk .gt-container .gt-comment-content { border: 1px solid rgba(125,211,252,.16) !important; border-radius: 12px !important; background: rgba(15,23,42,.36) !important; }
        .tree-gitalk .gt-container .gt-comment-body, .tree-gitalk .gt-container .gt-header-preview { color: #e2e8f0 !important; }
        .tree-gitalk .gt-container .gt-avatar { overflow: hidden; border-radius: 999px !important; }
        .tree-gitalk .gt-container a { color: #7dd3fc !important; }
      `}</style>
    </section>
  );
}
