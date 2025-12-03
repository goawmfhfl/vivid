import OpenAI from "openai";
import type { Record } from "./types";
import type {
  SummaryReport,
  DailyReport,
  EmotionReport,
  DreamReport,
  InsightReport,
  FeedbackReport,
  FinalReport,
} from "@/types/daily-feedback";
import {
  SummaryReportSchema,
  DailyReportSchema,
  EmotionReportSchema,
  DreamReportSchema,
  InsightReportSchema,
  FeedbackReportSchema,
  FinalReportSchema,
  SYSTEM_PROMPT_SUMMARY,
  SYSTEM_PROMPT_DAILY,
  SYSTEM_PROMPT_EMOTION,
  SYSTEM_PROMPT_DREAM,
  SYSTEM_PROMPT_INSIGHT,
  SYSTEM_PROMPT_FEEDBACK,
  SYSTEM_PROMPT_FINAL,
} from "./schema-v2";
import {
  buildSummaryPrompt,
  buildDailyPrompt,
  buildEmotionPrompt,
  buildDreamPrompt,
  buildInsightPrompt,
  buildFeedbackPrompt,
  buildFinalPrompt,
} from "./prompts-v2";
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
 * AI 리포트 생성 헬퍼 함수
 */
async function generateReport<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: { name: string; schema: any; strict: boolean },
  cacheKey: string
): Promise<T> {
  // 캐시에서 조회
  const cachedResult = getFromCache<T>(cacheKey);
  if (cachedResult) {
    console.log(`캐시에서 결과 반환 (${schema.name})`);
    return cachedResult;
  }

  const openai = getOpenAIClient();
  const promptCacheKey = generatePromptCacheKey(systemPrompt);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
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
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`No content from OpenAI (${schema.name})`);
    }

    const result = JSON.parse(content) as T;

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
      // Fallback to gpt-4
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt,
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
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No content from OpenAI (${schema.name})`);
      }

      const result = JSON.parse(content) as T;

      // 캐시에 저장
      setCache(cacheKey, result);

      return result;
    }
    throw error;
  }
}

/**
 * 전체 요약 리포트 생성
 */
export async function generateSummaryReport(
  records: Record[],
  date: string,
  dayOfWeek: string
): Promise<SummaryReport> {
  const prompt = buildSummaryPrompt(records, date, dayOfWeek);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_SUMMARY, prompt);

  return generateReport<SummaryReport>(
    SYSTEM_PROMPT_SUMMARY,
    prompt,
    SummaryReportSchema,
    cacheKey
  );
}

/**
 * 일상 기록 리포트 생성
 */
export async function generateDailyReport(
  records: Record[],
  date: string,
  dayOfWeek: string
): Promise<DailyReport | null> {
  const dailyRecords = records.filter((r) => r.type === "daily");

  if (dailyRecords.length === 0) {
    return null;
  }

  const prompt = buildDailyPrompt(records, date, dayOfWeek);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DAILY, prompt);

  return generateReport<DailyReport>(
    SYSTEM_PROMPT_DAILY,
    prompt,
    DailyReportSchema,
    cacheKey
  );
}

/**
 * 감정 기록 리포트 생성
 */
export async function generateEmotionReport(
  records: Record[],
  date: string,
  dayOfWeek: string
): Promise<EmotionReport | null> {
  const emotionRecords = records.filter((r) => r.type === "emotion");

  if (emotionRecords.length === 0) {
    return null;
  }

  const prompt = buildEmotionPrompt(records, date, dayOfWeek);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EMOTION, prompt);

  return generateReport<EmotionReport>(
    SYSTEM_PROMPT_EMOTION,
    prompt,
    EmotionReportSchema,
    cacheKey
  );
}

/**
 * 꿈/목표 기록 리포트 생성
 */
export async function generateDreamReport(
  records: Record[],
  date: string,
  dayOfWeek: string
): Promise<DreamReport | null> {
  const dreamRecords = records.filter((r) => r.type === "dream");

  if (dreamRecords.length === 0) {
    return null;
  }

  const prompt = buildDreamPrompt(records, date, dayOfWeek);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DREAM, prompt);

  return generateReport<DreamReport>(
    SYSTEM_PROMPT_DREAM,
    prompt,
    DreamReportSchema,
    cacheKey
  );
}

/**
 * 인사이트 기록 리포트 생성
 */
export async function generateInsightReport(
  records: Record[],
  date: string,
  dayOfWeek: string
): Promise<InsightReport | null> {
  const insightRecords = records.filter((r) => r.type === "insight");

  if (insightRecords.length === 0) {
    return null;
  }

  const prompt = buildInsightPrompt(records, date, dayOfWeek);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_INSIGHT, prompt);

  return generateReport<InsightReport>(
    SYSTEM_PROMPT_INSIGHT,
    prompt,
    InsightReportSchema,
    cacheKey
  );
}

/**
 * 피드백 기록 리포트 생성
 */
export async function generateFeedbackReport(
  records: Record[],
  date: string,
  dayOfWeek: string
): Promise<FeedbackReport | null> {
  const feedbackRecords = records.filter((r) => r.type === "feedback");

  if (feedbackRecords.length === 0) {
    return null;
  }

  const prompt = buildFeedbackPrompt(records, date, dayOfWeek);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_FEEDBACK, prompt);

  return generateReport<FeedbackReport>(
    SYSTEM_PROMPT_FEEDBACK,
    prompt,
    FeedbackReportSchema,
    cacheKey
  );
}

/**
 * 최종 리포트 생성 (모든 리포트를 종합)
 */
export async function generateFinalReport(
  date: string,
  dayOfWeek: string,
  summaryReport: SummaryReport | null,
  dailyReport: DailyReport | null,
  emotionReport: EmotionReport | null,
  dreamReport: DreamReport | null,
  insightReport: InsightReport | null,
  feedbackReport: FeedbackReport | null
): Promise<FinalReport> {
  const prompt = buildFinalPrompt(
    date,
    dayOfWeek,
    summaryReport,
    dailyReport,
    emotionReport,
    dreamReport,
    insightReport,
    feedbackReport
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_FINAL, prompt);

  return generateReport<FinalReport>(
    SYSTEM_PROMPT_FINAL,
    prompt,
    FinalReportSchema,
    cacheKey
  );
}

/**
 * 모든 타입별 리포트 생성 (병렬 처리)
 */
export async function generateAllReports(
  records: Record[],
  date: string,
  dayOfWeek: string
): Promise<{
  summary_report: SummaryReport;
  daily_report: DailyReport | null;
  emotion_report: EmotionReport | null;
  dream_report: DreamReport | null;
  insight_report: InsightReport | null;
  feedback_report: FeedbackReport | null;
  final_report: FinalReport;
}> {
  // 1. 전체 요약 리포트 생성
  const summaryReport = await generateSummaryReport(records, date, dayOfWeek);

  // 2. 타입별 리포트 병렬 생성
  const [
    dailyReport,
    emotionReport,
    dreamReport,
    insightReport,
    feedbackReport,
  ] = await Promise.all([
    generateDailyReport(records, date, dayOfWeek),
    generateEmotionReport(records, date, dayOfWeek),
    generateDreamReport(records, date, dayOfWeek),
    generateInsightReport(records, date, dayOfWeek),
    generateFeedbackReport(records, date, dayOfWeek),
  ]);

  // 3. 최종 리포트 생성
  const finalReport = await generateFinalReport(
    date,
    dayOfWeek,
    summaryReport,
    dailyReport,
    emotionReport,
    dreamReport,
    insightReport,
    feedbackReport
  );

  return {
    summary_report: summaryReport,
    daily_report: dailyReport,
    emotion_report: emotionReport,
    dream_report: dreamReport,
    insight_report: insightReport,
    feedback_report: feedbackReport,
    final_report: finalReport,
  };
}

