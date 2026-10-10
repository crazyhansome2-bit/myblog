import type { Project } from "./projects";

export type PortfolioProject = Project & { demoUrl?: string };

export const churchGraceProject: PortfolioProject = {
  id: "church-grace",
  name: "教会恩赐 · 肉鸽成长子系统",
  icon: "",
  description:
    "为单机肉鸽独立设计的游戏内成长子系统，并非整款游戏。首段剧情开启，战斗输入随机权柄，恩赐信徒决定能力启用，再向战斗输出主角状态。Unity 可交互规则原型，代码与美术使用 AI 辅助完成。",
  cover: "/projects/church-grace/authority-poster.jpg?v=20261010-subsystem",
  demoUrl: "/projects/church-grace/index.html",
  highlights: [
    "敌方神明池与敌人等阶限定随机获取；远征材料支持已解锁权柄的定向补充。",
    "同种同阶三合一；收回移除主角效果、释放锚定，库存权柄保留原等阶，可再次恩赐。",
    "3 分 14 秒主流程衔接与子系统演示；Unity 源码、Windows 原型、23 项规则检查、流程图与曼波 AI 解说。非完整游戏或实时战斗。",
  ],
  tags: ["系统策划", "Unity", "肉鸽", "角色成长", "个人原型"],
};
