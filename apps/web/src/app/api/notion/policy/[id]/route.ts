import { NextRequest, NextResponse } from "next/server";
import { getPolicyContent } from "@/lib/server/notion";

// ISR: Next.js 15에서는 revalidate 값이 빌드 타임에 정적인 값이어야 함
// 환경별 캐시는 아래 Cache-Control 헤더로 제어하므로 여기서는 0으로 고정
export const revalidate = 0;

/**
 * 노션 페이지 상세 내용 조회 API
 * 페이지 ID를 받아서 노션 페이지의 블록 내용을 가져옴
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blocks = await getPolicyContent(id);

    // ISR / 캐시 설정
    const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";
    const maxAge = isDev ? 0 : 60 * 60 * 24 * 30; // 30일

    return NextResponse.json(
      { data: { blocks } },
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
    const error = e as { message?: string };
    console.error("Error fetching Notion page content:", e);
    return NextResponse.json(
      {
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
