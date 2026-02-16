import { GoogleGenerativeAI, type GenerateContentRequest } from "@google/generative-ai";
import {
  getWeeklyVividSchema,
  SYSTEM_PROMPT_VIVID,
} from "./schema";
import type { RecordsForWeekly } from "./types";
import {
  buildWeeklyVividPromptFromRecords,
} from "./prompts";
import type { WeeklyVivid, WeeklyReport } from "@/types/weekly-vivid";
import {
  generateCacheKey,
  getFromCache,
  setCache,
} from "../utils/cache";
import { withGeminiRetry } from "../utils/gemini-retry";
import type {
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
  schema: ReportSchema,
  cacheKey: string,
  isPro: boolean,
  sectionName: string,
  userId?: string
): Promise<T> {
  // 캐시에서 조회 (멤버십별로 캐시 키 구분)
  const proCacheKey = isPro ? `${cacheKey}_pro` : cacheKey;
  const cachedResult = getFromCache<T>(proCacheKey);
  if (cachedResult) {
    console.log(`캐시에서 결과 반환 (${schema.name}, Pro: ${isPro})`);
    // 캐시된 경우에도 진행 상황 알림 (이미 완료된 것으로 간주)
    return cachedResult;
  }

  const geminiClient = getGeminiClient();

  const modelName = "gemini-3-pro-preview";

  // 전역 프롬프터와 시스템 프롬프트 결합
  const { enhanceSystemPromptWithGlobal } = await import(
    "../shared/global-prompt"
  );
  const enhancedSystemPrompt = enhanceSystemPromptWithGlobal(
    systemPrompt,
    isPro
  );

  const startTime = Date.now();

  // 요청 정보 로깅
  const systemPromptSize = enhancedSystemPrompt.length;
  const userPromptSize = userPrompt.length;
  const totalPromptSize = systemPromptSize + userPromptSize;

  try {
    // Gemini 모델 초기화 (systemInstruction 포함)
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
    const cleanedSchema = cleanSchemaRecursive(schema.schema) as {
      type: string;
      properties?: Record<string, unknown>;
      required?: string[];
    };

    // 스키마 검증: properties가 비어있으면 에러
    if (!cleanedSchema.properties || Object.keys(cleanedSchema.properties).length === 0) {
      console.error(`[${sectionName}] Schema properties is empty after cleaning:`, {
        originalSchema: schema.schema,
        cleanedSchema,
      });
      throw new Error(`Schema properties is empty for ${schema.name}. This may indicate that cleanSchemaRecursive removed all properties.`);
    }

    // JSON 스키마 설정
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
          `Required properties [${missingProperties.join(", ")}] not found in schema properties for ${schema.name}`
        );
      }
      responseSchema.required = cleanedSchema.required as string[];
    }

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

    // 디버깅: 스키마 구조 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === "development") {
      console.log(`[${sectionName}] Original schema:`, JSON.stringify(schema.schema, null, 2));
      console.log(`[${sectionName}] Cleaned schema properties count:`, Object.keys(cleanedSchema.properties || {}).length);
      console.log(`[${sectionName}] Final responseSchema:`, JSON.stringify(generationConfig.responseSchema, null, 2));
    }
    // 사용자 메시지 구성
    const contents = [
      {
        role: "user" as const,
        parts: [{ text: userPrompt }],
      },
    ];

    const request = {
      contents,
      generationConfig,
    } as unknown as GenerateContentRequest;

    const geminiResult = await withGeminiRetry(() =>
      model.generateContent(request)
    );

    const endTime = Date.now();
    const duration_ms = endTime - startTime;

    console.log(`[${sectionName}] API 요청 성공:`, {
      duration_ms,
      duration_seconds: (duration_ms / 1000).toFixed(2),
      usage: geminiResult.response.usageMetadata,
      timestamp: new Date().toISOString(),
    });

    const content = geminiResult.response.text();
    if (!content) {
      throw new Error(`No content from Gemini (${schema.name})`);
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
          requestType: "weekly_vivid",
          sectionName,
          usage,
          duration_ms,
          success: true,
        });
      }
    }

    // 추적 정보를 결과에 첨부 (테스트 환경에서만)
    if (
      process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_NODE_ENV === "development"
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
    const endTime = Date.now();
    const duration_ms = endTime - startTime;

    // 상세 에러 정보 로깅
    const errorDetails: Record<string, unknown> = {
      sectionName,
      duration_ms,
      duration_seconds: (duration_ms / 1000).toFixed(2),
      errorType: err?.constructor?.name || typeof error,
      status: err?.status,
      code: err?.code,
      type: err?.type,
      message: err?.message || String(error),
      timestamp: new Date().toISOString(),
      model: modelName,
      systemPromptSize,
      userPromptSize,
      totalPromptSize,
      estimatedTokens: Math.ceil(totalPromptSize / 4),
    };

    // Gemini API 에러의 경우 추가 정보 수집
    if (err && typeof err === 'object') {
      if ('headers' in err && err.headers) {
        errorDetails.headers = err.headers;
      }
      if ('response' in err && err.response) {
        errorDetails.response = err.response;
      }
      if ('cause' in err && err.cause) {
        errorDetails.cause = err.cause;
      }
    }

    // 502 에러인 경우 특별히 상세 로깅
    if (err?.status === 502) {
      console.error(`[${sectionName}] 502 Bad Gateway 에러 발생 - 상세 정보:`, errorDetails);
      console.error(`[${sectionName}] 502 에러 분석:`, {
        가능한_원인: [
          "Cloudflare 타임아웃 (일반적으로 100초)",
          "Next.js API Route 타임아웃 (180초 설정)",
          "Gemini API 응답 지연",
          "네트워크 연결 문제",
        ],
        현재_설정: {
          nextjsMaxDuration: "180초 (3분)",
          cloudflareTimeout: "일반적으로 100초",
        },
        요청_정보: {
          duration_ms,
          estimatedTokens: Math.ceil(totalPromptSize / 4),
          promptSize: totalPromptSize,
        },
      });
    } else {
      console.error(`[${sectionName}] API 요청 실패:`, errorDetails);
    }

    // 429 에러 (쿼터 초과) 처리
    if (
      err?.status === 429 ||
      err?.code === "insufficient_quota" ||
      err?.type === "insufficient_quota" ||
      err?.message?.includes("쿼터") ||
      err?.message?.includes("quota") ||
      err?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      const quotaError = new Error(
        `Gemini API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요. (${schema.name})`
      ) as ApiError;
      quotaError.code = "INSUFFICIENT_QUOTA";
      quotaError.status = 429;
      throw quotaError;
    }

    // AI 사용량 로깅 (에러 발생 시에도 로깅)
    if (userId) {
      logAIRequestAsync({
        userId,
        model: modelName,
        requestType: "weekly_vivid",
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
 * Weekly Vivid 전체 데이터 생성 (Records 기반, 통합 호출)
 */
async function generateWeeklyVividDataFromRecords(
  records: RecordsForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string,
  userName?: string,
  personaContext?: string
): Promise<Partial<WeeklyVivid>> {
  const prompt = buildWeeklyVividPromptFromRecords(
    records,
    range,
    userName,
    personaContext
  );
  const schema = getWeeklyVividSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, prompt);

  const response = await generateSection<{ weekly_vivid: Partial<WeeklyVivid> }>(
    SYSTEM_PROMPT_VIVID,
    prompt,
    schema,
    cacheKey,
    isPro,
    "weekly_vivid_full",
    userId
  );

  if (!response) {
    console.error("[generateWeeklyVividData] response is null or undefined");
    throw new Error("Weekly vivid response is null or undefined");
  }

  // response가 직접 { weekly_vivid: ... } 구조인지 확인
  if (response.weekly_vivid) {
    return response.weekly_vivid;
  }

  // 혹시라도 구조가 다르게 왔을 경우 처리 (예: 직접 객체 반환)
  if (
    typeof response === "object" &&
    "report" in response &&
    "title" in response
  ) {
    return response as unknown as Partial<WeeklyVivid>;
  }

  console.error("[generateWeeklyVividData] Invalid response structure:", response);
  throw new Error("Invalid response structure for Weekly Vivid");
}




/**
 * Records 배열을 기반으로 주간 비비드 생성 (report와 title만, trend는 user-trends cron에서 생성)
 * vivid-records의 실제 기록을 기반으로 주간 피드백 생성
 */
export async function generateWeeklyVividFromRecordsWithProgress(
  records: RecordsForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean = false,
  userId?: string,
  userName?: string,
  personaContext?: string
): Promise<WeeklyVivid> {
  // report, title만 생성 (trend는 user-trends cron에서 별도 생성)
  const weeklyVividData = await generateWeeklyVividDataFromRecords(
    records,
    range,
    isPro,
    userId,
    userName,
    personaContext
  );

  // 데이터 검증 및 기본값 처리
  if (!weeklyVividData.report) {
    throw new Error("Failed to generate weekly report");
  }

  // 최종 Weekly Vivid 조합 (trend는 user-trends cron에서만 생성)
  const weeklyVivid: WeeklyVivid = {
    week_range: range,
    report: weeklyVividData.report as WeeklyReport,
    title: weeklyVividData.title || `${range.start} ~ ${range.end} 주간`,
    trend: null, // user-trends cron에서만 생성
    is_ai_generated: true,
  };

  return weeklyVivid;
}
