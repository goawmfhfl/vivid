import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(app)/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * GET /api/admin/update-modals/[id]
 * 모달 상세 (관리자)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "모달 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("admin_update_modals")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "모달을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("모달 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "모달을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/update-modals/[id]
 * 모달 수정 (관리자)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "모달 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      image_path,
      destination_path,
      display_from,
      display_until,
      is_displayed,
    } = body as {
      title?: string;
      image_path?: string;
      destination_path?: string;
      display_from?: string;
      display_until?: string | null;
      is_displayed?: boolean;
    };

    const supabase = getServiceSupabase();

    if (is_displayed === true) {
      await supabase
        .from("admin_update_modals")
        .update({ is_displayed: false, updated_at: new Date().toISOString() })
        .eq("is_displayed", true);
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title.trim();
    if (image_path !== undefined) updates.image_path = image_path.trim();
    if (destination_path !== undefined)
      updates.destination_path = destination_path.trim().startsWith("/")
        ? destination_path.trim()
        : `/${destination_path.trim()}`;
    if (display_from !== undefined)
      updates.display_from = new Date(display_from).toISOString();
    if (display_until !== undefined)
      updates.display_until = display_until
        ? new Date(display_until).toISOString()
        : null;
    if (is_displayed !== undefined) updates.is_displayed = is_displayed;

    const { error } = await supabase
      .from("admin_update_modals")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("모달 수정 실패:", error);
      return NextResponse.json(
        { error: "모달 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("모달 수정 실패:", error);
    return NextResponse.json(
      { error: "모달 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/update-modals/[id]
 * 모달 삭제 (관리자)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "모달 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from("admin_update_modals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("모달 삭제 실패:", error);
      return NextResponse.json(
        { error: "모달 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("모달 삭제 실패:", error);
    return NextResponse.json(
      { error: "모달 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
