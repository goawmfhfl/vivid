import OpenAI from "openai";
import { WeeklyFeedbackSchema, SYSTEM_PROMPT_WEEKLY } from "./schema";
import type { DailyFeedbackForWeekly, WeeklyFeedbackResponse } from "./types";
import { buildWeeklyFeedbackPrompt } from "./prompts";
import type { WeeklyFeedback } from "@/types/weekly-feedback";

/**
 * OpenAI 클라이언트를 지연 초기화 (빌드 시점 오류 방지)
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable."
    );
  }
  return new OpenAI({
    apiKey,
    timeout: 180000, // 180초(3분) 타임아웃 - 주간 피드백 생성은 더 많은 데이터를 처리하므로 시간이 더 필요
    maxRetries: 1, // 재시도 최소화
  });
}

/**
 * Daily Feedback 배열을 기반으로 주간 피드백 생성
 */
export async function generateWeeklyFeedbackFromDaily(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  emotionOverviewData?: {
    daily_emotions: Array<{
      date: string;
      weekday: string;
      ai_mood_valence: number | null;
      ai_mood_arousal: number | null;
      dominant_emotion: string | null;
    }>;
    avg_valence: number | null;
    avg_arousal: number | null;
  }
): Promise<WeeklyFeedback> {
  const prompt = buildWeeklyFeedbackPrompt(
    dailyFeedbacks,
    range,
    emotionOverviewData
  );
  const openai = getOpenAIClient();

  // 기본값을 gpt-5-mini로 설정 (사용 불가능하면 gpt-4o-mini로 fallback)
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_WEEKLY },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: WeeklyFeedbackSchema.name,
          schema: WeeklyFeedbackSchema.schema,
          strict: WeeklyFeedbackSchema.strict,
        },
      },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from OpenAI weekly feedback generation");
    }

    const parsed = JSON.parse(content) as WeeklyFeedbackResponse;
    return parsed.weekly_feedback;
  } catch (error: any) {
    // gpt-5-mini가 사용 불가능한 경우 gpt-4o-mini로 fallback
    if (
      model === "gpt-5-mini" &&
      (error?.message?.includes("model") ||
        error?.code === "model_not_found" ||
        error?.status === 404 ||
        error?.message?.includes("timeout"))
    ) {
      console.warn(
        `gpt-5-mini 모델을 사용할 수 없습니다. gpt-4o-mini로 fallback합니다.`,
        error.message
      );
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT_WEEKLY },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: WeeklyFeedbackSchema.name,
            schema: WeeklyFeedbackSchema.schema,
            strict: WeeklyFeedbackSchema.strict,
          },
        },
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI weekly feedback generation");
      }

      const parsed = JSON.parse(content) as WeeklyFeedbackResponse;
      return parsed.weekly_feedback;
    }
    throw error;
  }
}
