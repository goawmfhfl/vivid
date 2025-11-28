import OpenAI from "openai";
import { WeeklyFeedbackSchema, SYSTEM_PROMPT_WEEKLY } from "./schema";
import type { DailyFeedbackForWeekly, WeeklyFeedbackResponse } from "./types";
import { buildWeeklyFeedbackPrompt } from "./prompts";
import type { WeeklyFeedback } from "@/types/weekly-feedback";
import {
  generateCacheKey,
  getFromCache,
  setCache,
  generatePromptCacheKey,
} from "../utils/cache";

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
  range: { start: string; end: string; timezone: string }
): Promise<WeeklyFeedback> {
  const prompt = buildWeeklyFeedbackPrompt(dailyFeedbacks, range);
  const openai = getOpenAIClient();

  // 기본값을 gpt-5로 설정 (사용 불가능하면 gpt-4o-mini로 fallback)
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  // 캐시 키 생성
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_WEEKLY, prompt);

  // 캐시에서 조회
  const cachedResult = getFromCache<WeeklyFeedback>(cacheKey);
  if (cachedResult) {
    console.log("캐시에서 결과 반환 (generateWeeklyFeedbackFromDaily)");
    return cachedResult;
  }

  try {
    // OpenAI CachedInput: prompt_cache_key를 사용하여 OpenAI가 자동으로 캐시 확인 및 사용
    const promptCacheKey = generatePromptCacheKey(SYSTEM_PROMPT_WEEKLY);

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_WEEKLY,
          // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
        },
        { role: "user", content: prompt }, // 사용자 입력(dailyFeedbacks 등)은 매번 다르므로 캐싱 불가
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: WeeklyFeedbackSchema.name,
          schema: WeeklyFeedbackSchema.schema,
          strict: WeeklyFeedbackSchema.strict,
        },
      },
      // OpenAI가 자동으로 캐시를 확인하고 사용하도록 prompt_cache_key 설정
      prompt_cache_key: promptCacheKey,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from OpenAI weekly feedback generation");
    }

    const parsed = JSON.parse(content) as WeeklyFeedbackResponse;
    const result = parsed.weekly_feedback;

    // AI 응답에서 title이 최상위에 있으면 weekly_overview로 이동
    const resultWithTitle = result as WeeklyFeedback & { title?: string };
    if (resultWithTitle.title && !result.weekly_overview.title) {
      result.weekly_overview.title = resultWithTitle.title;
      delete resultWithTitle.title;
    }

    // 캐시에 저장
    setCache(cacheKey, result);

    return result;
  } catch (error: unknown) {
    // gpt-5가 사용 불가능한 경우 gpt-4o-mini로 fallback
    const err = error as {
      message?: string;
      code?: string;
      status?: number;
    };
    if (
      model === "gpt-5" &&
      (err?.message?.includes("model") ||
        err?.code === "model_not_found" ||
        err?.status === 404 ||
        err?.message?.includes("timeout"))
    ) {
      // Fallback 시에도 동일한 캐시 키 사용
      const promptCacheKey = generatePromptCacheKey(SYSTEM_PROMPT_WEEKLY);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT_WEEKLY,
            // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
          },
          { role: "user", content: prompt }, // 사용자 입력은 매번 다르므로 캐싱 불가
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: WeeklyFeedbackSchema.name,
            schema: WeeklyFeedbackSchema.schema,
            strict: WeeklyFeedbackSchema.strict,
          },
        },

        prompt_cache_key: promptCacheKey,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI weekly feedback generation");
      }

      const parsed = JSON.parse(content) as WeeklyFeedbackResponse;
      const result = parsed.weekly_feedback;

      // AI 응답에서 title이 최상위에 있으면 weekly_overview로 이동
      const resultWithTitle = result as WeeklyFeedback & { title?: string };
      if (resultWithTitle.title && !result.weekly_overview.title) {
        result.weekly_overview.title = resultWithTitle.title;
        delete resultWithTitle.title;
      }

      // 캐시에 저장
      setCache(cacheKey, result);

      return result;
    }
    throw error;
  }
}
