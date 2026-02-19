import { jsonrepair } from "jsonrepair";
import { GoogleGenerativeAI, type GenerateContentRequest } from "@google/generative-ai";
import {
  DailyVividReportSchema,
  SYSTEM_PROMPT_REPORT,
  SYSTEM_PROMPT_TREND,
  TrendDataSchema,
  IntegratedDailyVividSchema,
  SYSTEM_PROMPT_INTEGRATED,
} from "./schema";
import { TodoListSchema, SYSTEM_PROMPT_TODO } from "./todo-schema";
import type { Record as FeedbackRecord } from "./types";
import { buildReportPrompt } from "./prompts";
import type {
  Report,
  TrendData,
  DailyVividInsight,
} from "@/types/daily-vivid";
import {
  generateCacheKey,
  getFromCache,
  setCache,
} from "../utils/cache";
import { withGeminiRetry } from "../utils/gemini-retry";
import { enhanceSystemPromptWithGlobal } from "../shared/global-prompt";
import type {
  Schema,
  ReportSchema,
  WithTracking,
  ApiError,
} from "../types";
import { logAIRequestAsync } from "@/lib/ai-usage-logger";

/**
 * AI 응답 JSON 파싱 (truncated/unterminated string 등 복구)
 */
function parseJsonRobust(content: string, schemaName: string): unknown {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // jsonrepair로 truncated/unterminated string 등 복구 후 재시도
    try {
      const repaired = jsonrepair(trimmed);
      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error(`[${schemaName}] JSON 파싱 실패 (복구 시도 후):`, {
        contentLength: trimmed.length,
        contentPreview: trimmed.slice(0, 200) + (trimmed.length > 200 ? "..." : ""),
        repairErr,
      });
      throw repairErr;
    }
  }
}

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
  userId?: string,
  generationMode: "fast" | "reasoned" = "fast"
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

  // 모델 선택: Free는 항상 Flash(비용 절감), Pro는 사고모드일 때 Pro 모델
  const modelName =
    isPro && generationMode === "reasoned"
      ? "gemini-3-pro-preview"
      : "gemini-3-flash-preview";

  // 전역 프롬프터와 시스템 프롬프트 결합
  const { enhanceSystemPromptWithGlobal } = await import(
    "../shared/global-prompt"
  );
  const enhancedSystemPrompt = enhanceSystemPromptWithGlobal(
    systemPrompt,
    isPro
  );

  // Free 유저: Flash 사용으로 비용 절감하되, 풀 리포트를 위해 4096 토큰 허용
  // Pro 유저: 제한 없음
  const maxOutputTokens = isPro ? undefined : 4096;

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
        // type, enum은 그대로 유지하되, type이 배열인 경우 null을 제거
        else if (key === "type") {
          if (Array.isArray(value)) {
            const normalizedTypes = value.filter(
              (typeValue) => typeof typeValue === "string" && typeValue !== "null"
            ) as string[];
            if (normalizedTypes.length > 0) {
              cleaned[key] = normalizedTypes[0];
            }
          } else {
            cleaned[key] = value;
          }
        } else if (key === "enum") {
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

    const geminiResult = await withGeminiRetry(() =>
      model.generateContent(request)
    );

    const endTime = Date.now();
    const duration_ms = endTime - startTime;

    const content = geminiResult.response.text();
    if (!content) {
      throw new Error(`No content from Gemini (${schemaObj.name})`);
    }

    const parsed = parseJsonRobust(content, schemaObj.name);
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
          const parsedRecord = parsed as Record<string, unknown>;
          const keys = Object.keys(parsedRecord);
          const objectValue = keys.find(
            (key) =>
              parsedRecord[key] !== null &&
              parsedRecord[key] !== undefined &&
              typeof parsedRecord[key] === "object" &&
              !Array.isArray(parsedRecord[key])
          );

          if (objectValue) {
            result = parsedRecord[objectValue] as T;
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
  userId?: string,
  generationMode: "fast" | "reasoned" = "fast",
  userName?: string,
  personaContext?: string,
  todoCheckInfo?: { checked: number; total: number },
  hasIdealSelfInPersona?: boolean
): Promise<Report | null> {
  const dreamRecords = records.filter((r) => r.type === "vivid" || r.type === "dream");

  if (dreamRecords.length === 0) {
    console.log("[generateReport] dreamRecords가 없어서 null 반환");
    return null;
  }

  const prompt = buildReportPrompt(
    records,
    date,
    dayOfWeek,
    isPro,
    userName,
    personaContext,
    todoCheckInfo,
    hasIdealSelfInPersona
  );
  const cacheKey = generateCacheKey(
    SYSTEM_PROMPT_REPORT,
    `${prompt}::${generationMode}`
  );

  try {
    const result = await generateSection<Report>(
      SYSTEM_PROMPT_REPORT,
      prompt,
      DailyVividReportSchema,
      cacheKey,
      isPro,
      "report",
      userId,
      generationMode
    );
    // alignment_based_on_persona 누락 시 기본값 적용 (스키마 불안정 대비)
    if (result && typeof result.alignment_based_on_persona !== "boolean") {
      result.alignment_based_on_persona = hasIdealSelfInPersona ?? false;
    }
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
async function _generateTrendData(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string,
  generationMode: "fast" | "reasoned" = "fast",
  userName?: string
): Promise<TrendData | null> {
  const dreamRecords = records.filter((r) => r.type === "vivid" || r.type === "dream");

  if (dreamRecords.length === 0) {
    return null;
  }

  // VIVID 기록을 기반으로 trend 데이터 생성
  const prompt = buildReportPrompt(records, date, dayOfWeek, isPro, userName);
  const cacheKey = generateCacheKey(
    SYSTEM_PROMPT_TREND,
    `${prompt}::${generationMode}`
  );

  try {
    const result = await generateSection<TrendData>(
      SYSTEM_PROMPT_TREND,
      prompt,
      TrendDataSchema,
      cacheKey,
      isPro,
      "trend",
      userId,
      generationMode
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
async function _generateIntegratedReport(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean,
  userId?: string,
  generationMode: "fast" | "reasoned" = "fast",
  userName?: string
): Promise<{ report: Report | null; trend: TrendData | null }> {
  const dreamRecords = records.filter(
    (r) => r.type === "vivid" || r.type === "dream"
  );

  if (dreamRecords.length === 0) {
    return { report: null, trend: null };
  }

  const prompt = buildReportPrompt(records, date, dayOfWeek, isPro, userName);
  const cacheKey = generateCacheKey(
    SYSTEM_PROMPT_INTEGRATED,
    `${prompt}::${generationMode}`
  );

  try {
    const result = await generateSection<{ report: Report; trend: TrendData }>(
      SYSTEM_PROMPT_INTEGRATED,
      prompt,
      IntegratedDailyVividSchema,
      cacheKey,
      isPro,
      "integrated_report",
      userId,
      generationMode
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
 * Q1("오늘 하루를 어떻게 보낼까?") 내용 추출
 */
function extractQ1ContentFromRecords(records: FeedbackRecord[]): string {
  const dreamRecords = records.filter(
    (r) => r.type === "vivid" || r.type === "dream"
  );
  const parts: string[] = [];
  for (const record of dreamRecords) {
    const content = record.content || "";
    const q1Match = content.match(
      /Q1\.\s*오늘 하루를 어떻게 보낼까\?\s*\n+([\s\S]*?)(?=Q2\.|$)/
    );
    if (q1Match) {
      const text = q1Match[1].trim();
      if (text) parts.push(text);
    }
  }
  return parts.join("\n\n");
}

export interface TodoListItemGenerated {
  contents: string;
  category: string;
}

/**
 * Q1 내용을 분석하여 투두 리스트 생성 (Pro 전용)
 */
export async function generateTodoListFromQ1(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean,
  userId?: string,
  generationMode: "fast" | "reasoned" = "fast"
): Promise<TodoListItemGenerated[] | null> {
  const q1Content = extractQ1ContentFromRecords(records);
  if (!q1Content || q1Content.length < 10) {
    console.log("[generateTodoListFromQ1] Q1 내용이 부족하여 스킵");
    return null;
  }

  const prompt = `아래는 ${date} (${dayOfWeek}) 사용자의 "오늘 하루를 어떻게 보낼까?" 답변입니다.\n\n${q1Content}\n\n위 내용을 바탕으로 오늘의 할 일 목록을 생성해주세요.`;

  const cacheKey = generateCacheKey(
    SYSTEM_PROMPT_TODO,
    `${prompt}::${generationMode}`
  );

  try {
    const result = await generateSection<{ items: TodoListItemGenerated[] }>(
      SYSTEM_PROMPT_TODO,
      prompt,
      TodoListSchema,
      cacheKey,
      isPro,
      "todo_list",
      userId,
      generationMode
    );
    if (!result?.items?.length) {
      console.log("[generateTodoListFromQ1] 생성된 항목 없음");
      return null;
    }
    return result.items;
  } catch (error) {
    console.error("[generateTodoListFromQ1] 생성 실패:", error);
    return null;
  }
}

/**
 * 모든 타입별 리포트 생성
 * trend는 user_persona cron에서 관리하므로 여기서는 생성하지 않음.
 */
export async function generateAllReportsWithProgress(
  records: FeedbackRecord[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  userId?: string,
  generationMode: "fast" | "reasoned" = "fast",
  userName?: string,
  personaContext?: string,
  todoCheckInfo?: { checked: number; total: number },
  hasIdealSelfInPersona?: boolean
): Promise<{
  report: Report | null;
  trend: TrendData | null;
}> {
  const report = await generateReport(
    records,
    date,
    dayOfWeek,
    isPro,
    userId,
    generationMode,
    userName,
    personaContext,
    todoCheckInfo,
    hasIdealSelfInPersona
  );
  return {
    report,
    trend: null,
  };
}

const INSIGHT_SYSTEM_PROMPT = `
당신은 사용자의 일상 계획과 지향하는 자아(persona)를 비교 분석하는 코치입니다.

## 인사이트 작성 원칙
1. **완전한 문장**: 모든 문장을 끝까지 완성합니다. "~적"처럼 형용사만으로 끝내지 않습니다.
2. **구체적 연결**: 오늘의 계획과 페르소나(지향하는 자아, 관심사, 패턴)를 구체적으로 연결해 설명합니다.
3. **실행 가능한 제안**: 막연한 조언이 아니라 "구체적으로 무엇을 할 수 있는지" 제시합니다.
4. **친근하고 따뜻한 톤**: 비난보다 이해와 응원을 담아 작성합니다.

## 출력 형식 (JSON)
반드시 다음 형식으로만 응답:
{
  "praise": ["잘 맞는 점 문장1", "문장2"],
  "feedback": ["피드백/관찰 문장1"],
  "improvements": ["개선 제안 문장1"],
  "summary": "한 줄 요약 (선택)"
}

- praise: 오늘 계획이 지향과 잘 맞는 점, 인정받을 만한 부분. 1~3개. 완전한 문장. "칭찬"이라는 단어는 사용하지 말고 관찰·인정 톤으로.
- feedback: 관찰/분석. 1~2개. 완전한 문장.
- improvements: 실행 가능한 구체적 제안. 1~2개. 완전한 문장.
- summary: (선택) 한 줄 요약. 없으면 빈 문자열 또는 생략 가능.
- 최소 1개 섹션은 비어있지 않아야 함.
- 각 배열의 모든 문장을 끝까지 완성하세요. 중간에 끊기지 않도록 주의.
`;

/** 인사이트 생성 시도 (모델 지정) */
async function tryGenerateInsightWithModel(
  geminiClient: ReturnType<typeof getGeminiClient>,
  modelName: string,
  systemPrompt: string,
  _prompt: string,
  request: GenerateContentRequest,
  report: Report
): Promise<DailyVividInsight> {
  const model = geminiClient.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  });

  const result = await withGeminiRetry(() => model.generateContent(request));

  let content: string;
  try {
    content = result.response.text();
  } catch (e) {
    throw new Error(`Gemini response.text() failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!content?.trim()) {
    throw new Error("No content from Gemini (daily_vivid_insight)");
  }

  const parsed = parseJsonRobust(content, "daily_vivid_insight") as {
    praise?: string[];
    feedback?: string[];
    improvements?: string[];
    summary?: string;
  };

  const praise = Array.isArray(parsed?.praise)
    ? parsed.praise.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];
  const feedback = Array.isArray(parsed?.feedback)
    ? parsed.feedback.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];
  const improvements = Array.isArray(parsed?.improvements)
    ? parsed.improvements.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];

  const resultInsight: DailyVividInsight = {
    praise,
    feedback,
    improvements,
  };
  if (typeof parsed?.summary === "string" && parsed.summary.trim()) {
    resultInsight.summary = parsed.summary.trim();
  }

  // 모든 섹션이 비어있으면 리포트 기반 폴백 summary 생성
  if (praise.length === 0 && feedback.length === 0 && improvements.length === 0) {
    const fallbackSummary =
      report.current_summary?.slice(0, 80) ||
      report.future_summary?.slice(0, 80) ||
      "오늘의 기록을 바탕으로 한 인사이트입니다.";
    resultInsight.summary = fallbackSummary + (fallbackSummary.length >= 80 ? "…" : "");
  }

  return resultInsight;
}

/** 리포트에서 폴백 인사이트 생성 (AI 실패 시) */
function buildFallbackInsight(report: Report): DailyVividInsight {
  const parts: string[] = [];
  if (report.current_summary?.trim()) {
    parts.push(report.current_summary.slice(0, 150));
  }
  if (report.future_summary?.trim()) {
    parts.push(report.future_summary.slice(0, 150));
  }
  const summary =
    parts.length > 0
      ? parts.join(" ").slice(0, 120) + (parts.join(" ").length > 120 ? "…" : "")
      : "오늘의 비비드 기록을 확인해 보세요.";
  return {
    praise: [],
    feedback: [],
    improvements: [],
    summary,
  };
}

/**
 * Daily Vivid 인사이트 생성 (Pro 전용)
 * Pro 실패 시 Flash fallback, 최종 실패 시 리포트 기반 폴백 반환
 */
export async function generateDailyVividInsight(
  report: Report,
  persona: Record<string, unknown>,
  userName?: string
): Promise<DailyVividInsight> {
  const { formatPersonaForPrompt } = await import("@/lib/user-persona");
  const personaBlock = formatPersonaForPrompt(persona);
  if (!personaBlock?.trim()) {
    throw new Error("Persona content is required for insight generation");
  }

  const geminiClient = getGeminiClient();
  const enhancedSystemPrompt = enhanceSystemPromptWithGlobal(INSIGHT_SYSTEM_PROMPT, true);

  const reportParts: string[] = [];
  if (report.current_summary) {
    reportParts.push(`[오늘의 요약]\n${report.current_summary}`);
  }
  if (report.current_evaluation) {
    reportParts.push(`[오늘의 평가]\n${report.current_evaluation}`);
  }
  if (report.future_summary) {
    reportParts.push(`[기대하는 모습]\n${report.future_summary}`);
  }
  if (report.future_evaluation) {
    reportParts.push(`[기대 모습 평가]\n${report.future_evaluation}`);
  }
  if (
    typeof report.alignment_score === "number" &&
    Number.isFinite(report.alignment_score)
  ) {
    reportParts.push(`[일치도 점수] ${report.alignment_score}점`);
  }
  if (report.alignment_analysis_points?.length) {
    reportParts.push(
      `[일치도 근거] ${report.alignment_analysis_points.join(", ")}`
    );
  }
  if (report.user_characteristics?.length) {
    reportParts.push(
      `[사용자 특성] ${report.user_characteristics.join(", ")}`
    );
  }
  if (report.aspired_traits?.length) {
    reportParts.push(`[지향하는 특성] ${report.aspired_traits.join(", ")}`);
  }
  const reportSummary = reportParts.join("\n\n");

  const userLabel = userName ? `${userName}님` : "사용자";
  const prompt = `[사용자 페르소나]
${personaBlock}

[오늘의 비비드 리포트]
${reportSummary}

---
위 ${userLabel}의 오늘 계획과 페르소나를 비교 분석하여, praise/feedback/improvements 각각 1~3개씩 완전한 문장으로 JSON에 작성하세요.`;

  const request = {
    contents: [{ role: "user" as const, parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          praise: { type: "array", items: { type: "string" } },
          feedback: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          summary: { type: "string" },
        },
        required: ["praise", "feedback", "improvements"],
      },
      maxOutputTokens: 2048,
    },
  } as unknown as GenerateContentRequest;

  const maxAttempts = 3;
  const models: [string] = ["gemini-3-flash-preview"];

  for (const modelName of models) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await tryGenerateInsightWithModel(
          geminiClient,
          modelName,
          enhancedSystemPrompt,
          prompt,
          request,
          report
        );
      } catch (err) {
        console.warn(
          `[insight] ${modelName} attempt ${attempt}/${maxAttempts} failed:`,
          err instanceof Error ? err.message : String(err)
        );
        if (attempt < maxAttempts) {
          const delayMs = Math.min(2000 * Math.pow(2, attempt - 1), 8000);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }
  }

  // 모든 시도 실패 시 리포트 기반 폴백 반환 (요청 자체는 성공 처리)
  console.warn("[insight] All model attempts failed, returning fallback insight");
  return buildFallbackInsight(report);
}
