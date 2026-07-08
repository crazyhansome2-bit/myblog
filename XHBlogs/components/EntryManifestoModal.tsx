"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { siteConfig } from "../siteConfig";

const manifestos = siteConfig.manifestos?.length ? siteConfig.manifestos : [siteConfig.bio];

export default function EntryManifestoModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [manifesto, setManifesto] = useState(manifestos[0]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setManifesto(manifestos[Math.floor(Math.random() * manifestos.length)]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-sm"
            aria-label="关闭进站宣言"
            onClick={() => setIsOpen(false)}
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-manifesto-title"
            className="relative w-full max-w-lg overflow-hidden rounded-lg border border-white/45 bg-white/88 p-5 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/88 dark:text-white sm:p-6"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-400" />

            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-500 dark:text-indigo-300">
                    Linx Terminal
                  </p>
                  <h2 id="entry-manifesto-title" className="text-base font-black sm:text-lg">
                    进站宣言
                  </h2>
                </div>
              </div>

              <button
                type="button"
                aria-label="关闭"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white/70 text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div suppressHydrationWarning className="whitespace-pre-line border-l-2 border-indigo-400/70 pl-4 font-serif text-sm font-semibold leading-8 text-slate-700 dark:text-slate-200 sm:text-base">
              {manifesto}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-sm font-black text-white shadow-lg transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200"
              >
                进入站点
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
