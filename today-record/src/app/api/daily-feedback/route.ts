import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServiceSupabase } from "@/lib/supabase-service";
import { DailyFeedbackSchema, SYSTEM_PROMPT } from "./schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Records 타입 정의
interface Record {
  id: number;
  user_id: string;
  type: "insight" | "feedback";
  content: string;
  created_at: string;
  kst_date: string;
}

// buildUserPrompt 함수: records 데이터를 프롬프트로 변환
function buildUserPrompt(records: Record[], date: string): string {
  const insights = records.filter((r) => r.type === "insight");
  const feedbacks = records.filter((r) => r.type === "feedback");

  let prompt = `아래는 ${date} 하루의 기록입니다. 위 스키마에 따라 분석하여 JSON만 출력하세요.\n\n`;

  // Insight 섹션
  if (insights.length > 0) {
    prompt += "=== 인사이트 기록 ===\n";
    insights.forEach((record, idx) => {
      prompt += `${idx + 1}. ${record.content}\n`;
    });
    prompt += "\n";
  }

  // Feedback 섹션
  if (feedbacks.length > 0) {
    prompt += "=== 피드백 기록 ===\n";
    feedbacks.forEach((record, idx) => {
      prompt += `${idx + 1}. ${record.content}\n`;
    });
  }

  return prompt;
}

// POST 핸들러
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date } = body;
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    if (!userId || !date) {
      return NextResponse.json(
        { error: "userId and date are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Records 데이터 조회
    const supabaseServiceKey = getServiceSupabase();

    const { data: records, error: recordsError } = await supabaseServiceKey
      .from("records")
      .select("*")
      .eq("user_id", userId)
      .eq("kst_date", date);

    if (recordsError) {
      console.error("Records fetch error:", recordsError);
      return NextResponse.json(
        { error: "Failed to fetch records" },
        { status: 500 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "No records found for this date" },
        { status: 404 }
      );
    }

    // 4️⃣ 결과 생성: dummy 모드면 OpenAI 건너뛰고 더미 데이터 사용
    let feedback: any;
    if (mode === "dummy" || process.env.DAILY_FEEDBACK_DUMMY === "2") {
      // 간단한 더미 데이터 (스키마에 맞춤)
      const dayNames = [
        "일요일",
        "월요일",
        "화요일",
        "수요일",
        "목요일",
        "금요일",
        "토요일",
      ];
      const d = new Date(date);
      const day_of_week = dayNames[d.getDay()];

      feedback = {
        date,
        day_of_week,
        integrity_score: 7,
        narrative_summary:
          "더미: 오늘은 기록을 기반으로 하루를 점검하고 다음을 준비한 날이었습니다.",
        emotion_curve: ["기대", "몰입", "안도"],
        narrative:
          "더미: 오전엔 가벼운 불안이 있었지만 오후엔 몰입해 핵심 작업을 진행했습니다.",
        lesson: "더미: 시작하면 속도가 붙는다.",
        keywords: ["더미", "루틴", "집중"],
        daily_ai_comment: "더미: 오늘의 리듬이 안정적이었습니다.",
        vision_summary: "더미: 작은 성장을 꾸준히.",
        vision_self: "더미: 실행과 점검이 균형을 이룸.",
        vision_keywords: ["일관성", "점검"],
        reminder_sentence: "더미: 완벽보다 실행.",
        vision_ai_feedback: "더미: 좋은 방향입니다.",
        core_insight: "더미: 불확실함은 시작의 신호.",
        learning_source: "더미: 업무 중 메모",
        meta_question: "더미: 내일 한 걸음 더 나아갈 수 있는 일은?",
        insight_ai_comment: "더미: 시각 전환이 도움이 됩니다.",
        core_feedback: "더미: 필요한 일에 시간을 배분함.",
        positives: ["더미: 우선순위 정리", "더미: 산만함 차단"],
        improvements: ["더미: 휴식 타이밍 명확히"],
        feedback_ai_comment: "더미: 루틴 강화 추천.",
        ai_message: "더미: 한 걸음씩이 가장 빠릅니다.",
        growth_point: "더미: 시작 저항 감소",
        adjustment_point: "더미: 회고 시간 고정",
        tomorrow_focus: "더미: 핵심 작업 90분 블록 2회",
        integrity_reason: "더미: 계획 대비 실행률 양호",
      };
    } else {
      const userPrompt = buildUserPrompt(records as Record[], date);
      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: DailyFeedbackSchema.name,
            schema: DailyFeedbackSchema.schema,
            strict: DailyFeedbackSchema.strict,
          },
        },
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return NextResponse.json(
          { error: "No content from OpenAI" },
          { status: 500 }
        );
      }
      feedback = JSON.parse(content) as any;
    }

    // 6️⃣ Supabase daily_feedback 테이블에 저장 (새 스키마 매핑)
    const { data: insertedData, error: insertError } = await supabaseServiceKey
      .from("daily_feedback")
      .upsert(
        {
          user_id: userId,
          report_date: feedback.date,
          day_of_week: feedback.day_of_week ?? null,
          integrity_score: feedback.integrity_score ?? null,
          narrative_summary: feedback.narrative_summary ?? null,
          emotion_curve: feedback.emotion_curve ?? [],

          narrative: feedback.narrative ?? null,
          lesson: feedback.lesson ?? null,
          keywords: feedback.keywords ?? [],
          daily_ai_comment: feedback.daily_ai_comment ?? null,

          vision_summary: feedback.vision_summary ?? null,
          vision_self: feedback.vision_self ?? null,
          vision_keywords: feedback.vision_keywords ?? [],
          reminder_sentence: feedback.reminder_sentence ?? null,
          vision_ai_feedback: feedback.vision_ai_feedback ?? null,

          core_insight: feedback.core_insight ?? null,
          learning_source: feedback.learning_source ?? null,
          meta_question: feedback.meta_question ?? null,
          insight_ai_comment: feedback.insight_ai_comment ?? null,

          core_feedback: feedback.core_feedback ?? null,
          positives: feedback.positives ?? [],
          improvements: feedback.improvements ?? [],
          feedback_ai_comment: feedback.feedback_ai_comment ?? null,

          ai_message: feedback.ai_message ?? null,
          growth_point: feedback.growth_point ?? null,
          adjustment_point: feedback.adjustment_point ?? null,
          tomorrow_focus: feedback.tomorrow_focus ?? null,
          integrity_reason: feedback.integrity_reason ?? null,
        },
        { onConflict: "user_id,report_date" }
      )
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        {
          error: "Failed to save feedback to database",
          details: insertError.message || String(insertError),
          code: insertError.code,
          hint: insertError.hint,
        },
        { status: 500 }
      );
    }

    if (!insertedData || insertedData.length === 0) {
      return NextResponse.json(
        { error: "Failed to save feedback to database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Daily report generated and saved successfully",
        data: feedback,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
