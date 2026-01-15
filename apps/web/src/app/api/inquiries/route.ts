import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  getAuthenticatedUserIdFromCookie,
} from "../utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import type { Inquiry, CreateInquiryRequest } from "@/types/inquiry";

const INQUIRIES_BUCKET = "inquiries-images";

function extractInquiriesImagePath(value: string): string {
  // 이미 path 형태면 그대로 사용
  if (!value) return value;
  if (!value.startsWith("http")) return value;

  try {
    const url = new URL(value);
    // /storage/v1/object/sign/<bucket>/<path> 또는 /storage/v1/object/public/<bucket>/<path>
    const segments = url.pathname.split("/").filter(Boolean);
    const objectIdx = segments.findIndex((s) => s === "object");
    if (objectIdx === -1) return value;
    const mode = segments[objectIdx + 1]; // sign | public
    const bucket = segments[objectIdx + 2];
    if ((mode !== "sign" && mode !== "public") || bucket !== INQUIRIES_BUCKET) {
      return value;
    }
    const pathSegments = segments.slice(objectIdx + 3);
    const path = decodeURIComponent(pathSegments.join("/"));
    return path || value;
  } catch {
    return value;
  }
}

async function toSignedUrls(
  supabase: ReturnType<typeof getServiceSupabase>,
  values: string[]
): Promise<string[]> {
  const urls = await Promise.all(
    (values || []).map(async (v) => {
      const path = extractInquiriesImagePath(v);
      const { data, error } = await supabase.storage
        .from(INQUIRIES_BUCKET)
        .createSignedUrl(path, 60 * 60); // 1시간
      if (error || !data?.signedUrl) return v;
      return data.signedUrl;
    })
  );
  return urls;
}

/**
 * POST /api/inquiries
 * 문의사항 생성
 */
export async function POST(request: NextRequest) {
  try {
    // Authorization 헤더가 있으면 우선 사용, 없으면 쿠키에서 가져오기
    let userId: string;
    try {
      userId = await getAuthenticatedUserId(request);
    } catch {
      // Authorization 헤더가 없으면 쿠키에서 시도
      userId = await getAuthenticatedUserIdFromCookie();
    }
    const body: CreateInquiryRequest = await request.json();
    const { type, title, content, images = [] } = body;

    // 유효성 검사
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: "문의사항 타입, 제목, 내용을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 이미지 값은 URL/Path 혼재 가능 → path로 정규화해서 저장
    const normalizedImages = (images || []).map(extractInquiriesImagePath);

    // 문의사항 생성
    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .insert({
        user_id: userId,
        type,
        title: title.trim(),
        content: content.trim(),
        images: normalizedImages,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("문의사항 생성 실패:", error);
      return NextResponse.json(
        { error: "문의사항을 저장하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "문의사항이 성공적으로 제출되었습니다.",
        inquiry: inquiry as Inquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("문의사항 생성 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `문의사항 제출 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/inquiries
 * 사용자 자신의 문의사항 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더가 있으면 우선 사용, 없으면 쿠키에서 가져오기
    let userId: string;
    try {
      userId = await getAuthenticatedUserId(request);
    } catch {
      // Authorization 헤더가 없으면 쿠키에서 시도
      userId = await getAuthenticatedUserIdFromCookie();
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 사용자 자신의 문의사항 목록 조회
    const { data: inquiries, error, count } = await supabase
      .from("inquiries")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("문의사항 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "문의사항 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // images/admin_response_images는 DB에 path(또는 과거 signed url)가 저장되어 있을 수 있음
    // → 매 요청마다 fresh signed url로 변환해서 내려줌
    const inquiriesWithSignedUrls = await Promise.all(
      (inquiries || []).map(async (inq: Inquiry) => ({
        ...inq,
        images: await toSignedUrls(supabase, inq.images || []),
        admin_response_images: await toSignedUrls(
          supabase,
          inq.admin_response_images || []
        ),
      }))
    );

    return NextResponse.json({
      inquiries: inquiriesWithSignedUrls as Inquiry[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("문의사항 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "문의사항 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
