import { Client } from "@notionhq/client";
import { Project, sampleProjects } from "./projects";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

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
        };
      })
      .filter((p): p is Project => p !== null && p.title !== "");

    return projects.length > 0 ? projects : sampleProjects;
  } catch (err) {
    console.error("[Notion] 读取失败，回退到示例数据：", err);
    return sampleProjects;
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
