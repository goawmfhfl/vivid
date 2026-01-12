import OpenAI from "openai";
import { getFromCache, setCache, generatePromptCacheKey } from "../utils/cache";
import type {
  ReportSchema,
  ExtendedUsage,
  WithTracking,
  ApiError,
} from "../types";
import { extractUsageInfo, logAIRequestAsync } from "@/lib/ai-usage-logger";

/**
 * OpenAI 클라이언트를 지연 초기화 (빌드 시점 오류 방지)
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable."
    );
  }
  return new OpenAI({
    apiKey,
    timeout: 300000, // 300초(5분) 타임아웃 - 월간 피드백 생성은 더 많은 데이터를 처리하므로 시간이 더 필요
    maxRetries: 0, // 재시도 최소화
  });
}

/**
 * AI 리포트 생성 헬퍼 함수
 */
export async function generateSection<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ReportSchema,
  cacheKey: string,
  isPro: boolean = false,
  sectionName: string,
  userId?: string,
  requestType:
    | "daily_feedback"
    | "weekly_feedback"
    | "monthly_feedback" = "monthly_feedback"
): Promise<T> {
  // 캐시에서 조회 (멤버십별로 캐시 키 구분)
  const proCacheKey = isPro ? `${cacheKey}_pro` : cacheKey;
  const cachedResult = getFromCache<T>(proCacheKey);
  if (cachedResult) {
    console.log(`캐시에서 결과 반환 (${schema.name}, Pro: ${isPro})`);
    return cachedResult;
  }

  const openai = getOpenAIClient();
  const promptCacheKey = generatePromptCacheKey(systemPrompt);

  // Monthly Feedback은 gpt-5.2를 사용하여 실패 없이 안정적으로 동작
  // Daily 점수 기반으로 정확도 향상 및 일관성 보정 역할
  const model = "gpt-5.2";

  // 전역 프롬프터와 시스템 프롬프트 결합
  const { enhanceSystemPromptWithGlobal } = await import(
    "../shared/global-prompt"
  );
  const enhancedSystemPrompt = enhanceSystemPromptWithGlobal(
    systemPrompt,
    isPro
  );

  const startTime = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: enhancedSystemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schema.name,
          schema: schema.schema,
          strict: schema.strict,
        },
      },
      prompt_cache_key: promptCacheKey,
    });

    const endTime = Date.now();
    const duration_ms = endTime - startTime;

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`No content from OpenAI (${schema.name})`);
    }

    const parsed = JSON.parse(content);
    // 스키마가 래퍼 객체를 반환하므로, 실제 섹션 데이터 추출
    const result = parsed[sectionName] as T;

    // 캐시에 저장 (멤버십별로 구분)
    setCache(proCacheKey, result);

    // AI 사용량 로깅 (userId가 제공된 경우에만, 캐시된 응답이 아닌 경우에만)
    if (userId) {
      const usage = extractUsageInfo(
        completion.usage as ExtendedUsage | undefined
      );
      if (usage) {
        logAIRequestAsync({
          userId,
          model,
          requestType,
          sectionName,
          usage,
          duration_ms,
          success: true,
        });
      }
    }

    // 추적 정보를 결과에 첨부 (테스트 환경에서만, 객체인 경우에만)
    if (
      (process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_NODE_ENV === "development") &&
      result !== null &&
      typeof result === "object" &&
      !Array.isArray(result)
    ) {
      const usage = completion.usage as ExtendedUsage | undefined;
      const cachedTokens = usage?.prompt_tokens_details?.cached_tokens || 0;
      (result as WithTracking<T>).__tracking = {
        name: schema.name,
        model,
        duration_ms,
        usage: {
          prompt_tokens: usage?.prompt_tokens || 0,
          completion_tokens: usage?.completion_tokens || 0,
          total_tokens: usage?.total_tokens || 0,
          cached_tokens: cachedTokens,
        },
      };
    }

    return result;
  } catch (error: unknown) {
    const err = error as ApiError;

    // AI 사용량 로깅 (에러 발생 시에도 로깅)
    if (userId) {
      const endTime = Date.now();
      const duration_ms = endTime - startTime;
      logAIRequestAsync({
        userId,
        model,
        requestType,
        sectionName,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
        duration_ms,
        success: false,
        errorMessage: err?.message || String(error),
      });
    }

    // 429 에러 (쿼터 초과) 처리
    if (
      err?.status === 429 ||
      err?.code === "insufficient_quota" ||
      err?.type === "insufficient_quota" ||
      err?.message?.includes("quota") ||
      err?.message?.includes("429")
    ) {
      const quotaError = new Error(
        `OpenAI API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요. (${schema.name})`
      ) as ApiError;
      quotaError.code = "INSUFFICIENT_QUOTA";
      quotaError.status = 429;
      throw quotaError;
    }

    throw error;
  }
}
