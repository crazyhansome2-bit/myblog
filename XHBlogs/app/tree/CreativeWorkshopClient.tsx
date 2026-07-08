"use client";

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Rocket, Waves } from 'lucide-react';
import { siteConfig } from '../../siteConfig'; // 🌟 引入站点配置

import AlchemyLab from './AlchemyLab';
import DijiangModel from './DijiangModel';
// import OperatorRecreation from './OperatorRecreation'; // 🌟 先注释掉，以后需要随时可以加回来

type WorkshopItem = {
  id?: string;
  slug?: string;
  title?: string;
  type?: string;
  date?: string;
  cover?: string | null;
  content?: string;
};

type CreativeWorkshopProps = {
  posts?: WorkshopItem[];
  chatters?: WorkshopItem[];
  moments?: WorkshopItem[];
};

export default function CreativeWorkshopClient({ posts = [], chatters = [], moments = [] }: CreativeWorkshopProps) {
  const [currentMode, setCurrentMode] = useState<'alchemy' | 'model'>('alchemy'); // 🌟 暂时只保留两个状态

  // =========================================================
  // 🌟 [现实主义] 饱和渐近经验升级系统 (无限等级，难度封顶)
  // =========================================================
  useEffect(() => {
    // 🌟 拦截开关：如果站长在配置中关闭了等级系统，则直接退出，不消耗任何性能！
    if (!siteConfig.enableLevelSystem) return;

    try {
      // 1. 基础内容经验结算
      const postsExp = posts.length * 50;
      const chattersExp = chatters.length * 20;
      const momentsExp = moments.length * 10;
      const contentExp = postsExp + chattersExp + momentsExp;

      // 2. 每日首发打卡经验结算 (去重计算绝对发布日期)
      const allActivities = [...posts, ...chatters, ...moments];
      const uniqueDays = new Set();

      allActivities.forEach(item => {
        if (item.date) {
          const dayString = new Date(item.date).toISOString().split('T')[0];
          uniqueDays.add(dayString);
        }
      });

      const checkInDays = uniqueDays.size;
      const checkInExp = checkInDays * 100;

      // 3. 汇总总储备经验
      const totalExp = contentExp + checkInExp;

      // 4. 🌟 饱和渐近线算法：前期合理递增，后期无限逼近 2150 EXP 封顶
      const getExpNeededForLevel = (lvl: number) => {
        if (lvl <= 1) return 150;
        return 150 + Math.floor((2000 * (lvl - 1)) / ((lvl - 1) + 10));
      };

      let level = 1;
      let remainingExp = totalExp;
      let expNeededForNextLevel = getExpNeededForLevel(level);

      // 循环扣除经验完成升级
      while (remainingExp >= expNeededForNextLevel) {
        remainingExp -= expNeededForNextLevel;
        level++;
        expNeededForNextLevel = getExpNeededForLevel(level);
      }

      // 计算当前等级的经验百分比进度
      const progressPercent = ((remainingExp / expNeededForNextLevel) * 100).toFixed(1);

      // 5. 打印高度拟真化的控制台干员档案
      console.groupCollapsed(`🛡️ [罗德岛数据终端] linx 个人综合档案同步...`);
      console.log(`%c[当前等级] Lv.${level}`, 'color: #6366f1; font-weight: 900; font-size: 16px; text-shadow: 0 0 4px rgba(99,102,241,0.3);');
      console.log(`%c[升级进度] ${remainingExp} / ${expNeededForNextLevel} EXP (${progressPercent}%)`, 'color: #10b981; font-weight: bold;');
      console.log(`[总计累计] ${totalExp} EXP`);
      console.log(`%c[渐近公式] EXP_Next = 150 + Math.floor((2000 * (L-1)) / ((L-1) + 10)) [极限上限: 2150]`, 'color: #8b5cf6; font-style: italic;');
      console.table({
        '文章发布 (50 EXP)': { '结算数量': posts.length, '贡献经验': postsExp },
        '杂谈记录 (20 EXP)': { '结算数量': chatters.length, '贡献经验': chattersExp },
        '每日说说 (10 EXP)': { '结算数量': moments.length, '贡献经验': momentsExp },
        '日历打卡 (100 EXP)': { '活跃天数': checkInDays, '贡献经验': checkInExp },
      });
      console.groupEnd();

    } catch (error) {
      console.error("经验系统计算流走火入魔：", error);
    }
  }, [posts, chatters, moments]);
  // =========================================================

  return (
    <div className="min-h-screen relative pb-32 overflow-x-hidden">
      <Navbar />

      <PageTransition>
        <div className="w-full max-w-7xl mx-auto mt-24 px-4 sm:px-10 relative z-10 flex flex-col items-center">

          {/* 顶部标题栏 */}
          <div className="w-full flex flex-col items-center mb-16 animate-fade-in-up text-center relative">
            <div className="absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full border border-cyan-300/30 bg-cyan-200/10 blur-sm dark:border-cyan-300/20 dark:bg-cyan-300/10" />
            <div className="absolute top-8 left-1/2 h-px w-full max-w-2xl -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
            <h1 className="relative text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-3 flex items-center justify-center gap-3 transition-colors duration-700">
              <Compass className="text-cyan-500 dark:text-cyan-300" size={40} /> 漂泊终点
            </h1>
            <p className="relative text-slate-600 dark:text-slate-300 font-medium tracking-wider mb-8 transition-colors duration-700">
              在潮声尽头收束每一次抵达，把文章、随笔与瞬间思绪封存为漂泊者的回声档案
            </p>

            {/* 切换开关 */}
            <div className="flex bg-white/45 dark:bg-slate-900/45 backdrop-blur-md p-1.5 rounded-full border border-cyan-200/60 dark:border-cyan-200/10 shadow-sm relative">
              <button
                onClick={() => setCurrentMode('alchemy')}
                className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all z-10 flex items-center gap-2 ${currentMode === 'alchemy' ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Waves size={16} /> 共鸣回廊
              </button>
              <button
                onClick={() => setCurrentMode('model')}
                className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all z-10 flex items-center gap-2 ${currentMode === 'model' ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Rocket size={16} /> 终点航迹
              </button>

              {/* 🌟 第三选项干员休息处暂时隐藏 */}

              {/* 滑动背景块动画：自动平分两等份 */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-1.5 bottom-1.5 bg-white dark:bg-slate-800 rounded-full z-0 shadow-sm border border-cyan-100 dark:border-cyan-300/20"
                style={{
                  width: 'calc(50% - 6px)', // 🌟 改为平分两份宽度
                  left: currentMode === 'alchemy' ? '6px' : 'calc(50% + 2px)' // 🌟 对应两种状态的计算位置
                }}
              />
            </div>
          </div>

          {/* 动态渲染子组件 */}
          <AnimatePresence mode="wait">
            {currentMode === 'alchemy' && (
              <AlchemyLab key="alchemy-view" posts={posts} chatters={chatters} moments={moments} />
            )}
            {currentMode === 'model' && (
              <DijiangModel key="model-view" posts={posts} chatters={chatters} moments={moments} />
            )}
            {/* 🌟 第三种展示暂时隐藏 */}
          </AnimatePresence>

        </div>
      </PageTransition>

      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes potion-wave { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        @keyframes bubble-rise { 0% { transform: translateY(0) scale(1); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateY(-40px) scale(0.5); opacity: 0; } }
      `}</style>
    </div>
  );
}
