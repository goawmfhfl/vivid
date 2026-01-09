import OpenAI from "openai";
import {
  getWeeklyFeedbackSchema,
  SYSTEM_PROMPT_VIVID,
  SYSTEM_PROMPT_CLOSING,
} from "./schema";
import type { DailyFeedbackForWeekly } from "./types";
import {
  buildVividPrompt,
  buildClosingPrompt,
} from "./prompts";
import type {
  WeeklyFeedback,
  VividReport,
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
 * Vivid Report 생성
 */
async function generateVividReport(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean,
  userId?: string,
  userName?: string
): Promise<VividReport> {
  const prompt = buildVividPrompt(dailyFeedbacks, range, userName);
  const schema = getWeeklyFeedbackSchema(isPro);
  const cacheKey = generateCacheKey(SYSTEM_PROMPT_VIVID, prompt);

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
 * Closing Report 생성 (사용되지 않음 - 기본값 사용)
 */
async function _generateClosingReport(
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
    "closing_report",
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
 * Daily Feedback 배열을 기반으로 주간 피드백 생성 (vivid_report만 AI 생성)
 */
export async function generateWeeklyFeedbackFromDailyWithProgress(
  dailyFeedbacks: DailyFeedbackForWeekly,
  range: { start: string; end: string; timezone: string },
  isPro: boolean = false,
  userId?: string,
  userName?: string
): Promise<WeeklyFeedback> {
  // vivid_report만 AI로 생성
  const vividReport = await generateVividReport(
    dailyFeedbacks,
    range,
    isPro,
    userId,
    userName
  );


  // closing_report는 기본값으로 설정 (AI 요청하지 않음)
  const closingReport = createDefaultClosingReport();

  // 최종 Weekly Feedback 조합
  const weeklyFeedback: WeeklyFeedback = {
    week_range: range,
    vivid_report: vividReport,
    closing_report: closingReport,
    is_ai_generated: true,
  };

  return weeklyFeedback;
}
