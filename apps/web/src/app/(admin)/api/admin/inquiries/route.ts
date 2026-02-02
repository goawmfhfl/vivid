import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";
type InquiryRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  images?: string[] | null;
  status: string;
  admin_response?: string | null;
  admin_response_images?: string[] | null;
  created_at: string;
  updated_at: string;
};


const INQUIRIES_BUCKET = "inquiries-images";

function extractInquiriesImagePath(value: string): string {
  if (!value) return value;
  if (!value.startsWith("http")) return value;
  try {
    const url = new URL(value);
    const segments = url.pathname.split("/").filter(Boolean);
    const objectIdx = segments.findIndex((s) => s === "object");
    if (objectIdx === -1) return value;
    const mode = segments[objectIdx + 1];
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
        .createSignedUrl(path, 60 * 60);
      if (error || !data?.signedUrl) return v;
      return data.signedUrl;
    })
  );
  return urls;
}

/**
 * GET /api/admin/inquiries
 * 문의사항 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const supabase = getServiceSupabase();
    const offset = (page - 1) * limit;

    // 문의사항 목록 조회
    let query = supabase
      .from("inquiries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 필터 적용
    if (status) {
      query = query.eq("status", status);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data: inquiries, error, count } = await query;

    if (error) {
      console.error("문의사항 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "문의사항 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 유저 정보 조회 (Supabase Auth admin API 사용 - user_metadata에서 name 가져오기)
    const userIds = Array.from(
      new Set((inquiries || []).map((inquiry: InquiryRow) => inquiry.user_id))
    );

    const userMap = new Map<string, { id: string; email: string; name: string | null }>();
    
    if (userIds.length > 0) {
      // 각 유저의 정보를 auth.admin에서 가져오기
      const userInfoPromises = userIds.map(async (userId) => {
        try {
          const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
          if (error || !user) {
            return { id: userId, email: "", name: null };
          }
          return {
            id: user.id,
            email: user.email || "",
            name: (user.user_metadata?.name as string) || null,
          };
        } catch {
          return { id: userId, email: "", name: null };
        }
      });
      
      const userInfos = await Promise.all(userInfoPromises);
      userInfos.forEach((info) => userMap.set(info.id, info));
    }

    // 프로필 정보 포함 + 이미지 signed url 변환
    const inquiriesWithUser = await Promise.all(
      (inquiries || []).map(async (inquiry: InquiryRow) => {
        const userProfile = userMap.get(inquiry.user_id);
        return {
          id: inquiry.id,
          user_id: inquiry.user_id,
          type: inquiry.type,
          title: inquiry.title,
          content: inquiry.content,
          images: await toSignedUrls(supabase, inquiry.images || []),
          status: inquiry.status,
          admin_response: inquiry.admin_response,
          admin_response_images: await toSignedUrls(
            supabase,
            inquiry.admin_response_images || []
          ),
          created_at: inquiry.created_at,
          updated_at: inquiry.updated_at,
          user: userProfile
            ? {
                id: userProfile.id,
                email: userProfile.email,
                name: userProfile.name,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      inquiries: inquiriesWithUser,
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
