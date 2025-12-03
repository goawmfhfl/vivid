import OpenAI from "openai";
import {
  DailyReportSchema,
  SYSTEM_PROMPT,
  RecordCategorizationSchema,
  SYSTEM_PROMPT_CATEGORIZATION,
} from "./schema";
import type { Record, CategorizedRecords, DailyReport } from "./types";
import { buildCategorizationPrompt, buildReportPrompt } from "./prompts";
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
    timeout: 180000, // 180초(3분) 타임아웃
    maxRetries: 1, // 재시도 최소화
  });
}

/**
 * 기록을 카테고리로 분류
 */
export async function categorizeRecords(
  records: Record[],
  date: string
): Promise<CategorizedRecords> {
  const prompt = buildCategorizationPrompt(records, date);
  const openai = getOpenAIClient();

  // 캐시 키 생성
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_CATEGORIZATION, prompt);

  // 캐시에서 조회
  const cachedResult = getFromCache<CategorizedRecords>(cacheKey);
  if (cachedResult) {
    console.log("캐시에서 결과 반환 (categorizeRecords)");
    return cachedResult;
  }

  try {
    // OpenAI CachedInput: prompt_cache_key를 사용하여 OpenAI가 자동으로 캐시 확인 및 사용
    const promptCacheKey = generatePromptCacheKey(SYSTEM_PROMPT_CATEGORIZATION);

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_CATEGORIZATION,
          // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
        },
        { role: "user", content: prompt }, // 사용자 입력(records, date)은 매번 다르므로 캐싱 불가
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: RecordCategorizationSchema.name,
          schema: RecordCategorizationSchema.schema,
          strict: RecordCategorizationSchema.strict,
        },
      },
      // OpenAI가 자동으로 캐시를 확인하고 사용하도록 prompt_cache_key 설정
      // 동일한 시스템 프롬프트에 대해 캐시된 응답을 재사용하여 비용 절감
      prompt_cache_key: promptCacheKey,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from OpenAI categorization");
    }

    const result = JSON.parse(content) as CategorizedRecords;

    // 캐시에 저장
    setCache(cacheKey, result);

    return result;
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; status?: number };
    if (
      err?.message?.includes("model") ||
      err?.code === "model_not_found" ||
      err?.status === 404
    ) {
      // Fallback 시에도 동일한 캐시 키 사용
      const promptCacheKey = generatePromptCacheKey(
        SYSTEM_PROMPT_CATEGORIZATION
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT_CATEGORIZATION,
            // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
          },
          { role: "user", content: prompt }, // 사용자 입력은 매번 다르므로 캐싱 불가
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: RecordCategorizationSchema.name,
            schema: RecordCategorizationSchema.schema,
            strict: RecordCategorizationSchema.strict,
          },
        },
        prompt_cache_key: promptCacheKey,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI categorization");
      }

      const result = JSON.parse(content) as CategorizedRecords;

      // 캐시에 저장
      setCache(cacheKey, result);

      return result;
    }
    throw error;
  }
}

/**
 * 카테고리화된 기록을 기반으로 일일 리포트 생성
 */
export async function generateDailyReport(
  categorized: CategorizedRecords,
  date: string,
  records: Record[] = []
): Promise<DailyReport> {
  const prompt = buildReportPrompt(categorized, date, records);
  const openai = getOpenAIClient();

  // 캐시 키 생성
  const cacheKey = generateCacheKey(SYSTEM_PROMPT, prompt);

  // 캐시에서 조회
  const cachedResult = getFromCache<DailyReport>(cacheKey);
  if (cachedResult) {
    console.log("캐시에서 결과 반환 (generateDailyReport)");
    return cachedResult;
  }

  try {
    // OpenAI CachedInput: prompt_cache_key를 사용하여 OpenAI가 자동으로 캐시 확인 및 사용
    const promptCacheKey = generatePromptCacheKey(SYSTEM_PROMPT);

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
          // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
        },
        { role: "user", content: prompt }, // 사용자 입력(records, date 등)은 매번 다르므로 캐싱 불가
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: DailyReportSchema.name,
          schema: DailyReportSchema.schema,
          strict: DailyReportSchema.strict,
        },
      },
      // OpenAI가 자동으로 캐시를 확인하고 사용하도록 prompt_cache_key 설정
      prompt_cache_key: promptCacheKey,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content from OpenAI report generation");
    }

    const result = JSON.parse(content) as DailyReport;

    // 캐시에 저장
    setCache(cacheKey, result);

    return result;
  } catch (error: unknown) {
    // gpt-5가 사용 불가능한 경우 gpt-4o-mini로 fallback
    const err = error as { message?: string; code?: string; status?: number };
    if (
      err?.message?.includes("model") ||
      err?.code === "model_not_found" ||
      err?.status === 404
    ) {
      // Fallback 시에도 동일한 캐시 키 사용
      const promptCacheKey = generatePromptCacheKey(SYSTEM_PROMPT);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
            // OpenAI CachedInput: 시스템 프롬프트는 고정이므로 캐싱 가능
          },
          { role: "user", content: prompt }, // 사용자 입력은 매번 다르므로 캐싱 불가
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: DailyReportSchema.name,
            schema: DailyReportSchema.schema,
            strict: DailyReportSchema.strict,
          },
        },
        prompt_cache_key: promptCacheKey,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content from OpenAI report generation");
      }

      const result = JSON.parse(content) as DailyReport;

      // 캐시에 저장
      setCache(cacheKey, result);

      return result;
    }
    throw error;
  }
}
