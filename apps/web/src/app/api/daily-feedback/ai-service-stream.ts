import OpenAI from "openai";
import {
  getSummaryReportSchema,
  getDailyReportSchema,
  EmotionReportSchema,
  DreamReportSchema,
  InsightReportSchema,
  getFeedbackReportSchema,
  getFinalReportSchema,
  SYSTEM_PROMPT_SUMMARY,
  SYSTEM_PROMPT_DAILY,
  SYSTEM_PROMPT_EMOTION,
  SYSTEM_PROMPT_DREAM,
  SYSTEM_PROMPT_INSIGHT,
  SYSTEM_PROMPT_FEEDBACK,
  SYSTEM_PROMPT_FINAL,
} from "./schema";
import type { Record } from "./types";
import {
  buildSummaryPrompt,
  buildDailyPrompt,
  buildEmotionPrompt,
  buildDreamPrompt,
  buildInsightPrompt,
  buildFeedbackPrompt,
  buildFinalPrompt,
} from "./prompts";
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
  generateCacheKey,
  getFromCache,
  setCache,
  generatePromptCacheKey,
} from "../utils/cache";
import type {
  Schema,
  ReportSchema,
  ExtendedUsage,
  TrackingInfo,
  WithTracking,
  ApiError,
  ProgressCallback as ProgressCallbackType,
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
type ProgressCallback = ProgressCallbackType;

/**
 * Section 생성 헬퍼 함수 (진행 상황 추적 포함)
 */
async function generateSection<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: Schema,
  cacheKey: string,
  isPro: boolean,
  sectionName: string,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<T> {
  // 진행 상황 알림 (섹션 시작)
  const schemaObj: ReportSchema =
    typeof schema === "function" ? schema(isPro) : schema;
  progressCallback?.(0, 0, sectionName);

  // 캐시에서 조회 (멤버십별로 캐시 키 구분)
  const proCacheKey = isPro ? `${cacheKey}_pro` : cacheKey;
  const cachedResult = getFromCache<T>(proCacheKey);
  if (cachedResult) {
    console.log(`캐시에서 결과 반환 (${schemaObj.name}, Pro: ${isPro})`);
    // 캐시된 경우에도 진행 상황 알림 (이미 완료된 것으로 간주)
    return cachedResult;
  }

  const openai = getOpenAIClient();
  const promptCacheKey = generatePromptCacheKey(systemPrompt);

  // Daily Feedback: gpt-5-nano 모델만 사용
  // - 감정 분석, 목표 실행 체크 등 1차 점수 산출
  // - 최소한의 비용으로 빠르게 처리
  // - 점수 범위 및 규칙만 준수
  // - 다른 모델로 승격 요청 금지
  const model = "gpt-5-nano";

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
 * 전체 요약 리포트 생성
 */
async function generateSummaryReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<SummaryReport> {
  const prompt = buildSummaryPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_SUMMARY, prompt);

  return generateSection<SummaryReport>(
    SYSTEM_PROMPT_SUMMARY,
    prompt,
    (isPro) => getSummaryReportSchema(isPro),
    cacheKey,
    isPro,
    "summary_report",
    progressCallback,
    userId
  );
}

/**
 * 일상 기록 리포트 생성
 */
async function generateDailyReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<DailyReport | null> {
  const dailyRecords = records.filter((r) => r.type === "daily");

  if (dailyRecords.length === 0) {
    return null;
  }

  const prompt = buildDailyPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DAILY, prompt);

  return generateSection<DailyReport>(
    SYSTEM_PROMPT_DAILY,
    prompt,
    (isPro) => getDailyReportSchema(isPro),
    cacheKey,
    isPro,
    "daily_report",
    progressCallback,
    userId
  );
}

/**
 * 감정 기록 리포트 생성
 */
async function generateEmotionReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
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
    progressCallback,
    userId
  );
}

/**
 * 꿈/목표 기록 리포트 생성
 */
async function generateDreamReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<DreamReport | null> {
  const dreamRecords = records.filter((r) => r.type === "dream");

  if (dreamRecords.length === 0) {
    return null;
  }

  const prompt = buildDreamPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DREAM, prompt);

  return generateSection<DreamReport>(
    SYSTEM_PROMPT_DREAM,
    prompt,
    DreamReportSchema,
    cacheKey,
    isPro,
    "dream_report",
    progressCallback,
    userId
  );
}

