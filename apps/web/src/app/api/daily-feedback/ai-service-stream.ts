import OpenAI from "openai";
import {
  EmotionReportSchema,
  SYSTEM_PROMPT_EMOTION,
  SYSTEM_PROMPT_VIVID,
  VividReportSchema,
} from "./schema";
import type { Record } from "./types";
import { buildEmotionPrompt, buildVividPrompt } from "./prompts";
import type {
  EmotionReport,
  VividReport,
} from "@/types/daily-feedback";
import {
  generateCacheKey,
  getFromCache,
  setCache,
  generatePromptCacheKey,
} from "../utils/cache";
import type {
  Schema,
  ReportSchema,
  ExtendedUsage,
  WithTracking,
  ApiError,
} from "../types";
import { extractUsageInfo, logAIRequestAsync } from "@/lib/ai-usage-logger";

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
    maxRetries: 0, // 재시도 최소화
  });
}

/**
 * Section 생성 헬퍼 함수
 */
async function generateSection<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: Schema,
  cacheKey: string,
  isPro: boolean,
  sectionName: string,
  userId?: string
): Promise<T> {
  const schemaObj: ReportSchema =
    typeof schema === "function" ? schema(isPro) : schema;

  // 캐시에서 조회 (멤버십별로 캐시 키 구분)
  const proCacheKey = isPro ? `${cacheKey}_pro` : cacheKey;
  const cachedResult = getFromCache<T>(proCacheKey);
  if (cachedResult) {
    console.log(`캐시에서 결과 반환 (${schemaObj.name}, Pro: ${isPro})`);
    return cachedResult;
  }

  const openai = getOpenAIClient();
  const promptCacheKey = generatePromptCacheKey(systemPrompt);

  const model = "gpt-5-mini";

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
          name: schemaObj.name,
          schema: schemaObj.schema,
          strict: schemaObj.strict,
        },
      },
      prompt_cache_key: promptCacheKey,
    });

    const endTime = Date.now();
    const duration_ms = endTime - startTime;

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`No content from OpenAI (${schemaObj.name})`);
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
          `[${schemaObj.name}] First value is string, checking parsed structure:`,
          {
            parsed,
            parsedKeys: Object.keys(parsed),
            firstValue,
          }
        );

        // parsed가 직접 원하는 구조인지 확인 (예: { summary_report: {...} })
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

    // 결과가 객체가 아닌 경우 에러
    if (
      result === null ||
      result === undefined ||
      typeof result !== "object" ||
      Array.isArray(result)
    ) {
      console.error(`Invalid result type for ${schemaObj.name}:`, {
        resultType: typeof result,
        result,
        parsed,
        parsedKeys: Object.keys(parsed || {}),
        parsedValues: Object.values(parsed || {}),
      });
      throw new Error(
        `Invalid response format for ${
          schemaObj.name
        }: expected object but got ${typeof result}. This may indicate a schema mismatch.`
      );
    }

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
          requestType: "daily_feedback",
          sectionName,
          usage,
          duration_ms,
          success: true,
        });
      }
    }

    // 개발 환경에서 추적 정보 추가 (객체인 경우에만)
    if (
      (process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_NODE_ENV === "development") &&
      result !== null &&
      result !== undefined &&
      typeof result === "object" &&
      !Array.isArray(result)
    ) {
      const usage = completion.usage as ExtendedUsage | undefined;
      const cachedTokens = usage?.prompt_tokens_details?.cached_tokens || 0;
      (result as WithTracking<T>).__tracking = {
        name: sectionName,
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

    if (
      err?.status === 429 ||
      err?.code === "insufficient_quota" ||
      err?.type === "insufficient_quota" ||
      err?.message?.includes("쿼터") ||
      err?.message?.includes("quota")
    ) {
      const quotaError = new Error(
        `OpenAI API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요. (${schemaObj.name})`
      ) as ApiError;
      quotaError.code = "INSUFFICIENT_QUOTA";
      quotaError.status = 429;
      throw quotaError;
    }

    // AI 사용량 로깅 (에러 발생 시에도 로깅)
    if (userId) {
      const endTime = Date.now();
      const duration_ms = endTime - startTime;
      logAIRequestAsync({
        userId,
        model,
        requestType: "daily_feedback",
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

    throw error;
  }
}

/**
 * 감정 기록 리포트 생성
 */
async function generateEmotionReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string
): Promise<EmotionReport | null> {
  const emotionRecords = records.filter((r) => r.type === "emotion");

  if (emotionRecords.length === 0) {
    return null;
  }

  const prompt = buildEmotionPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EMOTION, prompt);

  return generateSection<EmotionReport>(
    SYSTEM_PROMPT_EMOTION,
    prompt,
    EmotionReportSchema,
    cacheKey,
    isPro,
    "emotion_report",
    userId
  );
}

/**
 * VIVID 기록 리포트 생성
 */
async function generateVividReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string
): Promise<VividReport | null> {
  const dreamRecords = records.filter((r) => r.type === "vivid" || r.type === "dream");

  if (dreamRecords.length === 0) {
    return null;
  }

  const prompt = buildVividPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, prompt);

  return generateSection<VividReport>(
    SYSTEM_PROMPT_VIVID,
    prompt,
    VividReportSchema,
    cacheKey,
    isPro,
    "vivid_report",
    userId
  );
}


/**
 * 모든 타입별 리포트 생성
 */
export async function generateAllReportsWithProgress(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string
): Promise<{
  emotion_report: EmotionReport | null;
  vivid_report: VividReport | null;
}> {
  // recordType 확인: 기본값은 vivid 모드 (vivid/dream, emotion만)
  // 다른 record type(daily, insight, feedback)이 있으면 일반 모드로 전환
  const recordTypes = new Set(records.map((r) => r.type));
  const hasOtherTypes = Array.from(recordTypes).some(
    (type) => type !== "vivid" && type !== "dream" && type !== "emotion"
  );

  // vivid 모드가 기본값: vivid_report와 emotion_report만 생성
  if (!hasOtherTypes) {
    // vivid_report와 emotion_report만 생성
    const vividReport = await generateVividReport(
      records,
      date,
      dayOfWeek,
      isPro,
      userId
    );
    const emotionReport = await generateEmotionReport(
      records,
      date,
      dayOfWeek,
      isPro,
      userId
    );

    return {
      emotion_report: emotionReport,
      vivid_report: vividReport,
    };
  }

  // 일반 모드: 다른 record type이 있어도 현재는 vivid 모드와 동일하게 처리
  // (향후 확장 가능성을 위해 구조는 유지)
  const emotionReport = await generateEmotionReport(
    records,
    date,
    dayOfWeek,
    isPro,
    userId
  );
  const vividReport = await generateVividReport(
    records,
    date,
    dayOfWeek,
    isPro,
    userId
  );

  return {
    emotion_report: emotionReport,
    vivid_report: vividReport,
  };
}
