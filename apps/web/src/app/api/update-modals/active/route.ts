import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * GET /api/update-modals/active
 * 노출 중인 업데이트 모달 1개 조회 (소비자용, 인증 불필요)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const now = new Date().toISOString();

    const { data: modal, error } = await supabase
      .from("admin_update_modals")
      .select("*")
      .eq("is_displayed", true)
      .lte("display_from", now)
      .or(`display_until.is.null,display_until.gte.${now}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !modal) {
      return NextResponse.json({ modal: null });
    }

    const { data: urlData } = supabase.storage
      .from("admin-modal-images")
      .getPublicUrl(modal.image_path);
    const image_url = urlData.publicUrl;

    return NextResponse.json({
      modal: {
        ...modal,
        image_url,
      },
    });
  } catch (error) {
    console.error("활성 모달 조회 실패:", error);
    return NextResponse.json({ modal: null });
  }
}
