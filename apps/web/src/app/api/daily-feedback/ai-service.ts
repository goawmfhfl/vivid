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
  getSummaryReportSchema,
  getDailyReportSchema,
  EmotionReportSchema,
  DreamReportSchema,
  InsightReportSchema,
  getFeedbackReportSchema,
  FinalReportSchema,
  SYSTEM_PROMPT_SUMMARY,
  SYSTEM_PROMPT_DAILY,
  SYSTEM_PROMPT_EMOTION,
  SYSTEM_PROMPT_DREAM,
  SYSTEM_PROMPT_INSIGHT,
  SYSTEM_PROMPT_FEEDBACK,
  SYSTEM_PROMPT_FINAL,
} from "./schema";
import {
  buildSummaryPrompt,
  buildDailyPrompt,
  buildEmotionPrompt,
  buildDreamPrompt,
  buildInsightPrompt,
  buildFeedbackPrompt,
  buildFinalPrompt,
} from "./prompts";
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
    timeout: 300000, // 300초(5분) 타임아웃
    maxRetries: 0, // 재시도 최소화
  });
}

/**
 * AI 리포트 생성 헬퍼 함수
 * @param isPro Pro 멤버십 여부에 따라 모델과 프롬프트를 차별화
 * @param getSchema 멤버십별 스키마를 반환하는 함수 (동적 스키마 생성용)
 */
async function generateReport<T>(
  systemPrompt: string,
  userPrompt: string,
  schema:
    | { name: string; schema: any; strict: boolean }
    | ((isPro: boolean) => { name: string; schema: any; strict: boolean }),
  cacheKey: string,
  isPro: boolean = false
): Promise<T> {
  // 스키마가 함수인 경우 멤버십별로 동적 생성
  const finalSchema = typeof schema === "function" ? schema(isPro) : schema;
  // 캐시에서 조회 (멤버십별로 캐시 키 구분)
  const proCacheKey = isPro ? `${cacheKey}_pro` : cacheKey;
  const cachedResult = getFromCache<T>(proCacheKey);

  if (cachedResult) {
    console.log(`캐시에서 결과 반환 (${finalSchema.name}, Pro: ${isPro})`);
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
          name: finalSchema.name,
          schema: finalSchema.schema,
          strict: finalSchema.strict,
        },
      },
      prompt_cache_key: promptCacheKey,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`No content from OpenAI (${finalSchema.name})`);
    }

    let result = JSON.parse(content) as T;

    // 무료 멤버십인 경우 Pro 전용 필드를 null로 설정
    if (!isPro && result && typeof result === "object") {
      result = {
        ...result,
        // SummaryReport의 Pro 전용 필드
        ...("trend_analysis" in result && { trend_analysis: null }),
        // DailyReport의 Pro 전용 필드
        ...("emotion_triggers" in result && { emotion_triggers: null }),
        ...("behavioral_clues" in result && { behavioral_clues: null }),
        // EmotionReport의 Pro 전용 필드
        ...("ai_mood_valence" in result && { ai_mood_valence: null }),
        ...("ai_mood_arousal" in result && { ai_mood_arousal: null }),
        ...("emotion_events" in result && { emotion_events: null }),
        // DreamReport의 Pro 전용 필드
        ...("dream_goals" in result && { dream_goals: null }),
        ...("dreamer_traits" in result && { dreamer_traits: null }),
        // InsightReport의 Pro 전용 필드
        ...("meta_question" in result && { meta_question: null }),
        ...("insight_next_actions" in result && { insight_next_actions: null }),
        // FeedbackReport의 Pro 전용 필드
        ...("ai_message" in result && { ai_message: null }),
        ...("feedback_person_traits" in result && {
          feedback_person_traits: null,
        }),
        // FinalReport의 Pro 전용 필드
        ...("tomorrow_focus" in result && { tomorrow_focus: null }),
        ...("growth_points" in result && { growth_points: null }),
        ...("adjustment_points" in result && { adjustment_points: null }),
      } as T;
    }

    // 캐시에 저장 (멤버십별로 구분)
    setCache(proCacheKey, result);

    return result;
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * 전체 요약 리포트 생성
 */
export async function generateSummaryReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): Promise<SummaryReport> {
  const prompt = buildSummaryPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_SUMMARY, prompt);

  return generateReport<SummaryReport>(
    SYSTEM_PROMPT_SUMMARY,
    prompt,
    (isPro) => getSummaryReportSchema(isPro),
    cacheKey,
    isPro
  );
}

/**
 * 일상 기록 리포트 생성
 */
