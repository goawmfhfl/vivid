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
  return new OpenAI({ apiKey });
}

/**
 * Daily Feedback 배열을 기반으로 주간 피드백 생성
 */
export async function generateWeeklyFeedbackFromDaily(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string }
): Promise<WeeklyFeedback> {
  const prompt = buildWeeklyFeedbackPrompt(dailyFeedbacks, range);
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
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
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content from OpenAI weekly feedback generation");
  }

  const parsed = JSON.parse(content) as WeeklyFeedbackResponse;
  return parsed.weekly_feedback;
}
