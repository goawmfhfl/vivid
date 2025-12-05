import OpenAI from "openai";
import {
  getWeeklyFeedbackSchema,
  SYSTEM_PROMPT_SUMMARY_REPORT,
  SYSTEM_PROMPT_DAILY_LIFE,
  SYSTEM_PROMPT_EMOTION,
  SYSTEM_PROMPT_VISION,
  SYSTEM_PROMPT_INSIGHT,
  SYSTEM_PROMPT_EXECUTION,
  SYSTEM_PROMPT_CLOSING,
} from "./schema";
import type { DailyFeedbackForWeekly } from "./types";
import {
  buildSummaryReportPrompt,
  buildDailyLifePrompt,
  buildEmotionPrompt,
  buildVisionPrompt,
  buildInsightPrompt,
  buildExecutionPrompt,
  buildClosingPrompt,
} from "./prompts";
import type {
  WeeklyFeedback,
  SummaryReport,
  DailyLifeReport,
  EmotionReport,
  VisionReport,
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
  schema: { name: string; schema: any; strict: boolean },
  cacheKey: string,
  isPro: boolean,
  sectionName: string,
  progressCallback?: ProgressCallback
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

  // Pro 멤버십에 따라 모델 선택
  const proModel = process.env.OPENAI_PRO_MODEL || "gpt-4o";
  const model = isPro ? proModel : "gpt-5-nano";

  // Pro 멤버십에 따라 프롬프트 강화
  const enhancedSystemPrompt = isPro
    ? `${systemPrompt}\n\n[Pro 멤버십: 더 상세하고 깊이 있는 분석을 제공하세요. 더 많은 세부사항과 인사이트를 포함하세요.]`
    : `${systemPrompt}\n\n[무료 멤버십: 간단하게 핵심만 알려주세요. 간결하고 요약된 형태로 응답하세요.]`;

  const startTime = Date.now();

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

      // 결과 구조 로깅 (디버깅용)
      console.log(`[generateSection:${schema.name}] Final result structure:`, {
        resultKeys: Object.keys(result || {}),
        resultType: typeof result,
        isArray: Array.isArray(result),
        resultPreview: result
          ? JSON.stringify(result).substring(0, 200)
          : "null",
      });

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
          `OpenAI API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요.`
        );
        (quotaError as any).code = "INSUFFICIENT_QUOTA";
        (quotaError as any).status = 429;
        throw quotaError;
      }

      throw error;
    });
}

/**
 * Summary Report 생성
 */
async function generateSummaryReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
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
    "SummaryReport",
    progressCallback
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
 * Daily Life Report 생성
 */
async function generateDailyLifeReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
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
    "DailyLifeReport",
    progressCallback
  );

  console.log("[generateDailyLifeReport] response received:", {
    response,
    responseKeys: response ? Object.keys(response) : [],
    hasDailyLifeReport: response ? "daily_life_report" in response : false,
    responseType: typeof response,
  });

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
  progressCallback?: ProgressCallback
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
    "EmotionReport",
    progressCallback
  );

  console.log("[generateEmotionReport] response received:", {
    response,
    responseKeys: response ? Object.keys(response) : [],
    hasEmotionReport: response ? "emotion_report" in response : false,
    responseType: typeof response,
  });

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
 * Vision Report 생성
 */
async function generateVisionReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
): Promise<VisionReport> {
  const prompt = buildVisionPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VISION, prompt);

  // 진행 상황 알림
  if (progressCallback) {
    progressCallback(4, 7, "VisionReport");
  }

  const response = await generateSection<{ vision_report: VisionReport }>(
    SYSTEM_PROMPT_VISION,
    prompt,
    {
      name: "VisionReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          vision_report:
            schema.schema.properties.weekly_feedback.properties.vision_report,
        },
        required: ["vision_report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "VisionReport",
    progressCallback
  );

  console.log("[generateVisionReport] response received:", {
    response,
    responseKeys: response ? Object.keys(response) : [],
    hasVisionReport: response ? "vision_report" in response : false,
    responseType: typeof response,
  });

  if (!response) {
    console.error("[generateVisionReport] response is null or undefined");
    throw new Error("Vision report response is null or undefined");
  }

  // response가 직접 VisionReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("vision_summary" in response || "vision_consistency" in response) &&
    !("vision_report" in response)
  ) {
    console.log(
      "[generateVisionReport] Response appears to be VisionReport directly, using it"
    );
    return response as VisionReport;
  }

  if (!response.vision_report) {
    console.error("[generateVisionReport] response.vision_report is missing", {
      response,
      responseKeys: Object.keys(response || {}),
      responseType: typeof response,
      responseValues: Object.values(response || {}),
      responseStringified: JSON.stringify(response, null, 2),
    });
    throw new Error("Vision report data is missing from response");
  }

  console.log(
    "[generateVisionReport] vision_report 추출 완료:",
    !!response.vision_report
  );
  return response.vision_report;
}

/**
 * Insight Report 생성
 */
