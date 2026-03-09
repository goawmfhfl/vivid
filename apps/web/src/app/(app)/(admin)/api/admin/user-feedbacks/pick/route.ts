import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

type PickRequestBody = {
  id?: string;
  picked?: boolean;
};

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = (await request.json()) as PickRequestBody;
    const id = body.id?.trim();
    const picked = body.picked === true;

    if (!id) {
      return NextResponse.json(
        { error: "피드백 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: feedback, error: feedbackError } = await supabase
      .from("user_feedbacks")
      .select("id, picked_for_membership")
      .eq("id", id)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json(
        { error: "피드백을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (picked && feedback.picked_for_membership !== true) {
      const { count, error: countError } = await supabase
        .from("user_feedbacks")
        .select("id", { count: "exact", head: true })
        .eq("picked_for_membership", true);

      if (countError) {
        throw new Error(`Failed to count picked feedbacks: ${countError.message}`);
      }

      if ((count ?? 0) >= 3) {
        return NextResponse.json(
          { error: "멤버십 페이지에는 최대 3개의 리뷰만 노출할 수 있습니다." },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("user_feedbacks")
      .update({ picked_for_membership: picked })
      .eq("id", id)
      .select("id, picked_for_membership")
      .single();

    if (error || !data) {
      throw new Error(`Failed to update picked state: ${error?.message ?? "unknown"}`);
    }

    return NextResponse.json({
      id: data.id,
      pickedForMembership: data.picked_for_membership ?? false,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "피드백 노출 상태 변경에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
