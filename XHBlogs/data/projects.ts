// 🛡️ 本文件由控制台自动生成，请勿手动修改

export type Project = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl?: string;
  cover?: string;
  documentUrl?: string;
  summaryUrl?: string;
  architectureUrl?: string;
  architectureImageUrl?: string;
  highlights?: string[];
  tags: string[];
};

export const projectsData: Project[] = [
  {
    id: "deep-fantasy",
    name: "深坠异想奇境",
    description:
      "《鸣潮》主题系统策划项目，围绕幻想奇境玩法搭建整体架构、机制循环、体验节奏与内容呈现。",
    icon: "🎮",
    cover: "/projects/deep-fantasy/cover.jpg",
    summaryUrl: "/projects/deep-fantasy/summary.md",
    documentUrl: "/projects/deep-fantasy/deep-fantasy.docx",
    architectureUrl: "/projects/deep-fantasy/system-architecture.pdf",
    architectureImageUrl: "/projects/deep-fantasy/architecture-preview.jpg",
    highlights: [
      "拆解局内随机构筑与局外永久养成组成的双层成长模型。",
      "梳理系统基础信息、单局流程、构筑房间、奖励结算与底层约束规则。",
      "复盘后期重复游玩动力衰减、养成饱和和高难参与门槛等体验问题。",
    ],
    tags: ["鸣潮", "系统策划", "Roguelike", "作品集"],
  },
];