async function generateInsightReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
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
    "InsightReport",
    progressCallback
  );

  console.log("[generateInsightReport] response received:", {
    response,
    responseKeys: response ? Object.keys(response) : [],
    hasInsightReport: response ? "insight_report" in response : false,
    responseType: typeof response,
  });

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
 * Execution Report 생성
 */
async function generateExecutionReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
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
    "ExecutionReport",
    progressCallback
  );

  console.log("[generateExecutionReport] response received:", {
    response,
    responseKeys: response ? Object.keys(response) : [],
    hasExecutionReport: response ? "execution_report" in response : false,
    responseType: typeof response,
  });

  if (!response) {
    console.error("[generateExecutionReport] response is null or undefined");
    throw new Error("Execution report response is null or undefined");
  }

  // response가 직접 ExecutionReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    ("positives_top3" in response || "improvements_top3" in response) &&
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
 * Closing Report 생성
 */
async function generateClosingReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  progressCallback?: ProgressCallback
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
    "ClosingReport",
    progressCallback
  );

  console.log("[generateClosingReport] response received:", {
    response,
    responseKeys: response ? Object.keys(response) : [],
    hasClosingReport: response ? "closing_report" in response : false,
    responseType: typeof response,
  });

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
 * Daily Feedback 배열을 기반으로 주간 피드백 생성 (병렬 처리 + 진행 상황 콜백)
 * 7개 섹션을 병렬로 생성하며 각 섹션 완료 시점에 진행 상황을 콜백으로 전달
 */
export async function generateWeeklyFeedbackFromDailyWithProgress(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean = false,
  progressCallback?: ProgressCallback
): Promise<WeeklyFeedback> {
  // 병렬로 7개 섹션 생성 (각 섹션 완료 시점에 진행 상황 알림)
  console.log("[generateWeeklyFeedbackFromDailyWithProgress] 시작");

  // 각 Promise에 완료 콜백 추가
  const summaryPromise = generateSummaryReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback
  ).then((result) => {
    if (progressCallback) {
      progressCallback(1, 7, "SummaryReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] summaryReport 생성 완료:",
      !!result
    );
    return result;
  });

  const dailyLifePromise = generateDailyLifeReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback
  ).then((result) => {
    if (progressCallback) {
      progressCallback(2, 7, "DailyLifeReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] dailyLifeReport 생성 완료:",
      !!result
    );
    return result;
  });

  const emotionPromise = generateEmotionReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback
  ).then((result) => {
    if (progressCallback) {
      progressCallback(3, 7, "EmotionReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] emotionReport 생성 완료:",
      !!result
    );
    return result;
  });

  const visionPromise = generateVisionReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback
  ).then((result) => {
    if (progressCallback) {
      progressCallback(4, 7, "VisionReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] visionReport 생성 완료:",
      !!result
    );
    return result;
  });

  const insightPromise = generateInsightReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback
  ).then((result) => {
    if (progressCallback) {
      progressCallback(5, 7, "InsightReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] insightReport 생성 완료:",
      !!result
    );
    return result;
  });

  const executionPromise = generateExecutionReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback
  ).then((result) => {
    if (progressCallback) {
      progressCallback(6, 7, "ExecutionReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] executionReport 생성 완료:",
      !!result
    );
    return result;
  });

  const closingPromise = generateClosingReport(
    dailyFeedbacks,
    range,
    isPro,
    progressCallback
  ).then((result) => {
    if (progressCallback) {
      progressCallback(7, 7, "ClosingReport");
    }
    console.log(
      "[generateWeeklyFeedbackFromDailyWithProgress] closingReport 생성 완료:",
      !!result
    );
    return result;
  });

  // 모든 Promise를 병렬로 실행
  const [
    summaryReport,
    dailyLifeReport,
    emotionReport,
    visionReport,
    insightReport,
    executionReport,
    closingReport,
  ] = await Promise.all([
    summaryPromise,
    dailyLifePromise,
    emotionPromise,
    visionPromise,
    insightPromise,
    executionPromise,
    closingPromise,
  ]);

  // 최종 Weekly Feedback 조합
  const weeklyFeedback: WeeklyFeedback = {
    week_range: range,
    summary_report: summaryReport,
    daily_life_report: dailyLifeReport,
    emotion_report: emotionReport,
    vision_report: visionReport,
    insight_report: insightReport,
    execution_report: executionReport,
    closing_report: closingReport,
    is_ai_generated: true,
  };

  console.log(
    "[generateWeeklyFeedbackFromDailyWithProgress] 모든 섹션 생성 완료:",
    {
      summary_report: !!weeklyFeedback.summary_report,
      daily_life_report: !!weeklyFeedback.daily_life_report,
      emotion_report: !!weeklyFeedback.emotion_report,
      vision_report: !!weeklyFeedback.vision_report,
      insight_report: !!weeklyFeedback.insight_report,
      execution_report: !!weeklyFeedback.execution_report,
      closing_report: !!weeklyFeedback.closing_report,
    }
  );

  return weeklyFeedback;
}
