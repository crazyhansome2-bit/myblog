import type { Project } from "./projects";

export type PortfolioProject = Project & { demoUrl?: string };

export const churchGraceProject: PortfolioProject = {
  id: "church-grace",
  name: "教会恩赐系统",
  icon: "",
  description:
    "Unity 6.6 游戏内系统原型：围绕公共神恩分配、成员培养与委派回收，展示有限资源下的配置取舍。个人系统策划作品，代码与美术使用 AI 辅助完成。",
  cover: "/projects/church-grace/poster.jpg",
  demoUrl: "/projects/church-grace/index.html",
  highlights: [
    "8 条途径、24 项恩赐，以有限槽位和部分退款约束培养与换装。",
    "从方案预览、委派锁定到领取回报与再培养，形成可运行的资源循环。",
    "两分钟 Unity 实机自动流程演示，中文字幕与曼波 AI 语音解说；非商业上线项目。",
  ],
  tags: ["系统策划", "Unity", "资源分配", "成员养成", "个人原型"],
};
