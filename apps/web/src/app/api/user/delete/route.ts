import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { getAuthenticatedUserId } from "@/app/api/utils/auth";
import { createHash } from "crypto";

/**
 * DELETE /api/user/delete
 * 회원 탈퇴 - 사용자의 모든 데이터를 삭제하고 계정을 삭제합니다.
 */
export async function DELETE(request: NextRequest) {
  try {
    // 인증된 사용자 ID 가져오기
    const userId = await getAuthenticatedUserId(request);
    const supabase = getServiceSupabase();

    // 요청 본문에서 탈퇴 사유 가져오기
    let deletionReasons: string[] = [];
    let additionalComment: string | null = null;

    try {
      const body = await request.json();
      deletionReasons = body.reasons || [];
      additionalComment = body.additionalComment || null;
    } catch {
      // 본문이 없거나 파싱 실패 시 무시 (기존 동작 유지)
    }

    // 탈퇴 사유가 있으면 먼저 저장 (익명화)
    if (deletionReasons.length > 0 || additionalComment) {
      // user_id를 SHA256으로 해시화하여 익명화
      const anonymizedUserId = createHash("sha256")
        .update(userId)
        .digest("hex");

      const { error: deletionError } = await supabase
        .from("account_deletions")
        .insert({
          anonymized_user_id: anonymizedUserId,
          reasons: deletionReasons,
          additional_comment: additionalComment,
          deleted_at: new Date().toISOString(),
        });

      if (deletionError) {
        console.error("탈퇴 사유 저장 실패:", deletionError);
        // 탈퇴 사유 저장 실패해도 계정 삭제는 계속 진행
        console.warn(
          "탈퇴 사유 저장에 실패했지만 계정 삭제는 계속 진행합니다."
        );
      }
    }

    // 1. vivid_records 테이블에서 사용자 기록 삭제
    const { error: recordsError } = await supabase
      .from("vivid_records")
      .delete()
      .eq("user_id", userId);

    if (recordsError) {
      console.error("Records 삭제 실패:", recordsError);
      throw new Error(`Failed to delete vivid_records: ${recordsError.message}`);
    }

    // 2. daily_vivid 테이블에서 일일 리포트 삭제
    const { error: dailyVividError } = await supabase
      .from("daily_vivid")
      .delete()
      .eq("user_id", userId);

    if (dailyVividError) {
      console.error("Daily Vivid 삭제 실패:", dailyVividError);
      throw new Error(
        `Failed to delete daily_vivid: ${dailyVividError.message}`
      );
    }

    // 3. weekly_vivid 테이블에서 주간 리포트 삭제
    const { error: weeklyVividError } = await supabase
      .from("weekly_vivid")
      .delete()
      .eq("user_id", userId);

    if (weeklyVividError) {
      console.error("Weekly Vivid 삭제 실패:", weeklyVividError);
      throw new Error(
        `Failed to delete weekly_vivid: ${weeklyVividError.message}`
      );
    }

    // 4. monthly_vivid 테이블에서 월간 리포트 삭제
    const { error: monthlyVividError } = await supabase
      .from("monthly_vivid")
      .delete()
      .eq("user_id", userId);

    if (monthlyVividError) {
      console.error("Monthly Vivid 삭제 실패:", monthlyVividError);
      throw new Error(
        `Failed to delete monthly_vivid: ${monthlyVividError.message}`
      );
    }

    // 5. user_feedbacks 테이블에서 사용자 피드백 삭제 (user_id 컬럼이 있는 경우만)
    // user_id 컬럼이 없을 수 있으므로 에러가 발생해도 계속 진행
    const { error: feedbacksError } = await supabase
      .from("user_feedbacks")
      .delete()
      .eq("user_id", userId);

    if (feedbacksError) {
      // user_id 컬럼이 없는 경우 (42703 에러 코드)는 무시하고 계속 진행
      if (feedbacksError.code === "42703") {
        console.warn(
          "user_feedbacks 테이블에 user_id 컬럼이 없습니다. 건너뜁니다."
        );
      } else {
        console.error("User Feedbacks 삭제 실패:", feedbacksError);
        // 다른 에러는 로그만 남기고 계속 진행 (선택적 데이터이므로)
        console.warn(
          `user_feedbacks 삭제 중 오류 발생했지만 계속 진행: ${feedbacksError.message}`
        );
      }
    }

    // 6. ai_requests 테이블은 ON DELETE CASCADE로 자동 삭제됨

    // 7. Supabase Auth에서 사용자 계정 삭제
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
      userId
    );

    if (deleteUserError) {
      console.error("사용자 계정 삭제 실패:", deleteUserError);
      throw new Error(
        `Failed to delete user account: ${deleteUserError.message}`
      );
    }

    return NextResponse.json(
      { message: "회원 탈퇴가 완료되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("회원 탈퇴 API 오류:", error);
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    if (errorMessage.includes("Unauthorized")) {
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    return NextResponse.json(
      { error: "회원 탈퇴 처리 중 오류가 발생했습니다.", details: errorMessage },
      { status: 500 }
    );
  }
}
