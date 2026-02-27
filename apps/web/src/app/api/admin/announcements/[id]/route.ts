import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(app)/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * GET /api/admin/announcements/[id]
 * 공지 상세 (관리자)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "공지 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();

    const { data: announcement, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
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

    return NextResponse.json({
      ...announcement,
      images: images ?? [],
    });
  } catch (error) {
    console.error("공지 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "공지를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/announcements/[id]
 * 공지 수정 (관리자)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "공지 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      display_from,
      display_until,
      is_active,
      version,
      images,
    } = body as {
      title?: string;
      description?: string;
      display_from?: string;
      display_until?: string | null;
      is_active?: boolean;
      version?: string;
      images?: { image_path: string; sort_order: number }[];
    };

    const supabase = getServiceSupabase();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() ?? null;
    if (display_from !== undefined)
      updates.display_from = new Date(display_from).toISOString();
    if (display_until !== undefined)
      updates.display_until = display_until ? new Date(display_until).toISOString() : null;
    if (is_active !== undefined) updates.is_active = is_active;
    if (version !== undefined) updates.version = version?.trim() || "1.0.0";

    const { error: updateError } = await supabase
      .from("announcements")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error("공지 수정 실패:", updateError);
      return NextResponse.json(
        { error: "공지 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    if (images !== undefined && Array.isArray(images)) {
      await supabase.from("announcement_images").delete().eq("announcement_id", id);
      if (images.length > 0) {
        const imageRows = images.map((img, idx) => ({
          announcement_id: id,
          image_path: img.image_path,
          sort_order: img.sort_order ?? idx,
        }));
        const { error: imgError } = await supabase
          .from("announcement_images")
          .insert(imageRows);
        if (imgError) {
          console.error("공지 이미지 업데이트 실패:", imgError);
          return NextResponse.json(
            { error: "이미지 업데이트에 실패했습니다." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("공지 수정 실패:", error);
    return NextResponse.json(
      { error: "공지 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * 공지 삭제 (관리자)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "공지 ID가 필요합니다." }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("공지 삭제 실패:", error);
      return NextResponse.json(
        { error: "공지 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("공지 삭제 실패:", error);
    return NextResponse.json(
      { error: "공지 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
