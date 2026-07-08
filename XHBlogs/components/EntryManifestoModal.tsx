"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const manifestoScenes = [
  {
    kicker: "WE BELIEVE",
    title: "热爱值得被保存",
    subtitle: "每一次灵感、每一个项目、每段生活片刻，都可以成为继续前进的坐标。",
  },
  {
    kicker: "WE RECORD",
    title: "记录会让冒险留下回声",
    subtitle: "文章、游戏、音乐和作品在这里相遇，慢慢组成属于 Linx 的个人终端。",
  },
  {
    kicker: "LINX TERMINAL",
    title: "欢迎进入",
    subtitle: "这里持续同步作品、文章、游戏兴趣与生活活动记录。",
  },
];

const sceneDuration = 2300;

export default function EntryManifestoModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    if (sceneIndex >= manifestoScenes.length - 1) {
      const closeTimer = window.setTimeout(() => setIsOpen(false), sceneDuration + 650);
      return () => window.clearTimeout(closeTimer);
    }

    const nextTimer = window.setTimeout(() => {
      setSceneIndex((current) => current + 1);
    }, sceneDuration);

    return () => window.clearTimeout(nextTimer);
  }, [isOpen, sceneIndex]);

  const scene = manifestoScenes[sceneIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] overflow-hidden bg-[#07111f] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(125,211,252,0.24),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,47,73,0.88)_48%,rgba(15,23,42,0.98))]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15"
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.22, 0.42, 0.22] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            animate={{ scale: [1.05, 0.96, 1.05], opacity: [0.16, 0.34, 0.16] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-5 top-5 z-20 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition hover:border-white/40 hover:text-white"
          >
            跳过
          </button>

          <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={sceneIndex}
                className="mx-auto flex max-w-5xl flex-col items-center text-center"
                initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -22, filter: "blur(8px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.p
                  className="mb-5 text-[11px] font-black uppercase tracking-[0.42em] text-cyan-200/80 sm:text-xs"
                  initial={{ opacity: 0, letterSpacing: "0.24em" }}
                  animate={{ opacity: 1, letterSpacing: "0.42em" }}
                  transition={{ duration: 0.9, delay: 0.12 }}
                >
                  {scene.kicker}
                </motion.p>

                <motion.h2
                  className="max-w-4xl text-balance text-4xl font-black leading-tight tracking-widest text-white drop-shadow-[0_0_28px_rgba(125,211,252,0.28)] sm:text-6xl md:text-7xl"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, delay: 0.28, ease: "easeOut" }}
                >
                  {scene.title}
                </motion.h2>

                <motion.div
                  className="my-8 h-px w-24 bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 128 }}
                  transition={{ duration: 0.7, delay: 0.52 }}
                />

                <motion.p
                  className="max-w-2xl text-sm font-semibold leading-8 tracking-[0.08em] text-white/72 sm:text-base"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.62 }}
                >
                  {scene.subtitle}
                </motion.p>
              </motion.section>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {manifestoScenes.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === sceneIndex ? "w-8 bg-cyan-200" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
