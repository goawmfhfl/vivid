import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * GET /api/admin/announcements
 * 공지 목록 조회 (관리자)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getServiceSupabase();

    const { data: announcements, error } = await supabase
      .from("announcements")
      .select(
        `
        id,
        title,
        description,
        display_from,
        display_until,
        is_active,
        sort_order,
        version,
        created_at,
        updated_at
      `
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("공지 목록 조회 실패:", error);
      return NextResponse.json(
        { error: "공지 목록을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    const withImageCount = await Promise.all(
      (announcements || []).map(async (a) => {
        const { count } = await supabase
          .from("announcement_images")
          .select("id", { count: "exact", head: true })
          .eq("announcement_id", a.id);
        return { ...a, image_count: count ?? 0 };
      })
    );

    return NextResponse.json({ announcements: withImageCount });
  } catch (error) {
    console.error("공지 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "공지 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/announcements
 * 공지 생성 (관리자)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { title, description, display_from, display_until, version, images } = body as {
      title: string;
      description?: string;
      display_from?: string;
      display_until?: string | null;
      version?: string;
      images?: { image_path: string; sort_order: number }[];
    };

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "제목을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: announcement, error } = await supabase
      .from("announcements")
      .insert({
        title: title.trim(),
        description: description?.trim() ?? null,
        display_from: display_from ? new Date(display_from).toISOString() : new Date().toISOString(),
        display_until: display_until ? new Date(display_until).toISOString() : null,
        is_active: true,
        sort_order: 0,
        version: version?.trim() || "1.0.0",
      })
      .select("id")
      .single();

    if (error || !announcement) {
      console.error("공지 생성 실패:", error);
      return NextResponse.json(
        { error: "공지 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    if (images && Array.isArray(images) && images.length > 0) {
      const imageRows = images.map((img, idx) => ({
        announcement_id: announcement.id,
        image_path: img.image_path,
        sort_order: img.sort_order ?? idx,
      }));
      const { error: imgError } = await supabase
        .from("announcement_images")
        .insert(imageRows);
      if (imgError) {
        console.error("공지 이미지 저장 실패:", imgError);
        await supabase.from("announcements").delete().eq("id", announcement.id);
        return NextResponse.json(
          { error: "이미지 저장에 실패했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("공지 생성 실패:", error);
    return NextResponse.json(
      { error: "공지 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
