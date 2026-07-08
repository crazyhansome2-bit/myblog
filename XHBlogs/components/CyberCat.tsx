"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Fish, MessageCircle, SendHorizontal } from "lucide-react";
import catSprite from "./siamese-cat.png";

type CatMood = "idle" | "petted" | "thinking";

const idleLines = [
  "喵呜~ 今天也要好好写代码。",
  "小鱼干呢？本喵已经等很久了。",
  "别只看网页，也看看本喵。",
  "摸摸头可以，别弄乱毛。",
  "本喵正在巡逻这个网站。",
];

export default function CyberCat() {
  const [mood, setMood] = useState<CatMood>("idle");
  const [speech, setSpeech] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = (text: string, duration = 5200) => {
    setSpeech(text);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setSpeech(null), duration);
  };

  const setTemporaryMood = (nextMood: CatMood, duration = 1600) => {
    setMood(nextMood);
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    moodTimerRef.current = setTimeout(() => setMood("idle"), duration);
  };

  const handlePetCat = () => {
    if (isThinking) return;
    setTemporaryMood("petted");
    speak("呼噜呼噜... 摸得还不错喵~", 2600);
  };

  const handleFeed = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isThinking) return;

    setShowInput(false);
    setIsThinking(true);
    setMood("thinking");
    speak("收到小鱼干，本喵思考一下怎么夸你。", 6500);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "我刚刚喂了你一条美味的小鱼干！你有什么表示？" }),
      });

      if (!response.ok) throw new Error("Chat API failed");

      const data = await response.json();
      speak(data.reply || "小鱼干不错，本喵认可你了喵~", 8000);
    } catch {
      speak("小鱼干很好吃，但本喵的信号有点卡喵。", 4200);
    } finally {
      setIsThinking(false);
      setMood("idle");
    }
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = inputValue.trim();
    if (!message || isThinking) return;

    setInputValue("");
    setShowInput(false);
    setIsThinking(true);
    setMood("thinking");
    speak("让本喵想想。", 9000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error("Chat API failed");

      const data = await response.json();
      speak(data.reply || "本喵听到了。", 8000);
    } catch {
      speak("网络好像打结了，晚点再来找本喵。", 4200);
    } finally {
      setIsThinking(false);
      setMood("idle");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!speech && !showInput && !isThinking && Math.random() > 0.82) {
        speak(idleLines[Math.floor(Math.random() * idleLines.length)], 4200);
      }
    }, 18000);

    return () => {
      clearInterval(interval);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, [speech, showInput, isThinking]);

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.08}
      dragMomentum={false}
      whileDrag={{ scale: 1.04, cursor: "grabbing" }}
      className="fixed bottom-24 right-10 z-[9998] flex flex-col items-center cursor-grab active:cursor-grabbing"
    >
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            className="mb-3 max-w-[230px] rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-center text-sm font-bold leading-relaxed text-slate-700 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100"
            style={{ pointerEvents: "none" }}
          >
            {speech}
            <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/70 bg-white/90 dark:border-white/10 dark:bg-slate-900/90" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        <div className="absolute -left-9 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5 rounded-full border border-white/45 bg-slate-900/20 p-1 shadow-xl shadow-slate-900/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowInput((value) => !value);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-900/20 transition hover:scale-105 hover:bg-sky-400 active:scale-95"
            title="和煤球聊天"
            aria-label="和煤球聊天"
          >
            <MessageCircle size={16} fill="currentColor" strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={handleFeed}
            onPointerDown={(event) => event.stopPropagation()}
            disabled={isThinking}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-900/20 transition hover:scale-105 hover:bg-cyan-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
            title="喂小鱼干"
            aria-label="喂小鱼干"
          >
            <Fish size={16} strokeWidth={2.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={handlePetCat}
          onPointerDown={(event) => event.stopPropagation()}
          className="cat-shell relative h-[94px] w-[108px] cursor-pointer overflow-visible rounded-3xl border border-white/45 bg-white/25 shadow-2xl shadow-slate-950/20 backdrop-blur-md transition hover:scale-[1.02] active:scale-95 dark:border-white/10 dark:bg-slate-900/25"
          aria-label="摸摸煤球"
        >
          <span className="absolute inset-x-5 bottom-2 h-5 rounded-full bg-slate-900/25 blur-xl" />
          <span className={`cat-sprite ${mood === "petted" ? "cat-petted" : mood === "thinking" ? "cat-thinking" : "cat-idle"}`} />
        </button>
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.form
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.94 }}
            onSubmit={handleChatSubmit}
            onPointerDown={(event) => event.stopPropagation()}
            className="absolute -bottom-14 flex w-64 items-center rounded-full border border-white/60 bg-white/90 p-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="跟煤球说点什么..."
              className="w-full bg-transparent px-3 py-1.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
              disabled={isThinking}
              autoFocus
            />
            <button
              type="submit"
              disabled={isThinking || !inputValue.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              aria-label="发送"
            >
              <SendHorizontal size={16} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <style jsx>{`
        .cat-sprite {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 108px;
          height: 96px;
          transform: translate(-50%, -50%);
          background-image: url(${catSprite.src});
          background-size: 506px 506px;
          background-repeat: no-repeat;
          background-position: -47px -31px;
          image-rendering: pixelated;
          filter: drop-shadow(0 14px 18px rgba(15, 23, 42, 0.22));
        }

        .cat-idle {
          animation: cat-idle 3.2s ease-in-out infinite;
        }

        .cat-petted {
          background-position: -47px -205px;
          animation: cat-petted 0.55s ease-in-out infinite;
        }

        .cat-thinking {
          background-position: -216px -37px;
          animation: cat-thinking 1.1s ease-in-out infinite;
        }

        @keyframes cat-idle {
          0%,
          100% {
            transform: translate(-50%, -50%);
          }
          50% {
            transform: translate(-50%, calc(-50% - 5px));
          }
        }

        @keyframes cat-petted {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.04);
          }
        }

        @keyframes cat-thinking {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-1deg);
          }
          50% {
            transform: translate(-50%, -50%) rotate(1deg);
          }
        }
      `}</style>
    </motion.div>
  );
}
