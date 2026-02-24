import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "../../utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getStoragePublicUrl } from "@/lib/storage-url";

/**
 * GET /api/announcements/[id]
 * 공지 상세 + 이미지 목록 (인증 사용자)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    try {
      await getAuthenticatedUserIdFromRequest(request);
    } catch {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "공지 ID가 필요합니다." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const now = new Date().toISOString();

    const { data: announcement, error } = await supabase
      .from("announcements")
      .select("id, title, description, display_from, display_until, created_at")
      .eq("id", id)
      .eq("is_active", true)
      .lte("display_from", now)
      .or(`display_until.is.null,display_until.gte.${now}`)
      .single();

    if (error || !announcement) {
      return NextResponse.json(
        { error: "공지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { data: images } = await supabase
      .from("announcement_images")
      .select("id, image_path, sort_order")
      .eq("announcement_id", id)
      .order("sort_order", { ascending: true });

    const imagesWithUrl = (images ?? []).map((img) => ({
      ...img,
      image_url: getStoragePublicUrl("announcement-images", img.image_path),
    }));

    return NextResponse.json({
      ...announcement,
      images: imagesWithUrl,
    });
  } catch (error) {
    console.error("공지 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "공지를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
