import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST /api/admin/update-modals/[id]/dismiss
 * 다시 보지 않기 저장
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const { userId } = authResult;

  if (!id) {
    return NextResponse.json(
      { error: "모달 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = getServiceSupabase();

    const { error } = await supabase.from("admin_modal_dismissals").upsert(
      {
        admin_user_id: userId,
        modal_id: id,
        dismissed_at: new Date().toISOString(),
      },
      {
        onConflict: "admin_user_id,modal_id",
      }
    );

    if (error) {
      console.error("다시 보지 않기 저장 실패:", error);
      return NextResponse.json(
        { error: "저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("다시 보지 않기 저장 실패:", error);
    return NextResponse.json(
      { error: "저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
