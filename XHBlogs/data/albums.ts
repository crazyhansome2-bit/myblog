// 本文件由 linx 控制台自动生成，请勿手动修改
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    id: "blue-coast",
    title: "蓝调海岸",
    description: "海风、街口、窗边与手绘线稿的片段。",
    cover: "/linx-style/beach-memory.jpg",
    date: "2026.07",
    photos: [
      { url: "/linx-style/shore-road.jpg", caption: "海边路口" },
      { url: "/linx-style/sea-window.jpg", caption: "窗外的蓝" },
      { url: "/linx-style/blue-street.jpg", caption: "街角日光" },
      { url: "/linx-style/crossing-sea.jpg", caption: "道口与海" },
      { url: "/linx-style/beach-memory.jpg", caption: "沙滩记忆" },
    ],
  },
];
