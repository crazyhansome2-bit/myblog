"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, FileText, ImageIcon, Search } from "lucide-react";
import BackButton from "../../components/BackButton";
import { projectsData } from "../../data/projects";

const actionLinkClass =
  "inline-flex h-9 items-center gap-2 rounded-md border border-white/30 bg-white/85 px-3 text-xs font-bold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-slate-950/75 dark:text-white dark:hover:bg-slate-900";

export default function ProjectsBoard() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    if (searchQuery.trim() === "") return projectsData;
    const query = searchQuery.trim().toLowerCase();

    return projectsData.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-10">
      <div className="mb-8 flex flex-col items-center md:items-start">
        <div className="mb-6 flex w-full justify-start">
          <BackButton />
        </div>
        <div className="w-full text-center md:text-left">
          <h1 className="mb-4 text-4xl font-black uppercase tracking-widest text-slate-900 drop-shadow-sm dark:text-white">
            Projects Matrix
          </h1>
          <p className="font-serif text-slate-600 dark:text-slate-400">
            开源项目、策划作品与实验记录。
          </p>
        </div>
      </div>

      <div className="mb-12 flex w-full justify-center">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="搜索项目名称、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/40 bg-white/40 py-3 pl-12 pr-6 font-serif text-slate-800 shadow-xl backdrop-blur-md transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
          />
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <motion.div layout className="relative grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filteredProjects.map((project) => {
            const hasCover = Boolean(project.cover);

            return (
              <motion.article
                layout
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -18 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                key={project.id}
                style={
                  project.cover
                    ? {
                        backgroundImage: `linear-gradient(115deg, rgba(15, 23, 42, 0.93), rgba(15, 23, 42, 0.62) 52%, rgba(244, 114, 182, 0.2)), url(${project.cover})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }
                    : undefined
                }
                className={`group relative flex min-h-[420px] flex-col overflow-hidden rounded-lg border p-6 shadow-xl transition duration-500 hover:-translate-y-1 md:p-8 ${
                  hasCover
                    ? "border-white/20 bg-slate-950 text-white hover:shadow-pink-500/20"
                    : "border-white/40 bg-white/60 text-slate-900 backdrop-blur-xl hover:shadow-indigo-500/20 dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
                }`}
              >
                <div className="relative z-10 flex flex-1 flex-col">
                  <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.88fr)]">
                    <div className="flex min-w-0 flex-col">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl" aria-hidden="true">
                            {project.icon}
                          </span>
                          <h2 className="text-2xl font-bold leading-tight transition-colors group-hover:text-pink-200">
                            {project.name}
                          </h2>
                        </div>
                      </div>

                      <p
                        className={`mb-5 max-w-2xl font-serif text-sm leading-relaxed ${
                          hasCover ? "text-white/90" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {project.description}
                      </p>

                      {project.highlights && (
                        <div
                          className={`mb-6 rounded-lg border p-4 ${
                            hasCover
                              ? "border-white/20 bg-slate-950/45 text-white/90"
                              : "border-slate-200 bg-white/50 text-slate-700 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-300"
                          }`}
                        >
                          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                            核心结论
                          </p>
                          <ul className="space-y-2 text-sm leading-relaxed">
                            {project.highlights.map((highlight) => (
                              <li key={highlight} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mb-6 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-md border px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                              hasCover
                                ? "border-white/25 bg-white/15 text-white"
                                : "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2">
                        {project.summaryUrl && (
                          <a href={project.summaryUrl} target="_blank" rel="noopener noreferrer" className={actionLinkClass}>
                            项目摘要
                            <FileText className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {project.documentUrl && (
                          <a href={project.documentUrl} target="_blank" rel="noopener noreferrer" className={actionLinkClass}>
                            完整文档
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {project.architectureUrl && (
                          <a href={project.architectureUrl} target="_blank" rel="noopener noreferrer" className={actionLinkClass}>
                            架构 PDF
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={actionLinkClass}>
                            GitHub
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {project.architectureImageUrl && (
                      <a
                        href={project.architectureUrl ?? project.architectureImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group/preview relative min-h-[220px] overflow-hidden rounded-lg border ${
                          hasCover
                            ? "border-white/20 bg-white/10"
                            : "border-slate-200 bg-white/60 dark:border-white/10 dark:bg-slate-950/40"
                        }`}
                      >
                        <img
                          src={project.architectureImageUrl}
                          alt={`${project.name} 系统架构图预览`}
                          className="h-full min-h-[220px] w-full object-cover opacity-95 transition duration-500 group-hover/preview:scale-[1.03]"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-slate-950/78 px-4 py-3 text-white backdrop-blur">
                          <span className="flex items-center gap-2 text-xs font-bold">
                            <ImageIcon className="h-4 w-4" />
                            系统架构图预览
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full w-full py-20 text-center font-serif text-slate-500"
          >
            没有找到和 [{searchQuery}] 相关的项目。
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
