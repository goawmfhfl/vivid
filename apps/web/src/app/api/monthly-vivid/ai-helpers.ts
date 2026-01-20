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
    timeout: 300000, // 300초(5분) 타임아웃 - 월간 비비드 생성은 더 많은 데이터를 처리하므로 시간이 더 필요
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
    | "daily_vivid"
    | "weekly_vivid"
    | "monthly_vivid" = "monthly_vivid"
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

  // Monthly Vivid은 gpt-5.2를 사용하여 실패 없이 안정적으로 동작
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

    let result: T;

    // parsed가 이미 직접 객체인 경우 (래퍼 없이)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      Object.keys(parsed).length > 0
    ) {
      const firstValue = Object.values(parsed)[0];

      // 첫 번째 값이 객체인 경우
      if (
        firstValue !== null &&
        firstValue !== undefined &&
        typeof firstValue === "object" &&
        !Array.isArray(firstValue)
      ) {
        result = firstValue as T;
      } else if (typeof firstValue === "string") {
        // 첫 번째 값이 문자열인 경우 - parsed 자체를 확인하거나 다른 키 확인
        console.warn(
          `[${schema.name}] First value is string, checking parsed structure:`,
          {
            parsed,
            parsedKeys: Object.keys(parsed),
            firstValue,
          }
        );

        // parsed가 직접 원하는 구조인지 확인 (예: { report: {...} })
        // 또는 다른 키를 확인
        const keys = Object.keys(parsed);
        const objectValue = keys.find(
          (key) =>
            parsed[key] !== null &&
            parsed[key] !== undefined &&
            typeof parsed[key] === "object" &&
            !Array.isArray(parsed[key])
        );

        if (objectValue) {
          result = parsed[objectValue] as T;
        } else {
          // parsed 자체가 원하는 객체인 경우
          result = parsed as T;
        }
      } else {
        // 그 외의 경우 parsed 자체를 사용
        result = parsed as T;
      }
    } else {
      // parsed가 배열이거나 null인 경우
      result = parsed as T;
    }

    // 결과 검증 및 로깅
    if (
      result === null ||
      result === undefined ||
      typeof result !== "object" ||
      Array.isArray(result)
    ) {
      console.error(`generateSection: result is invalid for ${schema.name}`, {
        resultType: typeof result,
        result,
        parsed,
        parsedKeys: Object.keys(parsed || {}),
        parsedValues: Object.values(parsed || {}),
      });
      throw new Error(
        `Invalid response format for ${
          schema.name
        }: expected object but got ${typeof result}. This may indicate a schema mismatch.`
      );
    }

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
