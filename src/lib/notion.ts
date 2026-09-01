import { Client } from "@notionhq/client";
import { promises as fs } from "fs";
import path from "path";
import {
  Project,
  sampleProjects,
  SiteSettings,
  defaultSettings,
} from "./projects";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

/** 站点设置行的标题标记：该行不作为作品展示，只存全站文字 */
const SETTINGS_TITLE = "⚙ 站点设置（勿删）";

/**
 * 从 Notion 读取作品列表。
 * 未配置密钥时返回示例数据，保证本地/首次部署可直接预览。
 */
export async function getProjects(): Promise<Project[]> {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return sampleProjects;
  }

  try {
    const notion = new Client({ auth: NOTION_TOKEN });

    // 新版 Notion API：需先从数据库拿到 data source id 再查询
    const db = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });
    const dataSourceId =
      "data_sources" in db && db.data_sources?.[0]?.id
        ? db.data_sources[0].id
        : NOTION_DATABASE_ID;

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      sorts: [{ property: "排序", direction: "ascending" }],
    });

    const projects = response.results
      .map((page): Project | null => {
        if (!("properties" in page)) return null;
        const props = page.properties as Record<string, NotionProp>;
        return {
          id: page.id,
          title: readTitle(props["标题"]),
          category: readText(props["分类"]),
          year: readText(props["年份"]),
          description: readText(props["描述"]),
          bvid: readText(props["BV号"]),
          cover: readCover(props["封面"]),
          pages: readPages(props["分P"]),
          images: [],
        };
      })
      .filter(
        (p): p is Project =>
          p !== null && p.title !== "" && p.title !== SETTINGS_TITLE
      );

    // 构建时补全封面：Notion 没传封面、但有 BV 号的，自动抓 B站官方封面
    await Promise.all(
      projects.map(async (p) => {
        if (!p.cover && p.bvid) {
          p.cover = await fetchBiliCover(p.bvid);
        }
      })
    );

    // 图片作品（无 BV 号）：按标题扫描 public/media/<标题>/ 目录下的图片
    for (const p of projects) {
      if (!p.bvid) {
        p.images = await scanLocalImages(p.title);
      }
    }

    return projects.length > 0 ? projects : sampleProjects;
  } catch (err) {
    console.error("[Notion] 读取失败，回退到示例数据：", err);
    return sampleProjects;
  }
}

/**
 * 从 Notion 读取站点设置（关于我、邮箱）。
 * 读取标题为「⚙ 站点设置（勿删）」的行，未配置或未找到则用默认值。
 */
export async function getSettings(): Promise<SiteSettings> {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return defaultSettings;
  }
  try {
    const notion = new Client({ auth: NOTION_TOKEN });
    const db = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });
    const dataSourceId =
      "data_sources" in db && db.data_sources?.[0]?.id
        ? db.data_sources[0].id
        : NOTION_DATABASE_ID;

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
    });
    const row = response.results.find(
      (page) =>
        "properties" in page &&
        readTitle(
          (page.properties as Record<string, NotionProp>)["标题"]
        ) === SETTINGS_TITLE
    );
    if (!row || !("properties" in row)) return defaultSettings;
    const props = row.properties as Record<string, NotionProp>;
    return {
      about: readText(props["描述"]) || defaultSettings.about,
      email: readText(props["邮箱"]) || defaultSettings.email,
    };
  } catch (err) {
    console.error("[Notion] 读取设置失败，用默认值：", err);
    return defaultSettings;
  }
}

/** 构建时调用 B站 API 获取视频封面 URL（http 转 https） */
async function fetchBiliCover(bvid: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const json = await res.json();
    const pic: string | undefined = json?.data?.pic;
    return pic ? pic.replace(/^http:\/\//, "https://") : "";
  } catch {
    return "";
  }
}

/* ---------- Notion 字段解析辅助 ---------- */

type NotionProp = {
  type?: string;
  title?: { plain_text: string }[];
  rich_text?: { plain_text: string }[];
  select?: { name: string } | null;
  number?: number | null;
  url?: string | null;
  files?: { file?: { url: string }; external?: { url: string } }[];
};

function readTitle(prop?: NotionProp): string {
  return prop?.title?.map((t) => t.plain_text).join("") ?? "";
}

function readText(prop?: NotionProp): string {
  if (!prop) return "";
  if (prop.type === "select") return prop.select?.name ?? "";
  if (prop.type === "number") return prop.number?.toString() ?? "";
  if (prop.type === "url") return prop.url ?? "";
  return prop.rich_text?.map((t) => t.plain_text).join("") ?? "";
}

function readCover(prop?: NotionProp): string {
  const file = prop?.files?.[0];
  if (!file) return "";
  return file.external?.url ?? file.file?.url ?? "";
}

/**
 * 图片作品：扫描 public/media/<作品标题>/ 目录，返回按文件名排序的图片引用路径。
 * 图片随网站一起部署，无大小限制、不过期、大陆可访问。
 */
async function scanLocalImages(title: string): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "media", title);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
      .sort()
      .map((f) => `/media/${encodeURIComponent(title)}/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}

/** 解析「分P」字段：接受 "1,3" 或 "1、3" 等，返回去重后的正整数数组 */
function readPages(prop?: NotionProp): number[] {
  const raw = readText(prop);
  if (!raw) return [];
  const nums = raw
    .split(/[,，、\s]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(nums)];
}
