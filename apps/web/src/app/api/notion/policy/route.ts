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
 * 노션 정책 데이터 조회 API
 * NOTION_NOTICE_DATABASE_ID에서 service가 VIVID이고 type이 POLICY인 데이터 조회
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
                  equals: "POLICY",
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
        { status: response.status }
      );
    }

    const data = (await response.json()) as NotionDatabaseQueryResponse;

    // ISR / 캐시 설정 (프로덕션에서는 길게, 개발에서는 즉시 반영)
    const isDev = process.env.NODE_ENV === "development";
    const maxAge = isDev ? 0 : 60 * 60 * 24 * 30; // 30일

    // 노션 데이터를 정제하여 반환
    const policies = data.results.map((page: NotionPage) => {
      // 페이지 상세 정보 가져오기
      const properties: NotionPageProperties = page.properties || {};
      
      
      // name 필드 추출 (노션의 name 속성은 배열 형태)
      const nameProperty = (properties.name || properties["name"] || properties["제목"] || properties["Title"] || properties["title"]) as NotionPageProperties["name"] | NotionPageProperties["title"] | undefined;
      const name = (nameProperty && "title" in nameProperty && nameProperty.title?.[0]?.plain_text) || 
                   (nameProperty && "rich_text" in nameProperty && nameProperty.rich_text?.[0]?.plain_text) ||
                   (nameProperty && "plain_text" in nameProperty && nameProperty.plain_text) ||
                   (nameProperty && "name" in nameProperty && nameProperty.name) ||
                   "제목 없음";

      // title 필드 추출 (name이 없을 경우 대비)
      const titleProperty = (properties.title || properties["제목"] || properties["Title"]) as NotionPageProperties["title"] | undefined;
      const title = (titleProperty && "title" in titleProperty && titleProperty.title?.[0]?.plain_text) || 
                   (titleProperty && "rich_text" in titleProperty && titleProperty.rich_text?.[0]?.plain_text) ||
                   (titleProperty && "plain_text" in titleProperty && titleProperty.plain_text) ||
                   name;

      // type 필드에서 정책 종류 확인 (이용약관, 개인정보처리방침 등)
      // 여러 가능한 필드명 시도
      const typeProperty = (properties.type || properties["종류"] || properties["Type"] || properties["policy_type"]) as NotionPageProperties["type"] | undefined;
      const policyType = (typeProperty && "select" in typeProperty && typeProperty.select?.name) || 
                         (typeProperty && "name" in typeProperty && typeProperty.name) ||
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

    return NextResponse.json({ data: policies }, {
      status: 200,
      headers: {
        "Cache-Control": isDev
          ? "no-store"
          : `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}`,
      },
    });
  } catch (e: unknown) {
    const error = e as { message?: string; body?: unknown; code?: string };
    console.error("Error fetching Notion policy data:", e);
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
