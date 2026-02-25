import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "../utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getStoragePublicUrl } from "@/lib/storage-url";

/**
 * GET /api/announcements
 * 공지 목록 조회 (인증 사용자)
 */
export async function GET(request: NextRequest) {
  try {
    try {
      await getAuthenticatedUserIdFromRequest(request);
    } catch {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();
    const now = new Date().toISOString();

    const { data: announcements, error } = await supabase
      .from("announcements")
      .select(
        `
        id,
        title,
        description,
        display_from,
        display_until,
        sort_order,
        created_at,
        version
      `
      )
      .eq("is_active", true)
      .lte("display_from", now)
      .or(`display_until.is.null,display_until.gte.${now}`)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("공지 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "공지 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 각 공지의 첫 번째 이미지 썸네일 경로 조회
    const withThumbnails = await Promise.all(
      (announcements || []).map(async (a) => {
        const { data: firstImage } = await supabase
          .from("announcement_images")
          .select("image_path")
          .eq("announcement_id", a.id)
          .order("sort_order", { ascending: true })
          .limit(1)
          .single();
        return {
          ...a,
          thumbnail_path: firstImage?.image_path ?? null,
          thumbnail_url: firstImage?.image_path
            ? getStoragePublicUrl("announcement-images", firstImage.image_path)
            : null,
        };
      })
    );

    return NextResponse.json({ announcements: withThumbnails });
  } catch (error) {
    console.error("공지 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "공지 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
