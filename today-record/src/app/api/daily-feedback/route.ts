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

    // 4️⃣ 결과 생성: OpenAI API 호출
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
    const feedback = JSON.parse(content) as any;

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
