import type {
  NotionDatabaseQueryResponse,
  NotionPage,
  NotionPageProperties,
  NotionBlocksResponse,
  NotionBlockResponse,
} from "@/lib/types/notion-api";
import { formatNotionPageId } from "@/lib/utils/notion";

const NOTION_API_BASE = "https://api.notion.com/v1";

/**
 * Notion API 헤더 생성
 */
function getNotionHeaders(): HeadersInit {
  const apiKey = process.env.NOTION_TOKEN;

  if (!apiKey) {
    throw new Error("NOTION_TOKEN이 설정되지 않았습니다.");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}

export interface PolicyData {
  id: string;
  name: string;
  title: string;
  type: string;
  url: string;
  created_time: string;
  last_edited_time: string;
}

/**
 * 정책 목록 조회 (SSG용)
 */
export async function getPolicies(): Promise<PolicyData[]> {
  const databaseId = process.env.NOTION_NOTICE_DATABASE_ID;
  
  if (!databaseId) {
    throw new Error("NOTION_NOTICE_DATABASE_ID가 설정되지 않았습니다.");
  }

  const headers = getNotionHeaders();

  const response = await fetch(
    `${NOTION_API_BASE}/databases/${databaseId}/query`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: "service",
              select: {
                equals: "VIVID",
              },
            },
            {
              property: "type",
              select: {
                equals: "POLICY",
              },
            },
          ],
        },
      }),
      next: { revalidate: 3600 }, // 1시간 캐시 (SSG/ISR)
    }
  );

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.statusText}`);
  }

  const data = (await response.json()) as NotionDatabaseQueryResponse;

  return data.results.map((page: NotionPage) => {
    const properties: NotionPageProperties = page.properties || {};
    
    // name 필드 추출
    const nameProperty = (properties.name || properties["name"] || properties["제목"] || properties["Title"] || properties["title"]) as any;
    const name = (nameProperty?.title?.[0]?.plain_text) || 
                 (nameProperty?.rich_text?.[0]?.plain_text) ||
                 (nameProperty?.plain_text) ||
                 (nameProperty?.name) ||
                 "제목 없음";

    // title 필드 추출
    const titleProperty = (properties.title || properties["제목"] || properties["Title"]) as any;
    const title = (titleProperty?.title?.[0]?.plain_text) || 
                 (titleProperty?.rich_text?.[0]?.plain_text) ||
                 (titleProperty?.plain_text) ||
                 name;

    // type 필드 추출
    const typeProperty = (properties.type || properties["종류"] || properties["Type"] || properties["policy_type"]) as any;
    const policyType = (typeProperty?.select?.name) || 
                       (typeProperty?.name) ||
                       "";

    return {
      id: page.id,
      name,
      title,
      type: policyType,
      url: page.url,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
    };
  });
}

/**
 * 정책 내용(블록) 조회 (SSG용)
 */
export async function getPolicyContent(id: string): Promise<NotionBlockResponse[]> {
  const formattedId = formatNotionPageId(id);
  const headers = getNotionHeaders();

  // 중첩된 블록들을 재귀적으로 가져오기
  const fetchNestedBlocks = async (blockId: string): Promise<NotionBlockResponse[]> => {
    const nestedBlocks: NotionBlockResponse[] = [];
    let nextCursor: string | null = null;

    do {
      const url = `${NOTION_API_BASE}/blocks/${blockId}/children${
        nextCursor ? `?start_cursor=${nextCursor}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers,
        next: { revalidate: 3600 },
      });

      if (!response.ok) break;

      const blockData = (await response.json()) as NotionBlocksResponse;
      nestedBlocks.push(...(blockData.results || []));
      nextCursor = blockData.next_cursor || null;
    } while (nextCursor);

    const blocksWithNested: (NotionBlockResponse & { children?: NotionBlockResponse[] })[] = [];
    for (const block of nestedBlocks) {
      const blockWithNested: any = { ...block };
      if (block.has_children) {
        blockWithNested.children = await fetchNestedBlocks(block.id);
      }
      blocksWithNested.push(blockWithNested);
    }

    return blocksWithNested;
  };

  // 페이지 블록들 가져오기
  const blocks: (NotionBlockResponse & { children?: NotionBlockResponse[] })[] = [];
  let nextCursor: string | null = null;

  do {
    const url = `${NOTION_API_BASE}/blocks/${formattedId}/children${
      nextCursor ? `?start_cursor=${nextCursor}` : ""
    }`;

    const blockResponse = await fetch(url, {
      method: "GET",
      headers,
      next: { revalidate: 3600 },
    });

    if (!blockResponse.ok) {
      throw new Error(`Notion API error: ${blockResponse.statusText}`);
    }

    const blockData = (await blockResponse.json()) as NotionBlocksResponse;
    const fetchedBlocks = blockData.results || [];

    for (const block of fetchedBlocks) {
      const blockWithNested: any = { ...block };
      if (block.has_children) {
        blockWithNested.children = await fetchNestedBlocks(block.id);
      }
      blocks.push(blockWithNested);
    }

    nextCursor = blockData.next_cursor || null;
  } while (nextCursor);

  // 평탄화 함수
  const flattenBlocks = (blocks: (NotionBlockResponse & { children?: NotionBlockResponse[] })[]): NotionBlockResponse[] => {
    const flattened: NotionBlockResponse[] = [];

    for (const block of blocks) {
      const containerTypes = [
        "callout",
        "toggle",
        "quote",
        "column_list",
        "column",
        "synced_block",
        "child_page",
        "child_database",
        "link_to_page",
        "table",
      ];
      
      if (containerTypes.includes(block.type)) {
        flattened.push(block);
      } else if (block.type === "table_row") {
        flattened.push(block);
      } else {
        const { children, ...blockWithoutChildren } = block;
        flattened.push(blockWithoutChildren);
        
        if (children && Array.isArray(children) && children.length > 0) {
          const childBlocks = flattenBlocks(children);
          flattened.push(...childBlocks);
        }
      }
    }

    return flattened;
  };

  return flattenBlocks(blocks);
}
