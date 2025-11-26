import OpenAI from "openai";
import { MonthlyReportSchema, SYSTEM_PROMPT_MONTHLY } from "./schema";
import type { DailyFeedbackForMonthly, MonthlyFeedbackResponse } from "./types";
import { buildMonthlyFeedbackPrompt } from "./prompts";
import type { MonthlyFeedback } from "@/types/monthly-feedback";
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
    timeout: 300000, // 300초(5분) 타임아웃 - 월간 피드백 생성은 더 많은 데이터를 처리하므로 시간이 더 필요
    maxRetries: 1, // 재시도 최소화
  });
}

/**
 * Daily Feedback 배열을 기반으로 월간 피드백 생성
 */
export async function generateMonthlyFeedbackFromDaily(
  dailyFeedbacks: DailyFeedbackForMonthly,
  month: string,
  dateRange: { start_date: string; end_date: string },
  categorizedRecords?: Map<
    string,
    {
      insights: string[];
      feedbacks: string[];
      visualizings: string[];
      emotions: string[];
    }
  >
): Promise<MonthlyFeedback> {
  const prompt = buildMonthlyFeedbackPrompt(
    dailyFeedbacks,
    month,
    dateRange,
    categorizedRecords
  );
  const openai = getOpenAIClient();

  // 기본값을 gpt-5로 설정 (사용 불가능하면 gpt-4o-mini로 fallback)
  const model = process.env.OPENAI_MODEL || "gpt-5";

  // 캐시 키 생성
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_MONTHLY, prompt);

  // 캐시에서 조회
  const cachedResult = getFromCache<MonthlyFeedback>(cacheKey);
  if (cachedResult) {
    console.log("캐시에서 결과 반환 (generateMonthlyFeedbackFromDaily)");
    return cachedResult;
  }

  try {
    // OpenAI CachedInput: prompt_cache_key를 사용하여 OpenAI가 자동으로 캐시 확인 및 사용
    const promptCacheKey = generatePromptCacheKey(SYSTEM_PROMPT_MONTHLY);

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_MONTHLY,
          // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
        },
        { role: "user", content: prompt }, // 사용자 입력(dailyFeedbacks 등)은 매번 다르므로 캐싱 불가
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: MonthlyReportSchema.name,
          schema: MonthlyReportSchema.schema,
          strict: MonthlyReportSchema.strict,
        },
      },
      temperature: 0.3,
      // OpenAI가 자동으로 캐시를 확인하고 사용하도록 prompt_cache_key 설정
      prompt_cache_key: promptCacheKey,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from OpenAI monthly feedback generation");
    }

    const parsed = JSON.parse(content);
    
    // 응답 구조 검증: 스키마가 래퍼 없이 직접 객체를 반환하므로
    // monthly_feedback 래퍼가 있는지 확인하고, 없으면 직접 사용
    let result: MonthlyFeedback;
    if (parsed && parsed.monthly_feedback) {
      result = parsed.monthly_feedback;
    } else if (parsed && parsed.month) {
      // 래퍼 없이 직접 MonthlyFeedback 객체가 반환된 경우
      result = parsed as MonthlyFeedback;
    } else {
      console.error("Invalid response structure:", parsed);
      throw new Error(
        "Invalid response from OpenAI: unexpected response structure"
      );
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
      const promptCacheKey = generatePromptCacheKey(SYSTEM_PROMPT_MONTHLY);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT_MONTHLY,
            // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
          },
          { role: "user", content: prompt }, // 사용자 입력은 매번 다르므로 캐싱 불가
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: MonthlyReportSchema.name,
            schema: MonthlyReportSchema.schema,
            strict: MonthlyReportSchema.strict,
          },
        },
        temperature: 0.3,
        prompt_cache_key: promptCacheKey,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI monthly feedback generation");
      }

      const parsed = JSON.parse(content);
      
      // 응답 구조 검증: 스키마가 래퍼 없이 직접 객체를 반환하므로
      // monthly_feedback 래퍼가 있는지 확인하고, 없으면 직접 사용
      let result: MonthlyFeedback;
      if (parsed && parsed.monthly_feedback) {
        result = parsed.monthly_feedback;
      } else if (parsed && parsed.month) {
        // 래퍼 없이 직접 MonthlyFeedback 객체가 반환된 경우
        result = parsed as MonthlyFeedback;
      } else {
        console.error("Invalid response structure (fallback):", parsed);
        throw new Error(
          "Invalid response from OpenAI (fallback): unexpected response structure"
        );
      }

      // 캐시에 저장
      setCache(cacheKey, result);

      return result;
    }
    throw error;
  }
}
