import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserIdFromRequest } from "../../../utils/auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * POST /api/announcements/[id]/feedback
 * 공지사항 피드백 제출 (인증 사용자, 별점 없음)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserIdFromRequest(request);
    const { id: announcementId } = await params;

    if (!announcementId) {
      return NextResponse.json(
        { error: "공지 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { error: "내용을 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "내용은 2000자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const now = new Date().toISOString();

    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .select("id")
      .eq("id", announcementId)
      .eq("is_active", true)
      .lte("display_from", now)
      .or(`display_until.is.null,display_until.gte.${now}`)
      .single();

    if (announcementError || !announcement) {
      return NextResponse.json(
        { error: "공지를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { data: feedback, error } = await supabase
      .from("user_feedbacks")
      .insert({
        user_id: userId,
        page_type: "announcement",
        rating: null,
        comment: content,
        announcement_id: announcementId,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("공지 피드백 저장 실패:", error);
      return NextResponse.json(
        { error: "피드백을 저장하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "피드백이 등록되었습니다.",
        feedback: { id: feedback.id, created_at: feedback.created_at },
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    if (msg.includes("Unauthorized") || msg.includes("Missing")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    console.error("공지 피드백 제출 실패:", err);
    return NextResponse.json(
      { error: "피드백 제출에 실패했습니다." },
      { status: 500 }
    );
  }
}
