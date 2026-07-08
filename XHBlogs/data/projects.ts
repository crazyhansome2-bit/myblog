// 🛡️ 本文件由控制台自动生成，请勿手动修改

export type Project = {
  id: string;
  name: string;
  description: string;
  icon: string;
  githubUrl?: string;
  cover?: string;
  documentUrl?: string;
  architectureUrl?: string;
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
    documentUrl: "/projects/deep-fantasy/deep-fantasy.docx",
    architectureUrl: "/projects/deep-fantasy/system-architecture.pdf",
    tags: ["鸣潮", "系统策划", "玩法设计", "项目作品"],
  },
];
