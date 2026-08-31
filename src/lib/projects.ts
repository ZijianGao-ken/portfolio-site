export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  /** B站视频 BV 号，如 BV1xx411c7mD */
  bvid: string;
  /** 封面图 URL，可为空（空则显示视频首帧占位） */
  cover: string;
};

/** 示例作品数据 —— 未配置 Notion 时用于本地预览 */
export const sampleProjects: Project[] = [
  {
    id: "1",
    title: "光影之间",
    category: "短片 / 导演",
    year: "2025",
    description:
      "一部探讨城市孤独感的实验短片，以自然光与长镜头构建情绪空间。",
    bvid: "BV1GJ411x7h7",
    cover:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "山海纪行",
    category: "纪录片 / 摄影",
    year: "2024",
    description: "历时三个月记录的自然纪录片，横跨四季与山川湖海。",
    bvid: "BV1GJ411x7h7",
    cover:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "都市脉动",
    category: "商业广告 / 剪辑",
    year: "2024",
    description: "为运动品牌制作的城市主题广告，快节奏剪辑呈现活力。",
    bvid: "BV1GJ411x7h7",
    cover:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1600&auto=format&fit=crop",
  },
];
