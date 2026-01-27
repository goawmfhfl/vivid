import { GoogleGenerativeAI, type GenerateContentRequest } from "@google/generative-ai";
import {
  DailyVividReportSchema,
  SYSTEM_PROMPT_REPORT,
  SYSTEM_PROMPT_TREND,
  TrendDataSchema,
  IntegratedDailyVividSchema,
  SYSTEM_PROMPT_INTEGRATED,
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
  WithTracking,
  ApiError,
} from "../types";
import { logAIRequestAsync } from "@/lib/ai-usage-logger";

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

    // JSON 스키마를 Gemini API 형식으로 정리
    // Gemini API는 additionalProperties, minItems, maxItems, pattern, description, maxLength 등을 지원하지 않음
    // 재귀적으로 스키마를 정리하되, properties와 required는 반드시 보존
    function cleanSchemaRecursive(schemaObj: unknown): unknown {
      if (typeof schemaObj !== "object" || schemaObj === null) {
        return schemaObj;
      }

      if (Array.isArray(schemaObj)) {
        return schemaObj.map(cleanSchemaRecursive);
      }

      const obj = schemaObj as Record<string, unknown>;
      const cleaned: Record<string, unknown> = {};

      // Gemini API가 지원하는 필드만 유지
      const allowedFields = new Set([
        "type",
        "properties",
        "required",
        "items",
        "enum",
      ]);

      for (const [key, value] of Object.entries(obj)) {
        // 지원하지 않는 필드 제거
        if (!allowedFields.has(key)) {
          continue;
        }

        // properties는 특별 처리: 각 속성을 재귀적으로 정리하되, properties 객체 자체는 반드시 보존
        if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
          const propertiesObj = value as Record<string, unknown>;
          const cleanedProperties: Record<string, unknown> = {};
          for (const [propKey, propValue] of Object.entries(propertiesObj)) {
            const cleanedProp = cleanSchemaRecursive(propValue);
            if (cleanedProp !== null && cleanedProp !== undefined) {
              cleanedProperties[propKey] = cleanedProp;
            }
          }
          // properties가 비어있지 않은 경우에만 추가
          if (Object.keys(cleanedProperties).length > 0) {
            cleaned[key] = cleanedProperties;
          }
        }
        // items는 배열의 요소 스키마를 재귀적으로 정리
        else if (key === "items" && value && typeof value === "object" && !Array.isArray(value)) {
          cleaned[key] = cleanSchemaRecursive(value);
        }
        // required는 배열이므로 그대로 유지 (문자열 배열)
        else if (key === "required" && Array.isArray(value)) {
          cleaned[key] = value;
        }
        // type, enum은 그대로 유지
        else if (key === "type" || key === "enum") {
          cleaned[key] = value;
        }
        // 그 외의 객체는 재귀적으로 처리
        else if (value && typeof value === "object") {
          cleaned[key] = cleanSchemaRecursive(value);
        } else {
          cleaned[key] = value;
        }
      }

      return cleaned;
    }

    // 스키마를 Gemini API 형식으로 정리
    const cleanedSchema = cleanSchemaRecursive(schemaObj.schema) as {
      type: string;
      properties?: Record<string, unknown>;
      required?: string[];
    };

    // 스키마 검증: properties가 비어있으면 에러
    if (!cleanedSchema.properties || Object.keys(cleanedSchema.properties).length === 0) {
      console.error(`[${sectionName}] Schema properties is empty after cleaning:`, {
        originalSchema: schemaObj.schema,
        cleanedSchema,
      });
      throw new Error(`Schema properties is empty for ${schemaObj.name}. This may indicate that cleanSchemaRecursive removed all properties.`);
    }

    // JSON 스키마 설정
    // Gemini API는 additionalProperties를 직접 지원하지 않으므로 제거
    const responseSchema: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    } = {
      type: "object",
      properties: cleanedSchema.properties as Record<string, unknown>,
    };

    // required 필드가 있고 비어있지 않을 때만 추가
    // required에 있는 모든 필드가 properties에 존재하는지 확인
    if (cleanedSchema.required && Array.isArray(cleanedSchema.required) && cleanedSchema.required.length > 0) {
      const missingProperties = cleanedSchema.required.filter(
        (req) => !(req in cleanedSchema.properties!)
      );
      if (missingProperties.length > 0) {
        console.error(`[${sectionName}] Required properties not found in schema:`, {
          missingProperties,
          availableProperties: Object.keys(cleanedSchema.properties),
          required: cleanedSchema.required,
        });
        throw new Error(
          `Required properties [${missingProperties.join(", ")}] not found in schema properties for ${schemaObj.name}`
        );
      }
      responseSchema.required = cleanedSchema.required as string[];
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

    const request = {
      contents,
      generationConfig,
    } as unknown as GenerateContentRequest;

    const geminiResult = await model.generateContent(request);

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
      // 통합 리포트의 경우 (키워드 확인), parsed 자체를 사용
      if (
        (sectionName === "integrated_report" || sectionName === "weekly_vivid_full") &&
        ("report" in parsed || "weekly_vivid" in parsed)
      ) {
        result = parsed as T;
      } else {
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

    // 결과 데이터 정리 (Trend 데이터의 경우 빈 문자열 확인 및 기본값 처리)
    if (sectionName === "integrated_report" && result && typeof result === "object") {
      type TrendPayload = {
        trend?: {
          aspired_self?: string;
          interest?: string;
          immersion_moment?: string;
          personality_trait?: string;
        };
      };
      const resultWithTrend = result as TrendPayload;
      let trend = resultWithTrend.trend;
      if (trend) {
        const hasEmptyString =
          !trend.aspired_self?.trim() ||
          !trend.interest?.trim() ||
          !trend.immersion_moment?.trim() ||
          !trend.personality_trait?.trim();
  
        if (hasEmptyString) {
          console.warn(
            "[generateIntegratedReport] Trend 데이터에 빈 문자열이 포함되어 있습니다:",
            {
              aspired_self: trend.aspired_self,
              interest: trend.interest,
              immersion_moment: trend.immersion_moment,
              personality_trait: trend.personality_trait,
            }
          );
  
          trend = {
            aspired_self: trend.aspired_self?.trim() || "자기 성찰과 성장을 추구하는",
            interest: trend.interest?.trim() || "일상의 의미 있는 경험",
            immersion_moment:
              trend.immersion_moment?.trim() || "집중할 수 있는 순간",
            personality_trait: trend.personality_trait?.trim() || "성찰적인",
          };
          console.log(
            "[generateIntegratedReport] 빈 문자열을 기본값으로 대체했습니다."
          );
          resultWithTrend.trend = trend;
        }
      }
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
 * 통합 리포트 생성 (Report + Trend) - Pro 유저용
 */
async function generateIntegratedReport(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean,
  userId?: string
): Promise<{ report: Report | null; trend: TrendData | null }> {
  const dreamRecords = records.filter(
    (r) => r.type === "vivid" || r.type === "dream"
  );

  if (dreamRecords.length === 0) {
    return { report: null, trend: null };
  }

  const prompt = buildReportPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_INTEGRATED, prompt);

  try {
    const result = await generateSection<{ report: Report; trend: TrendData }>(
      SYSTEM_PROMPT_INTEGRATED,
      prompt,
      IntegratedDailyVividSchema,
      cacheKey,
      isPro,
      "integrated_report",
      userId
    );
    
    // generateSection 내부에서 이미 처리되지만, 명시적으로 한 번 더 확인
    return {
      report: result.report,
      trend: result.trend,
    };
  } catch (error) {
    console.error("[generateIntegratedReport] 통합 생성 실패:", error);
    return { report: null, trend: null };
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

  // Pro 유저: 통합 생성 함수 호출 (하나의 API 요청으로 Report와 Trend 동시 생성)
  if (isPro) {
    return await generateIntegratedReport(records, date, dayOfWeek, isPro, userId);
  }

  // Fallback (혹시 모를 상황 대비, 기존 병렬 처리 코드 - 도달할 일 없음)
  const [report, trendData] = await Promise.all([
    generateReport(records, date, dayOfWeek, isPro, userId),
    generateTrendData(records, date, dayOfWeek, isPro, userId),
  ]);

  return {
    report,
    trend: trendData,
  };
}
