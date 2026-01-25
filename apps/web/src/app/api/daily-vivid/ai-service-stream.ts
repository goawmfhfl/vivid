import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  DailyVividReportSchema,
  SYSTEM_PROMPT_REPORT,
  SYSTEM_PROMPT_TREND,
  TrendDataSchema,
} from "./schema";
import type { Record as FeedbackRecord } from "./types";
import { buildReportPrompt } from "./prompts";
import type { Report, TrendData } from "@/types/daily-vivid";
import {
  generateCacheKey,
  getFromCache,
  setCache,
} from "../utils/cache";
import type {
  Schema,
  ReportSchema,
  ExtendedUsage,
  WithTracking,
  ApiError,
} from "../types";
import { extractUsageInfo, logAIRequestAsync } from "@/lib/ai-usage-logger";

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing credentials. Please pass an `apiKey`, or set the `GEMINI_API_KEY` environment variable."
    );
  }
  return new GoogleGenerativeAI(apiKey);
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

  const geminiClient = getGeminiClient();

  // Gemini 3 Flash Preview 사용 (2025년 12월 17일 출시, 2026년 1월 기준 사용 가능)
  const modelName = "gemini-3-flash-preview";

  // 전역 프롬프터와 시스템 프롬프트 결합
  const { enhanceSystemPromptWithGlobal } = await import(
    "../shared/global-prompt"
  );
  const enhancedSystemPrompt = enhanceSystemPromptWithGlobal(
    systemPrompt,
    isPro
  );

  // Free 유저의 경우 토큰 사용량 제한 (비용 절감)
  // Pro 유저는 제한 없음
  // JSON 스키마 응답을 완성하기 위해 최소한의 토큰은 필요하므로 2000으로 설정
  const maxOutputTokens = isPro ? undefined : 2000;

  const startTime = Date.now();
  try {
    // Gemini 모델 초기화 (systemInstruction 포함)
    // systemInstruction은 string, Part, 또는 Content 타입을 받을 수 있음
    // 단순 문자열로 전달하는 것이 가장 안전함
    const model = geminiClient.getGenerativeModel({
      model: modelName,
      systemInstruction: enhancedSystemPrompt,
    });

    // JSON 스키마 설정
    // Gemini API는 additionalProperties를 직접 지원하지 않으므로 제거
    const responseSchema: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    } = {
      type: "object",
      properties: schemaObj.schema.properties as Record<string, unknown>,
    };

    // required 필드가 있고 비어있지 않을 때만 추가
    const requiredFields = schemaObj.schema.required;
    if (Array.isArray(requiredFields) && requiredFields.length > 0) {
      responseSchema.required = requiredFields as string[];
    }

    // 사용자 메시지 구성
    // Gemini API의 Content 타입에는 role이 필요함
    const contents = [
      {
        role: "user" as const,
        parts: [{ text: userPrompt }],
      },
    ];

    // generationConfig를 별도로 구성하여 타입 오류 방지
    const generationConfig: {
      responseMimeType: "application/json";
      responseSchema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
      };
      maxOutputTokens?: number;
    } = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: responseSchema.properties,
        ...(responseSchema.required && { required: responseSchema.required }),
      },
    };

    if (maxOutputTokens !== undefined) {
      generationConfig.maxOutputTokens = maxOutputTokens;
    }

    const geminiResult = await model.generateContent({
      contents,
      generationConfig: generationConfig as any, // 타입 호환성을 위해 any 사용
    });

    const endTime = Date.now();
    const duration_ms = endTime - startTime;

    const content = geminiResult.response.text();
    if (!content) {
      throw new Error(`No content from Gemini (${schemaObj.name})`);
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
      const usageMetadata = geminiResult.response.usageMetadata;
      const usage = usageMetadata
        ? {
            prompt_tokens: usageMetadata.promptTokenCount || 0,
            completion_tokens: usageMetadata.candidatesTokenCount || 0,
            total_tokens: usageMetadata.totalTokenCount || 0,
            cached_tokens: 0, // Gemini는 캐시 토큰 정보를 제공하지 않음
          }
        : null;
      if (usage) {
        logAIRequestAsync({
          userId,
          model: modelName,
          requestType: "daily_vivid",
          sectionName,
          usage,
          duration_ms,
          success: true,
        });
      }
    }

    // 개발 환경에서 추적 정보 추가 (객체인 경우에만)
    if (
      (process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_NODE_ENV === "development") &&
      result !== null &&
      result !== undefined &&
      typeof result === "object" &&
      !Array.isArray(result)
    ) {
      const usageMetadata = geminiResult.response.usageMetadata;
      (result as WithTracking<T>).__tracking = {
        name: sectionName,
        model: modelName,
        duration_ms,
        usage: {
          prompt_tokens: usageMetadata?.promptTokenCount || 0,
          completion_tokens: usageMetadata?.candidatesTokenCount || 0,
          total_tokens: usageMetadata?.totalTokenCount || 0,
          cached_tokens: 0, // Gemini는 캐시 토큰 정보를 제공하지 않음
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
      err?.message?.includes("quota") ||
      err?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      const quotaError = new Error(
        `Gemini API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요. (${schemaObj.name})`
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
        model: modelName,
        requestType: "daily_vivid",
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
 * VIVID 기록 리포트 생성
 */
async function generateReport(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string
): Promise<Report | null> {
  const dreamRecords = records.filter((r) => r.type === "vivid" || r.type === "dream");

  if (dreamRecords.length === 0) {
    console.log("[generateReport] dreamRecords가 없어서 null 반환");
    return null;
  }

  const prompt = buildReportPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_REPORT, prompt);

  try {
    const result = await generateSection<Report>(
      SYSTEM_PROMPT_REPORT,
      prompt,
      DailyVividReportSchema,
      cacheKey,
      isPro,
      "report",
      userId
    );
    console.log(`[generateReport] 생성 완료 (Pro: ${isPro})`);
    return result;
  } catch (error) {
    console.error("[generateReport] 생성 실패:", error);
    // 에러가 발생해도 null을 반환하여 다른 리포트 생성에 영향을 주지 않도록 함
    return null;
  }
}

/**
 * Trend 데이터 생성 (최근 동향 섹션용)
 */
async function generateTrendData(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string
): Promise<TrendData | null> {
  const dreamRecords = records.filter((r) => r.type === "vivid" || r.type === "dream");

  if (dreamRecords.length === 0) {
    return null;
  }

  // VIVID 기록을 기반으로 trend 데이터 생성
  const prompt = buildReportPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_TREND, prompt);

  try {
    const result = await generateSection<TrendData>(
      SYSTEM_PROMPT_TREND,
      prompt,
      TrendDataSchema,
      cacheKey,
      isPro,
      "trend",
      userId
    );

    // 빈 문자열 검증 및 필터링
    if (!result) {
      console.warn("[generateTrendData] 결과가 null입니다.");
      return null;
    }

    // 모든 필드가 빈 문자열이 아닌지 확인
    const hasEmptyString = 
      !result.aspired_self?.trim() ||
      !result.interest?.trim() ||
      !result.immersion_moment?.trim() ||
      !result.personality_trait?.trim();

    if (hasEmptyString) {
      console.warn("[generateTrendData] 빈 문자열이 포함된 응답을 받았습니다:", {
        aspired_self: result.aspired_self,
        interest: result.interest,
        immersion_moment: result.immersion_moment,
        personality_trait: result.personality_trait,
      });
      
      // 빈 문자열 필드를 기본값으로 대체
      const sanitizedResult: TrendData = {
        aspired_self: result.aspired_self?.trim() || "자기 성찰과 성장을 추구하는",
        interest: result.interest?.trim() || "일상의 의미 있는 경험",
        immersion_moment: result.immersion_moment?.trim() || "집중할 수 있는 순간",
        personality_trait: result.personality_trait?.trim() || "성찰적인",
      };

      console.log("[generateTrendData] 빈 문자열을 기본값으로 대체했습니다.");
      return sanitizedResult;
    }

    return result;
  } catch (error) {
    console.error("[generateTrendData] trend 데이터 생성 실패:", error);
    return null;
  }
}


/**
 * 모든 타입별 리포트 생성
 */
export async function generateAllReportsWithProgress(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string
): Promise<{
  report: Report | null;
  trend: TrendData | null;
}> {
  // Free 유저는 trend를 생성하지 않음 (비용 절감)
  // Pro 유저만 trend 생성
  if (!isPro) {
    // Free 유저: report만 생성
    const report = await generateReport(
      records,
      date,
      dayOfWeek,
      isPro,
      userId
    );

    return {
      report,
      trend: null,
    };
  }

  // Pro 유저: report, trend 생성
  const [report, trendData] = await Promise.all([
    generateReport(records, date, dayOfWeek, isPro, userId),
    generateTrendData(records, date, dayOfWeek, isPro, userId),
  ]);

  return {
    report,
    trend: trendData,
  };
}
