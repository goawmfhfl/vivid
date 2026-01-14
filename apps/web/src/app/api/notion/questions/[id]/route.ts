import { NextRequest, NextResponse } from "next/server";
import { formatNotionPageId } from "@/lib/utils/notion";
import type {
  NotionBlocksResponse,
  NotionBlockResponse,
} from "@/lib/types/notion-api";

// ISR: Next.js 15에서는 revalidate 값이 빌드 타임에 정적인 값이어야 함
// 환경별 캐시는 아래 Cache-Control 헤더로 제어하므로 여기서는 0으로 고정
export const revalidate = 0;

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

/**
 * 노션 질문 상세 내용 조회 API
 * 페이지 ID를 받아서 노션 페이지의 블록 내용을 가져옴
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notionToken = process.env.NOTION_TOKEN;

    // UUID 형식 검증 (하이픈 포함 또는 제거된 32자리 hex)
    const isUUID = /^[a-f0-9]{32}$/i.test(id.replace(/-/g, ""));

    if (!isUUID) {
      return NextResponse.json(
        {
          error: "Invalid page ID format",
          message: `페이지 ID가 유효한 UUID 형식이 아닙니다. 받은 ID: ${id}`,
          receivedId: id,
        },
        { status: 400 }
      );
    }

    // 페이지 ID 포맷팅 (하이픈 추가)
    const formattedId = formatNotionPageId(id);

    if (!notionToken) {
      return NextResponse.json(
        {
          error: "Notion configuration is missing",
          missing: ["NOTION_TOKEN"],
          message:
            "NOTION_TOKEN 환경 변수가 설정되지 않았습니다. .env.local 파일에 설정해주세요.",
          envStatus: {
            NOTION_TOKEN: false,
          },
        },
        { status: 500 }
      );
    }

    const headers = getNotionHeaders();

    // 중첩된 블록들을 재귀적으로 가져오기
    const fetchNestedBlocks = async (
      blockId: string
    ): Promise<NotionBlockResponse[]> => {
      const nestedBlocks: NotionBlockResponse[] = [];
      let nextCursor: string | null = null;

      do {
        const url = `${NOTION_API_BASE}/blocks/${blockId}/children${
          nextCursor ? `?start_cursor=${nextCursor}` : ""
        }`;

        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          break;
        }

        const blockData = (await response.json()) as NotionBlocksResponse;
        nestedBlocks.push(...(blockData.results || []));
        nextCursor = blockData.next_cursor || null;
      } while (nextCursor);

      // 각 블록의 중첩 블록도 재귀적으로 가져오기
      const blocksWithNested: (NotionBlockResponse & {
        children?: NotionBlockResponse[];
      })[] = [];
      for (const block of nestedBlocks) {
        const blockWithNested: NotionBlockResponse & {
          children?: NotionBlockResponse[];
        } = { ...block };
        if (block.has_children) {
          blockWithNested.children = await fetchNestedBlocks(block.id);
        }
        blocksWithNested.push(blockWithNested);
      }

      return blocksWithNested;
    };

    // 페이지 블록들 가져오기
    const blocks: (NotionBlockResponse & {
      children?: NotionBlockResponse[];
    })[] = [];
    let nextCursor: string | null = null;

    do {
      const url = `${NOTION_API_BASE}/blocks/${formattedId}/children${
        nextCursor ? `?start_cursor=${nextCursor}` : ""
      }`;

      const blockResponse = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!blockResponse.ok) {
        break;
      }

      const blockData = (await blockResponse.json()) as NotionBlocksResponse;
      const fetchedBlocks = blockData.results || [];

      // 각 블록의 중첩 블록도 가져오기
      for (const block of fetchedBlocks) {
        const blockWithNested: NotionBlockResponse & {
          children?: NotionBlockResponse[];
        } = { ...block };
        if (block.has_children) {
          blockWithNested.children = await fetchNestedBlocks(block.id);
        }
        blocks.push(blockWithNested);
      }

      nextCursor = blockData.next_cursor || null;
    } while (nextCursor);

    // 중첩된 블록들을 평탄화하여 순서대로 배열로 변환
    const flattenBlocks = (
      blocks: (NotionBlockResponse & { children?: NotionBlockResponse[] })[]
    ): NotionBlockResponse[] => {
      const flattened: NotionBlockResponse[] = [];

      for (const block of blocks) {
        // 컨테이너 블록 타입들 (children을 내부에 유지해야 하는 블록)
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
          // 컨테이너 블록은 그대로 추가 (children은 유지됨)
          flattened.push(block);
        } else if (block.type === "table_row") {
          // table_row는 table의 children으로만 사용되므로 평탄화하지 않음
          flattened.push(block);
        } else {
          // 일반 블록은 평탄화
          const { children, ...blockWithoutChildren } = block;
          flattened.push(blockWithoutChildren);

          // children이 있으면 재귀적으로 평탄화하여 순서대로 추가
          if (children && Array.isArray(children) && children.length > 0) {
            const childBlocks = flattenBlocks(children);
            flattened.push(...childBlocks);
          }
        }
      }

      return flattened;
    };

    const flattenedBlocks = flattenBlocks(blocks);

    // ISR / 캐시 설정 (프로덕션에서는 길게, 개발에서는 즉시 반영)
    const isDev = process.env.NODE_ENV === "development";
    const maxAge = isDev ? 0 : 60 * 60 * 24 * 30; // 30일

    return NextResponse.json(
      { data: { blocks: flattenedBlocks } },
      {
        status: 200,
        headers: {
          "Cache-Control": isDev
            ? "no-store"
            : `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}`,
        },
      }
    );
  } catch (e: unknown) {
    const error = e as { message?: string; body?: unknown; code?: string };
    console.error("Error fetching Notion question content:", e);
    return NextResponse.json(
      {
        error: error?.message ?? "Unknown error",
        detail: error?.body ?? null,
        code: error?.code,
        envStatus: {
          NOTION_TOKEN: !!process.env.NOTION_TOKEN,
        },
      },
      { status: 500 }
    );
  }
}
