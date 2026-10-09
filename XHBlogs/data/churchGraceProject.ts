import type { Project } from "./projects";

export type PortfolioProject = Project & { demoUrl?: string };

export const churchGraceProject: PortfolioProject = {
  id: "church-grace",
  name: "教会恩赐系统",
  icon: "",
  description:
    "为单机肉鸽独立设计的神明成长系统：随机获取权柄，恩赐信徒后解锁主角能力，以实际信徒锚定约束高阶成长。Unity 规则验证原型，代码与美术使用 AI 辅助完成。",
  cover: "/projects/church-grace/authority-poster.jpg",
  demoUrl: "/projects/church-grace/index.html",
  highlights: [
    "敌方神明池与敌人等阶限定随机获取；远征材料支持已解锁权柄的定向补充。",
    "同种同阶三合一；收回移除主角效果、释放锚定，库存权柄保留原等阶，可再次恩赐。",
    "2 分 46 秒 Unity 规则录制、系统流程图、中文字幕与曼波 AI 解说；非实时战斗或商业上线项目。",
  ],
  tags: ["系统策划", "Unity", "肉鸽", "角色成长", "个人原型"],
};
