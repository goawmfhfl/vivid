import OpenAI from "openai";
import {
  getWeeklyVividSchema,
  SYSTEM_PROMPT_VIVID,
  SYSTEM_PROMPT_WEEKLY_TREND,
  WeeklyTrendDataSchema,
} from "./schema";
import type { DailyVividForWeekly } from "./types";
import {
  buildWeeklyVividPrompt,
  buildWeeklyTitlePrompt,
  buildWeeklyTrendPrompt,
} from "./prompts";
import type { WeeklyVivid, WeeklyReport, WeeklyTrendData } from "@/types/weekly-vivid";
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

  const openai = getOpenAIClient();
  const promptCacheKey = generatePromptCacheKey(systemPrompt);

  // Weekly Vivid는 gpt-5.2를 사용하여 실패 없이 안정적으로 동작
  // Daily 점수 기반으로 정확도 향상 및 일관성 보정 역할
  const model = "gpt-5.2";

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
        const usage = extractUsageInfo(
          completion.usage as ExtendedUsage | undefined
        );
        if (usage) {
          logAIRequestAsync({
            userId,
            model,
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
    });
}

/**
 * Weekly Report 생성
 */
async function generateWeeklyReport(
  dailyVivid: DailyVividForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string,
  userName?: string
): Promise<WeeklyReport> {
  const prompt = buildWeeklyVividPrompt(dailyVivid, range, userName);
  const schema = getWeeklyVividSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, prompt);

  const response = await generateSection<{ report: WeeklyReport }>(
    SYSTEM_PROMPT_VIVID,
    prompt,
    {
      name: "WeeklyReportResponse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          report: schema.schema.properties.weekly_vivid.properties.report,
        },
        required: ["report"],
      },
      strict: true,
    },
    cacheKey,
    isPro,
    "report",
    userId
  );

  if (!response) {
    console.error("[generateWeeklyReport] response is null or undefined");
    throw new Error("Weekly report response is null or undefined");
  }

  // response가 직접 WeeklyReport인 경우 처리
  if (
    typeof response === "object" &&
    response !== null &&
    !Array.isArray(response) &&
    "weekly_vivid_summary" in response &&
    !("report" in response)
  ) {
    console.log(
      "[generateWeeklyReport] Response appears to be WeeklyReport directly, using it"
    );
    return response as WeeklyReport;
  }

  if (!response.report) {
    console.error("[generateWeeklyReport] response.report is missing", {
      response,
      responseKeys: Object.keys(response || {}),
      responseType: typeof response,
      responseValues: Object.values(response || {}),
      responseStringified: JSON.stringify(response, null, 2),
    });
    throw new Error("Weekly report data is missing from response");
  }

  console.log(
    "[generateWeeklyReport] report 추출 완료:",
    !!response.report
  );
  return response.report;
}



/**
 * 주간 비비드 제목 생성
 */
async function generateWeeklyTitle(
  report: WeeklyReport,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string,
  userName?: string
): Promise<string> {
  const prompt = buildWeeklyTitlePrompt(report, range, userName);
  const cacheKey = generateCacheKey("weekly_title", prompt);

  try {
    const response = await generateSection<{ title: string }>(
      "당신은 주간 비비드를 분석하여 간결하고 명확한 제목을 생성하는 전문가입니다.",
      prompt,
      {
        name: "WeeklyTitleResponse",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: {
              type: "string",
              minLength: 5,
              maxLength: 50,
              description: '"~ 했던 주" 형식의 주간 비비드 제목',
            },
          },
          required: ["title"],
        },
        strict: true,
      },
      cacheKey,
      isPro,
      "weekly_title",
      userId
    );

    if (!response || !response.title) {
      // 기본 제목 반환
      return `${range.start} ~ ${range.end} 주간`;
    }

    return response.title;
  } catch (error) {
    console.error("[generateWeeklyTitle] 제목 생성 실패:", error);
    // 기본 제목 반환
    return `${range.start} ~ ${range.end} 주간`;
  }
}

/**
 * 주간 흐름 데이터(trend) 생성
 */
async function generateWeeklyTrend(
  report: WeeklyReport,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string,
  userName?: string
): Promise<WeeklyTrendData | null> {
  const prompt = buildWeeklyTrendPrompt(report, range, userName);
  const cacheKey = generateCacheKey("weekly_trend", prompt);

  try {
    const response = await generateSection<WeeklyTrendData>(
      SYSTEM_PROMPT_WEEKLY_TREND,
      prompt,
      WeeklyTrendDataSchema,
      cacheKey,
      isPro,
      "weekly_trend",
      userId
    );

    if (!response || !response.direction || !response.core_value || !response.driving_force || !response.current_self) {
      console.error("[generateWeeklyTrend] trend 데이터 생성 실패: 필수 필드 누락");
      return null;
    }

    return response;
  } catch (error) {
    console.error("[generateWeeklyTrend] trend 생성 실패:", error);
    return null;
  }
}

/**
 * Daily Vivid 배열을 기반으로 주간 비비드 생성 (report와 title 생성)
 */
export async function generateWeeklyVividFromDailyWithProgress(
  dailyVivid: DailyVividForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean = false,
  userId?: string,
  userName?: string
): Promise<WeeklyVivid> {
  // report AI로 생성
  const report = await generateWeeklyReport(
    dailyVivid,
    range,
    isPro,
    userId,
    userName
  );

  // report를 바탕으로 title 생성
  const title = await generateWeeklyTitle(
    report,
    range,
    isPro,
    userId,
    userName
  );

  // report를 바탕으로 trend 생성
  const trend = await generateWeeklyTrend(
    report,
    range,
    isPro,
    userId,
    userName
  );

  // 최종 Weekly Vivid 조합
  const weeklyVivid: WeeklyVivid = {
    week_range: range,
    report,
    title,
    trend: trend || null,
    is_ai_generated: true,
  };

  return weeklyVivid;
}
