import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/(app)/(admin)/api/admin/util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * GET /api/admin/update-modals/active
 * 노출 중인 모달 1개 조회 (관리자, dismiss 여부 확인)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;

  try {
    const supabase = getServiceSupabase();
    const now = new Date().toISOString();

    const { data: modal, error } = await supabase
      .from("admin_update_modals")
      .select("*")
      .eq("is_displayed", true)
      .lte("display_from", now)
      .or(`display_until.is.null,display_until.gte.${now}`)
      .limit(1)
      .single();

    if (error || !modal) {
      return NextResponse.json({ modal: null });
    }

    const { data: dismissal } = await supabase
      .from("admin_modal_dismissals")
      .select("id")
      .eq("admin_user_id", userId)
      .eq("modal_id", modal.id)
      .single();

    if (dismissal) {
      return NextResponse.json({ modal: null });
    }

    const { data: urlData } = supabase.storage
      .from("admin-modal-images")
      .getPublicUrl(modal.image_path);

    return NextResponse.json({
      modal: {
        ...modal,
        image_url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error("활성 모달 조회 실패:", error);
    return NextResponse.json({ modal: null });
  }
}
