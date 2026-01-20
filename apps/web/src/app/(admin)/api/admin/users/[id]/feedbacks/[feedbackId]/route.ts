import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../util/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-service";

/**
 * DELETE /api/admin/users/[id]/feedbacks/[feedbackId]
 * 피드백 삭제
 * Query params: type (daily|weekly|monthly)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: userId, feedbackId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["daily", "weekly", "monthly"].includes(type)) {
      return NextResponse.json(
        { error: "유효하지 않은 피드백 타입입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 테이블 이름 결정
    const tableName =
      type === "daily"
        ? "daily_vivid"
        : type === "weekly"
        ? "weekly_vivid"
        : "monthly_vivid";

    // 삭제 전 유저 확인
    const { data: feedback } = await supabase
      .from(tableName)
      .select("user_id")
      .eq("id", feedbackId)
      .single();

    if (!feedback) {
      return NextResponse.json(
        { error: "피드백을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (feedback.user_id !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 삭제 실행
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq("id", feedbackId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("피드백 삭제 실패:", deleteError);
      return NextResponse.json(
        { error: "피드백을 삭제하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("피드백 삭제 실패:", error);
    return NextResponse.json(
      { error: "피드백을 삭제하는데 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]/feedbacks/[feedbackId]
 * 피드백 메타데이터 수정 (생성일, 날짜 범위 등)
 * Query params: type (daily|weekly|monthly)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; feedbackId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id: userId, feedbackId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const body = await request.json();

    if (!type || !["daily", "weekly", "monthly"].includes(type)) {
      return NextResponse.json(
        { error: "유효하지 않은 피드백 타입입니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 테이블 이름 결정
    const tableName =
      type === "daily"
        ? "daily_vivid"
        : type === "weekly"
        ? "weekly_vivid"
        : "monthly_vivid";

    // 수정 가능한 필드만 추출 (메타데이터만)
    const updateData: Record<string, unknown> = {};

    if (type === "daily") {
      if (body.report_date) updateData.report_date = body.report_date;
      if (body.day_of_week !== undefined)
        updateData.day_of_week = body.day_of_week;
    } else if (type === "weekly") {
      if (body.week_start) updateData.week_start = body.week_start;
      if (body.week_end) updateData.week_end = body.week_end;
    } else if (type === "monthly") {
      if (body.month) updateData.month = body.month;
      if (body.month_label) updateData.month_label = body.month_label;
      if (body.date_range) updateData.date_range = body.date_range;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "수정할 데이터가 없습니다." },
        { status: 400 }
      );
    }

    // 수정 전 유저 확인
    const { data: feedback } = await supabase
      .from(tableName)
      .select("user_id")
      .eq("id", feedbackId)
      .single();

    if (!feedback) {
      return NextResponse.json(
        { error: "피드백을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (feedback.user_id !== userId) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 수정 실행
    const { data, error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", feedbackId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("피드백 수정 실패:", updateError);
      return NextResponse.json(
        { error: "피드백을 수정하는데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("피드백 수정 실패:", error);
    return NextResponse.json(
      { error: "피드백을 수정하는데 실패했습니다." },
      { status: 500 }
    );
  }
}
