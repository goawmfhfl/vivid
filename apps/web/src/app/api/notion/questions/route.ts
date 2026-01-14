import { NextRequest, NextResponse } from "next/server";
import type {
  NotionDatabaseQueryResponse,
  NotionPage,
  NotionPageProperties,
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
 * 노션 자주 묻는 질문 데이터 조회 API
 * NOTION_NOTICE_DATABASE_ID에서 service가 VIVID이고 type이 QUESTION인 데이터 조회
 */
export async function GET(_request: NextRequest) {
  try {
    const databaseId = process.env.NOTION_NOTICE_DATABASE_ID;
    const notionToken = process.env.NOTION_TOKEN;

    if (!databaseId || !notionToken) {
      const missingVars = [];
      if (!databaseId) missingVars.push("NOTION_NOTICE_DATABASE_ID");
      if (!notionToken) missingVars.push("NOTION_TOKEN");

      return NextResponse.json(
        {
          error: "Notion configuration is missing",
          missing: missingVars,
          message: `다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(", ")}. .env.local 파일에 설정해주세요.`,
          envStatus: {
            NOTION_TOKEN: !!notionToken,
            NOTION_NOTICE_DATABASE_ID: !!databaseId,
          },
        },
        { status: 500 }
      );
    }

    const headers = getNotionHeaders();

    // 노션 API 호출
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
                  equals: "QUESTION",
                },
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Notion API error:", errorData);
      return NextResponse.json(
        {
          error: `Notion 데이터베이스 쿼리 실패: ${errorData.message || response.statusText}`,
          detail: errorData,
          code: errorData.code,
          envStatus: {
            NOTION_TOKEN: !!notionToken,
            NOTION_NOTICE_DATABASE_ID: !!databaseId,
          },
        },
        { status: 500 }
      );
    }

    const data: NotionDatabaseQueryResponse = await response.json();

    const questions = (page: NotionPage) => {
      const properties = page.properties as NotionPageProperties;
      const nameProperty = properties.name || properties.title;
      const titleProperty = properties.title || properties.name;

      const name =
        nameProperty && "title" in nameProperty
          ? (nameProperty.title ?? [])
              .map((t) => t.plain_text)
              .join("")
          : nameProperty && "rich_text" in nameProperty
          ? (nameProperty.rich_text ?? [])
              .map((t) => t.plain_text)
              .join("")
          : "";

      const title =
        titleProperty && "title" in titleProperty
          ? (titleProperty.title ?? [])
              .map((t) => t.plain_text)
              .join("")
          : titleProperty && "rich_text" in titleProperty
          ? (titleProperty.rich_text ?? [])
              .map((t) => t.plain_text)
              .join("")
          : "";

      const questionType =
        (properties.type &&
          "select" in properties.type &&
          properties.type.select?.name) ||
        (properties.type && "name" in properties.type && properties.type.name) ||
        "";

      return {
        id: page.id,
        name,
        title,
        type: questionType,
        url: page.url,
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
      };
    };

    const isDev = process.env.NODE_ENV === "development";
    const maxAge = 60 * 60 * 24 * 30; // 30일

    return NextResponse.json(
      { data: data.results.map(questions) },
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
    console.error("Error fetching Notion questions data:", e);
    return NextResponse.json(
      {
        error: error?.message ?? "Unknown error",
        detail: error?.body ?? null,
        code: error?.code,
        envStatus: {
          NOTION_TOKEN: !!process.env.NOTION_TOKEN,
          NOTION_NOTICE_DATABASE_ID: !!process.env.NOTION_NOTICE_DATABASE_ID,
        },
      },
      { status: 500 }
    );
  }
}
