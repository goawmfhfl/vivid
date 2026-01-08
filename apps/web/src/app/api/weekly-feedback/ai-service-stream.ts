import OpenAI from "openai";
import {
  getWeeklyFeedbackSchema,
  SYSTEM_PROMPT_SUMMARY_REPORT,
  SYSTEM_PROMPT_DAILY_LIFE,
  SYSTEM_PROMPT_EMOTION,
  SYSTEM_PROMPT_VIVID,
  SYSTEM_PROMPT_INSIGHT,
  SYSTEM_PROMPT_EXECUTION,
  SYSTEM_PROMPT_CLOSING,
} from "./schema";
import type { DailyFeedbackForWeekly } from "./types";
import {
  buildSummaryReportPrompt,
  buildDailyLifePrompt,
  buildEmotionPrompt,
  buildVividPrompt,
  buildInsightPrompt,
  buildExecutionPrompt,
  buildClosingPrompt,
} from "./prompts";
import type {
  WeeklyFeedback,
  SummaryReport,
  DailyLifeReport,
  EmotionReport,
  VividReport,
  InsightReport,
  ExecutionReport,
  ClosingReport,
} from "@/types/weekly-feedback";
import {
  generateCacheKey,
  getFromCache,
  setCache,
  generatePromptCacheKey,
} from "../utils/cache";
import type {
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
 * 진행 상황 콜백 타입
 */
type ProgressCallback = (
  step: number,
  total: number,
  sectionName: string
) => void;

/**
 * Section 생성 헬퍼 함수 (진행 상황 추적 포함)
 */
async function generateSection<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ReportSchema,
  cacheKey: string,
  isPro: boolean,
  sectionName: string,
  progressCallback?: ProgressCallback,
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

  const openai = getOpenAIClient();
  const promptCacheKey = generatePromptCacheKey(systemPrompt);

  // Weekly & Monthly Reports는 gpt-5-mini로 자동 업그레이드
  // Daily 점수 기반으로 정확도 향상 및 일관성 보정 역할
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

  // 요청 정보 로깅
  const systemPromptSize = enhancedSystemPrompt.length;
  const userPromptSize = userPrompt.length;
  const totalPromptSize = systemPromptSize + userPromptSize;
  
  console.log(`[${sectionName}] API 요청 시작:`, {
    model,
    schemaName: schema.name,
    systemPromptSize,
    userPromptSize,
    totalPromptSize,
    estimatedTokens: Math.ceil(totalPromptSize / 4), // 대략적인 토큰 수 추정 (1 토큰 ≈ 4 문자)
    timestamp: new Date().toISOString(),
  });

  // Promise를 반환하여 비동기 요청 시작
  return openai.chat.completions
    .create({
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
    })
    .then((completion) => {
      const endTime = Date.now();
      const duration_ms = endTime - startTime;

      console.log(`[${sectionName}] API 요청 성공:`, {
        duration_ms,
        duration_seconds: (duration_ms / 1000).toFixed(2),
        usage: completion.usage,
        cachedTokens: (completion.usage as ExtendedUsage | undefined)?.prompt_tokens_details?.cached_tokens || 0,
        timestamp: new Date().toISOString(),
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No content from OpenAI (${schema.name})`);
      }

      const parsed = JSON.parse(content);

      // 파싱된 결과에서 실제 데이터 추출
      // OpenAI는 다양한 형태로 반환할 수 있음:
      // 1. { "SummaryReportResponse": { summary_report: {...} } }
      // 2. { "summary_report": {...} }
      // 3. { "SummaryReportResponse": {...} } (직접 객체)
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
            requestType: "weekly_feedback",
            sectionName,
            usage,
            duration_ms,
            success: true,
          });
        }
      }

      // 진행 상황 알림
      if (progressCallback) {
        progressCallback(0, 0, sectionName);
      }

      // 추적 정보를 결과에 첨부 (테스트 환경에서만)
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_NODE_ENV === "development"
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
    })
    .catch((error: unknown) => {
      const err = error as ApiError;
      const endTime = Date.now();
      const duration_ms = endTime - startTime;

      // 상세 에러 정보 로깅 (502 에러 원인 파악을 위해)
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
        model,
        systemPromptSize,
        userPromptSize,
        totalPromptSize,
        estimatedTokens: Math.ceil(totalPromptSize / 4),
      };

      // OpenAI SDK 에러의 경우 추가 정보 수집
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
        // OpenAI SDK의 경우 error 객체에 직접 속성이 있을 수 있음
        if ('error' in err && err.error) {
          errorDetails.openaiError = err.error;
        }
      }

      // 502 에러인 경우 특별히 상세 로깅
      if (err?.status === 502) {
        console.error(`[${sectionName}] 502 Bad Gateway 에러 발생 - 상세 정보:`, errorDetails);
        console.error(`[${sectionName}] 502 에러 분석:`, {
          가능한_원인: [
            "Cloudflare 타임아웃 (일반적으로 100초)",
            "Next.js API Route 타임아웃 (180초 설정)",
            "OpenAI API 응답 지연",
            "네트워크 연결 문제",
          ],
          현재_설정: {
            openaiTimeout: "180000ms (3분)",
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
        err?.message?.includes("quota") ||
        err?.message?.includes("429")
      ) {
        const quotaError = new Error(
          `OpenAI API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요.`
        ) as ApiError;
        quotaError.code = "INSUFFICIENT_QUOTA";
        quotaError.status = 429;
        throw quotaError;
      }

      // AI 사용량 로깅 (에러 발생 시에도 로깅)
      if (userId) {
        logAIRequestAsync({
          userId,
          model,
          requestType: "weekly_feedback",
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
    });
}

/**
 * Summary Report 생성 (사용되지 않음 - 기본값 사용)
 */
async function _generateSummaryReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<SummaryReport> {
  const prompt = buildSummaryReportPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_SUMMARY_REPORT, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(1, 7, "SummaryReport");
  }

  const response = await generateSection<{ summary_report: SummaryReport }>(
    SYSTEM_PROMPT_SUMMARY_REPORT,
    prompt,
    {
      name: "SummaryReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary_report:
            schema.schema.properties.weekly_feedback.properties.summary_report,
        },
        required: ["summary_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "summary_report",
    progressCallback,
    userId
  );

  if (!response) {
    console.error("generateSummaryReport: response is null or undefined");
    throw new Error("Summary report response is null or undefined");
  }

  // response가 직접 SummaryReport인 경우 처리 (스키마 구조가 다를 수 있음)
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("summary" in response || "key_points" in response) &&
    !("summary_report" in response)
  ) {
    console.log(
      "[generateSummaryReport] Response appears to be SummaryReport directly, using it"
    );
    return response as SummaryReport;
  }

  if (!response.summary_report) {
    console.error("generateSummaryReport: response.summary_report is missing", {
      response,
      responseKeys: Object.keys(response || {}),
      responseType: typeof response,
      responseValues: Object.values(response || {}),
      responseStringified: JSON.stringify(response, null, 2),
    });
    throw new Error("Summary report data is missing from response");
  }

  const summaryReport = response.summary_report;
  console.log(
    "[generateSummaryReport] summary_report 추출 완료:",
    !!summaryReport
  );
  if (!summaryReport) {
    throw new Error("Summary report data is null or undefined");
  }
  return summaryReport;
}

/**
 * Daily Life Report 생성 (사용되지 않음 - 기본값 사용)
 */
async function _generateDailyLifeReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<DailyLifeReport> {
  const prompt = buildDailyLifePrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DAILY_LIFE, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(2, 7, "DailyLifeReport");
  }

  const response = await generateSection<{
    daily_life_report: DailyLifeReport;
  }>(
    SYSTEM_PROMPT_DAILY_LIFE,
    prompt,
    {
      name: "DailyLifeReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          daily_life_report:
            schema.schema.properties.weekly_feedback.properties
              .daily_life_report,
        },
        required: ["daily_life_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "daily_life_report",
    progressCallback,
    userId
  );

  if (!response) {
    console.error("[generateDailyLifeReport] response is null or undefined");
    throw new Error("Daily life report response is null or undefined");
  }

  // response가 직접 DailyLifeReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("summary" in response || "daily_summaries_trend" in response) &&
    !("daily_life_report" in response)
  ) {
    console.log(
      "[generateDailyLifeReport] Response appears to be DailyLifeReport directly, using it"
    );
    return response as DailyLifeReport;
  }

  if (!response.daily_life_report) {
    console.error(
      "[generateDailyLifeReport] response.daily_life_report is missing",
      {
        response,
        responseKeys: Object.keys(response || {}),
        responseType: typeof response,
        responseValues: Object.values(response || {}),
        responseStringified: JSON.stringify(response, null, 2),
      }
    );
    throw new Error("Daily life report data is missing from response");
  }

  console.log(
    "[generateDailyLifeReport] daily_life_report 추출 완료:",
    !!response.daily_life_report
  );
  return response.daily_life_report;
}

/**
 * Emotion Report 생성
 */
async function generateEmotionReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<EmotionReport> {
  const prompt = buildEmotionPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EMOTION, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(3, 7, "EmotionReport");
  }

  const response = await generateSection<{ emotion_report: EmotionReport }>(
    SYSTEM_PROMPT_EMOTION,
    prompt,
    {
      name: "EmotionReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          emotion_report:
            schema.schema.properties.weekly_feedback.properties.emotion_report,
        },
        required: ["emotion_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "emotion_report",
    progressCallback,
    userId
  );

  if (!response) {
    console.error("[generateEmotionReport] response is null or undefined");
    throw new Error("Emotion report response is null or undefined");
  }

  // response가 직접 EmotionReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("dominant_emotion" in response ||
      "valence_explanation" in response ||
      "daily_emotions" in response) &&
    !("emotion_report" in response)
  ) {
    console.log(
      "[generateEmotionReport] Response appears to be EmotionReport directly, using it"
    );
    return response as EmotionReport;
  }

  if (!response.emotion_report) {
    console.error(
      "[generateEmotionReport] response.emotion_report is missing",
      {
        response,
        responseKeys: Object.keys(response || {}),
        responseType: typeof response,
        responseValues: Object.values(response || {}),
        responseStringified: JSON.stringify(response, null, 2),
      }
    );
    throw new Error("Emotion report data is missing from response");
  }

  console.log(
    "[generateEmotionReport] emotion_report 추출 완료:",
    !!response.emotion_report
  );
  return response.emotion_report;
}

/**
 * Vivid Report 생성
 */
async function generateVividReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<VividReport> {
  const prompt = buildVividPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(4, 7, "VividReport");
  }

  const response = await generateSection<{ vivid_report: VividReport }>(
    SYSTEM_PROMPT_VIVID,
    prompt,
    {
      name: "VividReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          vivid_report:
            schema.schema.properties.weekly_feedback.properties.vivid_report,
        },
        required: ["vivid_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "vivid_report",
    progressCallback,
    userId
  );

  if (!response) {
    console.error("[generateVividReport] response is null or undefined");
    throw new Error("Vivid report response is null or undefined");
  }

  // response가 직접 VividReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    "weekly_vivid_summary" in response &&
    !("vivid_report" in response)
  ) {
    console.log(
      "[generateVividReport] Response appears to be VividReport directly, using it"
    );
    return response as VividReport;
  }

  if (!response.vivid_report) {
    console.error("[generateVividReport] response.vivid_report is missing", {
      response,
      responseKeys: Object.keys(response || {}),
      responseType: typeof response,
      responseValues: Object.values(response || {}),
      responseStringified: JSON.stringify(response, null, 2),
    });
    throw new Error("Vivid report data is missing from response");
  }

  console.log(
    "[generateVividReport] vivid_report 추출 완료:",
    !!response.vivid_report
  );
  return response.vivid_report;
}

/**
 * Insight Report 생성 (사용되지 않음 - 기본값 사용)
 */
async function _generateInsightReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<InsightReport> {
  const prompt = buildInsightPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_INSIGHT, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(5, 7, "InsightReport");
  }

  const response = await generateSection<{ insight_report: InsightReport }>(
    SYSTEM_PROMPT_INSIGHT,
    prompt,
    {
      name: "InsightReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          insight_report:
            schema.schema.properties.weekly_feedback.properties.insight_report,
        },
        required: ["insight_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "insight_report",
    progressCallback,
    userId
  );

  if (!response) {
    console.error("[generateInsightReport] response is null or undefined");
    throw new Error("Insight report response is null or undefined");
  }

  // response가 직접 InsightReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("core_insights" in response || "meta_questions_highlight" in response) &&
    !("insight_report" in response)
  ) {
    console.log(
      "[generateInsightReport] Response appears to be InsightReport directly, using it"
    );
    return response as InsightReport;
  }

  if (!response.insight_report) {
    console.error(
      "[generateInsightReport] response.insight_report is missing",
      {
        response,
        responseKeys: Object.keys(response || {}),
        responseType: typeof response,
        responseValues: Object.values(response || {}),
        responseStringified: JSON.stringify(response, null, 2),
      }
    );
    throw new Error("Insight report data is missing from response");
  }

  console.log(
    "[generateInsightReport] insight_report 추출 완료:",
    !!response.insight_report
  );
  return response.insight_report;
}

/**
 * Execution Report 생성 (사용되지 않음 - 기본값 사용)
 */
async function _generateExecutionReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<ExecutionReport> {
  const prompt = buildExecutionPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EXECUTION, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(6, 7, "ExecutionReport");
  }

  const response = await generateSection<{ execution_report: ExecutionReport }>(
    SYSTEM_PROMPT_EXECUTION,
    prompt,
    {
      name: "ExecutionReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          execution_report:
            schema.schema.properties.weekly_feedback.properties
              .execution_report,
        },
        required: ["execution_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "execution_report",
    progressCallback,
    userId
  );

  if (!response) {
    console.error("[generateExecutionReport] response is null or undefined");
    throw new Error("Execution report response is null or undefined");
  }

  // response가 직접 ExecutionReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("ai_feedback_summary" in response ||
      "feedback_patterns" in response ||
      "person_traits_analysis" in response) &&
    !("execution_report" in response)
  ) {
    console.log(
      "[generateExecutionReport] Response appears to be ExecutionReport directly, using it"
    );
    return response as ExecutionReport;
  }

  if (!response.execution_report) {
    console.error(
      "[generateExecutionReport] response.execution_report is missing",
      {
        response,
        responseKeys: Object.keys(response || {}),
        responseType: typeof response,
        responseValues: Object.values(response || {}),
        responseStringified: JSON.stringify(response, null, 2),
      }
    );
    throw new Error("Execution report data is missing from response");
  }

  console.log(
    "[generateExecutionReport] execution_report 추출 완료:",
    !!response.execution_report
  );
  return response.execution_report;
}

/**
 * Closing Report 생성 (사용되지 않음 - 기본값 사용)
 */
async function _generateClosingReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<ClosingReport> {
  const prompt = buildClosingPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_CLOSING, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(7, 7, "ClosingReport");
  }

  const response = await generateSection<{ closing_report: ClosingReport }>(
    SYSTEM_PROMPT_CLOSING,
    prompt,
    {
      name: "ClosingReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          closing_report:
            schema.schema.properties.weekly_feedback.properties.closing_report,
        },
        required: ["closing_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "closing_report",
    progressCallback,
    userId
  );

  if (!response) {
    console.error("[generateClosingReport] response is null or undefined");
    throw new Error("Closing report response is null or undefined");
  }

  // response가 직접 ClosingReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("call_to_action" in response || "this_week_identity" in response) &&
    !("closing_report" in response)
  ) {
    console.log(
      "[generateClosingReport] Response appears to be ClosingReport directly, using it"
    );
    return response as ClosingReport;
  }

  if (!response.closing_report) {
    console.error(
      "[generateClosingReport] response.closing_report is missing",
      {
        response,
        responseKeys: Object.keys(response || {}),
        responseType: typeof response,
        responseValues: Object.values(response || {}),
        responseStringified: JSON.stringify(response, null, 2),
      }
    );
    throw new Error("Closing report data is missing from response");
  }

  console.log(
    "[generateClosingReport] closing_report 추출 완료:",
    !!response.closing_report
  );
  return response.closing_report;
}

/**
 * 기본값 생성 헬퍼 함수들
 */
function createDefaultSummaryReport(
  range: { start: string; end: string; timezone: string }
): SummaryReport {
  return {
    title: `${range.start} ~ ${range.end} 주간 피드백`,
    summary: "이번 주 피드백이 생성되었습니다.",
    key_points: [],
    trend_analysis: null,
  };
}

function createDefaultDailyLifeReport(): DailyLifeReport {
  return {
    summary: "",
    daily_summaries_trend: {
      overall_narrative: "",
      key_highlights: [],
    },
    events_pattern: {
      most_frequent_events: [],
      event_categories: [],
      timing_patterns: [],
    },
    emotion_triggers_analysis: {
      summary: "",
      category_distribution: {
        self: { count: 0, percentage: 0, top_triggers: [], insight: null },
        work: { count: 0, percentage: 0, top_triggers: [], insight: null },
        people: { count: 0, percentage: 0, top_triggers: [], insight: null },
        environment: {
          count: 0,
          percentage: 0,
          top_triggers: [],
          insight: null,
        },
      },
    },
    behavioral_patterns: {
      summary: "",
      pattern_distribution: {
        planned: { count: 0, percentage: 0, examples: [], insight: null },
        impulsive: { count: 0, percentage: 0, examples: [], insight: null },
        routine_attempt: {
          count: 0,
          percentage: 0,
          examples: [],
          insight: null,
        },
        avoidance: { count: 0, percentage: 0, examples: [], insight: null },
        routine_failure: {
          count: 0,
          percentage: 0,
          examples: [],
          insight: null,
        },
      },
      behavior_emotion_correlation: [],
    },
    keywords_analysis: {
      top_keywords: [],
      keyword_categories: [],
    },
    ai_comments_insights: {
      common_themes: [],
      actionable_advice_summary: "",
    },
    daily_rhythm: {
      summary: "",
      time_patterns: [],
    },
    growth_insights: {
      resilience_patterns: [],
      improvement_opportunities: [],
      strengths_highlighted: [],
    },
    next_week_suggestions: {
      focus_areas: [],
      maintain_strengths: [],
    },
  };
}

function createDefaultInsightReport(): InsightReport {
  return {
    core_insights: [],
    meta_questions_highlight: [],
    repeated_themes: [],
    insight_patterns: {
      summary: "",
      insight_categories: [],
      key_strengths_identified: [],
    },
    meta_questions_analysis: {
      summary: "",
      question_themes: [],
    },
    ai_comment_patterns: {
      summary: "",
      common_themes: [],
    },
    insight_action_alignment: {
      summary: "",
      alignment_score: { value: 0, description: "" },
      strong_connections: [],
    },
    growth_insights: {
      key_learnings: [],
    },
    next_week_focus: {
      focus_areas: [],
    },
  };
}

function createDefaultExecutionReport(): ExecutionReport {
  return {
    ai_feedback_summary: "",
    feedback_patterns: {
      summary: "",
      positives_categories: [],
      improvements_categories: [],
    },
    person_traits_analysis: {
      summary: "",
      key_traits: [],
    },
    ai_message_patterns: {
      summary: "",
      common_themes: [],
    },
    improvement_action_alignment: {
      summary: "",
      alignment_score: { value: 0, description: "" },
      strong_connections: [],
    },
  };
}

function createDefaultClosingReport(): ClosingReport {
  return {
    call_to_action: {
      weekly_one_liner: "",
      next_week_objective: "",
      actions: [],
    },
    this_week_identity: {
      core_characteristics: [],
      growth_story: {
        summary: "",
        narrative: "",
      },
      strengths_highlighted: {
        summary: "",
        top_strengths: [],
      },
      areas_of_awareness: {
        summary: "",
        key_areas: [],
      },
    },
    next_week_identity_intention: {
      summary: "",
      intention: "",
      focus_areas: [],
    },
  };
}

/**
 * Daily Feedback 배열을 기반으로 주간 피드백 생성 (vivid_report와 emotion_report만 AI 생성)
 * 2개 섹션만 병렬로 생성하며 각 섹션 완료 시점에 진행 상황을 콜백으로 전달
 */
export async function generateWeeklyFeedbackFromDailyWithProgress(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<WeeklyFeedback> {
  // vivid_report와 emotion_report만 AI로 생성

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(0, 2, "시작");
  }

  const emotionPromise = generateEmotionReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback,
    userId
  ).then((result) => {
    if (progressCallback) {
      progressCallback(1, 2, "EmotionReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] emotionReport 생성 완료:",
      !!result
    );
    return result;
  });

  const vividPromise = generateVividReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback,
    userId
  ).then((result) => {
    if (progressCallback) {
      progressCallback(2, 2, "VividReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] vividReport 생성 완료:",
      !!result
    );
    return result;
  });

  // emotion_report와 vivid_report만 병렬로 생성
  const [emotionReport, vividReport] = await Promise.all([
    emotionPromise,
    vividPromise,
  ]);

  // 나머지 섹션들은 기본값으로 설정 (AI 요청하지 않음)
  const summaryReport = createDefaultSummaryReport(range);
  const dailyLifeReport = createDefaultDailyLifeReport();
  const insightReport = createDefaultInsightReport();
  const executionReport = createDefaultExecutionReport();
  const closingReport = createDefaultClosingReport();

  // 최종 Weekly Feedback 조합
  const weeklyFeedback: WeeklyFeedback = {
    week_range: range,
    summary_report: summaryReport,
    daily_life_report: dailyLifeReport,
    emotion_report: emotionReport,
    vivid_report: vividReport,
    insight_report: insightReport,
    execution_report: executionReport,
    closing_report: closingReport,
    is_ai_generated: true,
  };

  return weeklyFeedback;
}
