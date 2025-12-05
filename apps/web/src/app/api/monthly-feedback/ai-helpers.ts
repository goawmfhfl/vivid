import OpenAI from "openai";
import {
  generateCacheKey,
  getFromCache,
  setCache,
  generatePromptCacheKey,
} from "../utils/cache";

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
    maxRetries: 1, // 재시도 최소화
  });
}

/**
 * AI 리포트 생성 헬퍼 함수
 */
export async function generateSection<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: { name: string; schema: any; strict: boolean },
  cacheKey: string,
  isPro: boolean = false,
  sectionName: string
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

  // Pro 멤버십에 따라 모델 선택
  const proModel = process.env.OPENAI_PRO_MODEL || "gpt-4o";
  const model = isPro ? proModel : "gpt-5-nano";

  // Pro 멤버십에 따라 프롬프트 강화
  const enhancedSystemPrompt = isPro
    ? `${systemPrompt}\n\n[Pro 멤버십: 더 상세하고 깊이 있는 분석을 제공하세요. 더 많은 세부사항과 인사이트를 포함하세요.]`
    : `${systemPrompt}\n\n[무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.]`;

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

    // 추적 정보를 결과에 첨부 (테스트 환경에서만)
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_NODE_ENV === "development"
    ) {
      const usage = completion.usage;
      const cachedTokens =
        (usage as any)?.prompt_tokens_details?.cached_tokens || 0;
      (result as any).__tracking = {
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
    const err = error as {
      message?: string;
      code?: string;
      status?: number;
      type?: string;
    };

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
      );
      (quotaError as any).code = "INSUFFICIENT_QUOTA";
      (quotaError as any).status = 429;
      throw quotaError;
    }

    // 모델 관련 에러 처리 (Fallback)
    if (
      err?.message?.includes("model") ||
      err?.code === "model_not_found" ||
      err?.status === 404
    ) {
      // Fallback
      const fallbackModel = isPro ? proModel : "gpt-5-nano";
      const fallbackCompletion = await openai.chat.completions.create({
        model: fallbackModel,
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

      const fallbackContent = fallbackCompletion.choices[0]?.message?.content;
      if (!fallbackContent) {
        throw new Error(`No content from OpenAI fallback (${schema.name})`);
      }

      const parsed = JSON.parse(fallbackContent);
      const result = parsed[sectionName] as T;
      setCache(proCacheKey, result);
      return result;
    }

    throw error;
  }
}