export async function generateDailyReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): Promise<DailyReport | null> {
  const dailyRecords = records.filter((r) => r.type === "daily");

  if (dailyRecords.length === 0) {
    return null;
  }

  console.log(`[Daily Report] Found ${dailyRecords.length} daily records`);

  const prompt = buildDailyPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DAILY, prompt);

  return generateReport<DailyReport>(
    SYSTEM_PROMPT_DAILY,
    prompt,
    (isPro) => getDailyReportSchema(isPro),
    cacheKey,
    isPro
  );
}

/**
 * 감정 기록 리포트 생성
 */
export async function generateEmotionReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): Promise<EmotionReport | null> {
  const emotionRecords = records.filter((r) => r.type === "emotion");

  if (emotionRecords.length === 0) {
    return null;
  }

  const prompt = buildEmotionPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_EMOTION, prompt);

  return generateReport<EmotionReport>(
    SYSTEM_PROMPT_EMOTION,
    prompt,
    EmotionReportSchema,
    cacheKey,
    isPro
  );
}

/**
 * 꿈/목표 기록 리포트 생성
 */
export async function generateDreamReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): Promise<DreamReport | null> {
  const dreamRecords = records.filter((r) => r.type === "dream");

  if (dreamRecords.length === 0) {
    return null;
  }

  const prompt = buildDreamPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_DREAM, prompt);

  return generateReport<DreamReport>(
    SYSTEM_PROMPT_DREAM,
    prompt,
    DreamReportSchema,
    cacheKey,
    isPro
  );
}

/**
 * 인사이트 기록 리포트 생성
 */
export async function generateInsightReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): Promise<InsightReport | null> {
  const insightRecords = records.filter((r) => r.type === "insight");

  if (insightRecords.length === 0) {
    return null;
  }

  const prompt = buildInsightPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_INSIGHT, prompt);

  return generateReport<InsightReport>(
    SYSTEM_PROMPT_INSIGHT,
    prompt,
    InsightReportSchema,
    cacheKey,
    isPro
  );
}

/**
 * 피드백 기록 리포트 생성
 */
export async function generateFeedbackReport(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
): Promise<FeedbackReport | null> {
  const feedbackRecords = records.filter((r) => r.type === "feedback");

  if (feedbackRecords.length === 0) {
    return null;
  }

  const prompt = buildFeedbackPrompt(records, date, dayOfWeek, isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_FEEDBACK, prompt);

  return generateReport<FeedbackReport>(
    SYSTEM_PROMPT_FEEDBACK,
    prompt,
    getFeedbackReportSchema(isPro),
    cacheKey,
    isPro
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
  feedbackReport: FeedbackReport | null,
  isPro: boolean = false
): Promise<FinalReport> {
  const prompt = buildFinalPrompt(
    date,
    dayOfWeek,
    summaryReport,
    dailyReport,
    emotionReport,
    dreamReport,
    insightReport,
    feedbackReport,
    isPro
  );
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_FINAL, prompt);

  return generateReport<FinalReport>(
    SYSTEM_PROMPT_FINAL,
    prompt,
    FinalReportSchema,
    cacheKey,
    isPro
  );
}

/**
 * 모든 타입별 리포트 생성 (순차 처리)
 * 병렬 요청은 rate limiting 및 retry 에러를 유발할 수 있으므로 순차 처리로 변경
 * @param isPro Pro 멤버십 여부에 따라 모델과 프롬프트 차별화
 */
export async function generateAllReports(
  records: Record[],
  date: string,
  dayOfWeek: string,
  isPro: boolean = false
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
  const summaryReport = await generateSummaryReport(
    records,
    date,
    dayOfWeek,
    isPro
  );

  // 2. 타입별 리포트 순차 생성 (병렬 요청 제거)
  // 병렬 요청은 rate limiting 및 retry 에러를 유발할 수 있으므로 순차 처리로 변경
  const dailyReport = await generateDailyReport(
    records,
    date,
    dayOfWeek,
    isPro
  );
  const emotionReport = await generateEmotionReport(
    records,
    date,
    dayOfWeek,
    isPro
  );
  const dreamReport = await generateDreamReport(
    records,
    date,
    dayOfWeek,
    isPro
  );
  const insightReport = await generateInsightReport(
    records,
    date,
    dayOfWeek,
    isPro
  );
  const feedbackReport = await generateFeedbackReport(
    records,
    date,
    dayOfWeek,
    isPro
  );

  // 3. 최종 리포트 생성
  const finalReport = await generateFinalReport(
    date,
    dayOfWeek,
    summaryReport,
    dailyReport,
    emotionReport,
    dreamReport,
    insightReport,
    feedbackReport,
    isPro
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
