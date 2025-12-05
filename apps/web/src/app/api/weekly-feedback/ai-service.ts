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
  schema: { name: string; schema: any; strict: boolean },
  cacheKey: string,
  isPro: boolean = false
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
  const proModel = process.env.OPENAI_PRO_MODEL || "gpt-5-nano";
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

      const result = JSON.parse(content) as T;

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
  isPro: boolean
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
    isPro
  );

  return response.summary_report;
}

/**
 * Daily Life Report 생성
 */
async function generateDailyLifeReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean
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
    isPro
  );

  return response.daily_life_report;
}

/**
 * Emotion Report 생성
 */
async function generateEmotionReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean
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
    isPro
  );

  return response.emotion_report;
}

/**
 * Vision Report 생성
 */
async function generateVisionReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean
): Promise<VisionReport> {
  const prompt = buildVisionPrompt(dailyFeedbacks, range);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VISION, prompt);

  const response = await generateSection<{
    vision_report: VisionReport;
  }>(
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
    isPro
  );

  return response.vision_report;
}

/**
 * Insight Report 생성
 */
async function generateInsightReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean
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
    isPro
  );

  return response.insight_report;
}

/**
 * Execution Report 생성
 */
async function generateExecutionReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean
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
    isPro
  );

  return response.execution_report;
}

/**
 * Closing Report 생성
 */
async function generateClosingReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean
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
    isPro
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
  isPro: boolean = false
): Promise<WeeklyFeedback> {
  // 7개 섹션을 병렬로 생성
  const [
    summaryReport,
    dailyLifeReport,
    emotionReport,
    visionReport,
    insightReport,
    executionReport,
    closingReport,
  ] = await Promise.all([
    generateSummaryReport(dailyFeedbacks, range, isPro),
    generateDailyLifeReport(dailyFeedbacks, range, isPro),
    generateEmotionReport(dailyFeedbacks, range, isPro),
    generateVisionReport(dailyFeedbacks, range, isPro),
    generateInsightReport(dailyFeedbacks, range, isPro),
    generateExecutionReport(dailyFeedbacks, range, isPro),
    generateClosingReport(dailyFeedbacks, range, isPro),
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

  return weeklyFeedback;
}
