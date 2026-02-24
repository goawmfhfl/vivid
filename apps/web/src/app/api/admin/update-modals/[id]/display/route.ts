import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST /api/admin/update-modals/[id]/display
 * 노출하기: 해당 모달만 is_displayed=true, 나머지 false
 */
export async function POST(
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

    await supabase
      .from("admin_update_modals")
      .update({ is_displayed: false, updated_at: new Date().toISOString() })
      .eq("is_displayed", true);

    const { data, error } = await supabase
      .from("admin_update_modals")
      .update({
        is_displayed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "모달을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ modal: data });
  } catch (error) {
    console.error("모달 노출 설정 실패:", error);
    return NextResponse.json(
      { error: "모달 노출 설정에 실패했습니다." },
      { status: 500 }
    );
  }
}