/**
 * 인사이트 기록 리포트 생성
 */
async function generateInsightReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<InsightReport | null> {
  const insightRecords = records.filter((r) => r.type === "insight");

  if (insightRecords.length === 0) {
    return null;
  }

  const prompt = buildInsightPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_INSIGHT, prompt);

  return generateSection<InsightReport>(
    SYSTEM_PROMPT_INSIGHT,
    prompt,
    InsightReportSchema,
    cacheKey,
    isPro,
    "insight_report",
    progressCallback,
    userId
  );
}

/**
 * 피드백 기록 리포트 생성
 */
async function generateFeedbackReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<FeedbackReport | null> {
  const feedbackRecords = records.filter((r) => r.type === "feedback");

  if (feedbackRecords.length === 0) {
    return null;
  }

  const prompt = buildFeedbackPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_FEEDBACK, prompt);

  return generateSection<FeedbackReport>(
    SYSTEM_PROMPT_FEEDBACK,
    prompt,
    (isPro) => getFeedbackReportSchema(isPro),
    cacheKey,
    isPro,
    "feedback_report",
    progressCallback,
    userId
  );
}

/**
 * 최종 리포트 생성 (모든 리포트를 종합)
 */
async function generateFinalReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<FinalReport> {
  const prompt = buildFinalPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_FINAL, prompt);

  // 스키마 객체를 명시적으로 생성하여 전달
  const schema = getFinalReportSchema(isPro);

  return generateSection<FinalReport>(
    SYSTEM_PROMPT_FINAL,
    prompt,
    schema,
    cacheKey,
    isPro,
    "final_report",
    progressCallback,
    userId
  );
}

/**
 * 모든 타입별 리포트 생성 (진행 상황 콜백 포함)
 */
export async function generateAllReportsWithProgress(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false,
  progressCallback?: ProgressCallback,
  userId?: string
): Promise<{
  summary_report: SummaryReport;
  daily_report: DailyReport | null;
  emotion_report: EmotionReport | null;
  dream_report: DreamReport | null;
  insight_report: InsightReport | null;
  feedback_report: FeedbackReport | null;
  final_report: FinalReport;
}> {
  const sectionNames = [
    "SummaryReport",
    "DailyReport",
    "EmotionReport",
    "DreamReport",
    "InsightReport",
    "FeedbackReport",
    "FinalReport",
  ];
  const totalSections = sectionNames.length;
  let completedSections = 0;

  const callProgress = (sectionName: string, tracking?: TrackingInfo) => {
    completedSections++;
    progressCallback?.(completedSections, totalSections, sectionName, tracking);
  };

  // 1. 전체 요약 리포트 생성
  const summaryReport = await generateSummaryReport(
    records,
    date,
    dayOfWeek,
    isPro,
    (c, t, n, tr) => callProgress(n, tr),
    userId
  );

  // 2. 타입별 리포트 순차 생성
  const dailyReport = await generateDailyReport(
    records,
    date,
    dayOfWeek,
    isPro,
    (c, t, n, tr) => callProgress(n, tr),
    userId
  );
  const emotionReport = await generateEmotionReport(
    records,
    date,
    dayOfWeek,
    isPro,
    (c, t, n, tr) => callProgress(n, tr),
    userId
  );
  const dreamReport = await generateDreamReport(
    records,
    date,
    dayOfWeek,
    isPro,
    (c, t, n, tr) => callProgress(n, tr),
    userId
  );
  const insightReport = await generateInsightReport(
    records,
    date,
    dayOfWeek,
    isPro,
    (c, t, n, tr) => callProgress(n, tr),
    userId
  );
  const feedbackReport = await generateFeedbackReport(
    records,
    date,
    dayOfWeek,
    isPro,
    (c, t, n, tr) => callProgress(n, tr),
    userId
  );

  // 3. 최종 리포트 생성 (records 기반)
  const finalReport = await generateFinalReport(
    records,
    date,
    dayOfWeek,
    isPro,
    (c, t, n, tr) => callProgress(n, tr),
    userId
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
