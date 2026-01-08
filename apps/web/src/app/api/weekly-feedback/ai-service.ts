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
    maxRetries: 0, // 재시도 최소화
  });
}

/**
 * AI 리포트 생성 헬퍼 함수
 * @param isPro Pro 멤버십 여부에 따라 모델과 프롬프트를 차별화
 */
async function generateSection<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ReportSchema,
  cacheKey: string,
  isPro: boolean = false,
  userId?: string,
  sectionName?: string
): Promise<T> {
  // 캐시에서 조회 (멤버십별로 캐시 키 구분)
  const proCacheKey = isPro ? `${cacheKey}_pro` : cacheKey;
  const cachedResult = getFromCache<T>(proCacheKey);
  if (cachedResult) {
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

      const result = JSON.parse(content) as T;

      // 캐시에 저장 (멤버십별로 구분)
      setCache(proCacheKey, result);

      // AI 사용량 로깅 (userId가 제공된 경우에만, 캐시된 응답이 아닌 경우에만)
      if (userId && sectionName) {
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

      // 추적 정보를 결과에 첨부 (테스트 환경에서만)
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_NODE_ENV === "development"
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
          `OpenAI API 쿼터가 초과되었습니다. 잠시 후 다시 시도해주세요. (${schema.name})`
        ) as ApiError;
        quotaError.code = "INSUFFICIENT_QUOTA";
        quotaError.status = 429;
        throw quotaError;
      }

      // AI 사용량 로깅 (에러 발생 시에도 로깅)
      if (userId && sectionName) {
        const endTime = Date.now();
        const duration_ms = endTime - startTime;
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
 * Summary Report 생성
 */
async function generateSummaryReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string
): Promise<SummaryReport> {
  const prompt = buildSummaryReportPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_SUMMARY_REPORT, prompt);

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
    userId,
    "summary_report"
  );

  return response.summary_report;
}

/**
 * Daily Life Report 생성
 */
async function generateDailyLifeReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string
): Promise<DailyLifeReport> {
  const prompt = buildDailyLifePrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DAILY_LIFE, prompt);

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
    userId,
    "daily_life_report"
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
  userId?: string
): Promise<EmotionReport> {
  const prompt = buildEmotionPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EMOTION, prompt);

  const response = await generateSection<{
    emotion_report: EmotionReport;
  }>(
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
    userId,
    "emotion_report"
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
  userId?: string
): Promise<VividReport> {
  const prompt = buildVividPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, prompt);

  const response = await generateSection<{
    vivid_report: VividReport;
  }>(
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
    userId,
    "vivid_report"
  );

  return response.vivid_report;
}

/**
 * Insight Report 생성
 */
async function generateInsightReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string
): Promise<InsightReport> {
  const prompt = buildInsightPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_INSIGHT, prompt);

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
    userId,
    "insight_report"
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
  userId?: string
): Promise<ExecutionReport> {
  const prompt = buildExecutionPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EXECUTION, prompt);

  const response = await generateSection<{
    execution_report: ExecutionReport;
  }>(
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
    userId,
    "execution_report"
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
  userId?: string
): Promise<ClosingReport> {
  const prompt = buildClosingPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_CLOSING, prompt);

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
    userId,
    "closing_report"
  );

  return response.closing_report;
}

/**
 * Daily Feedback 배열을 기반으로 주간 피드백 생성 (병렬 처리)
 * 7개 섹션을 병렬로 생성 (Promise.all 사용)
 */
export async function generateWeeklyFeedbackFromDaily(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean = false,
  userId?: string
): Promise<WeeklyFeedback> {
  // 7개 섹션을 병렬로 생성
  const [
    summaryReport,
    dailyLifeReport,
    emotionReport,
    vividReport,
    insightReport,
    executionReport,
    closingReport,
  ] = await Promise.all([
    generateSummaryReport(dailyFeedbacks, range, isPro, userId),
    generateDailyLifeReport(dailyFeedbacks, range, isPro, userId),
    generateEmotionReport(dailyFeedbacks, range, isPro, userId),
    generateVividReport(dailyFeedbacks, range, isPro, userId),
    generateInsightReport(dailyFeedbacks, range, isPro, userId),
    generateExecutionReport(dailyFeedbacks, range, isPro, userId),
    generateClosingReport(dailyFeedbacks, range, isPro, userId),
  ]);

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
