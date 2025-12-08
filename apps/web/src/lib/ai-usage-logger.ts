import { getServiceSupabase } from "./supabase-service";
import type { ExtendedUsage } from "@/app/api/types";

/**
 * 모델별 토큰 가격 (USD per 1M tokens)
 * 참고: https://openai.com/api/pricing/
 */
const PRICING: Record<
  string,
  { input: number; inputCached: number; output: number }
> = {
  "gpt-5-mini": { input: 0.25, inputCached: 0.25, output: 2.0 },
  "gpt-5-nano": { input: 0.15, inputCached: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10.0, inputCached: 10.0, output: 30.0 },
  "gpt-4": { input: 30.0, inputCached: 30.0, output: 60.0 },
  "gpt-3.5-turbo": { input: 0.5, inputCached: 0.5, output: 1.5 },
};

const USD_TO_KRW = 1350; // 기본 환율

/**
 * AI 사용량 정보 타입
 */
export interface AIUsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens?: number;
}

/**
 * 비용 계산 결과 타입
 */
interface CostCalculation {
  cost_usd: number;
  cost_krw: number;
}

/**
 * AI 요청 로깅 파라미터 타입
 */
export interface LogAIRequestParams {
  userId: string;
  model: string;
  requestType: "daily_feedback" | "weekly_feedback" | "monthly_feedback";
  sectionName: string | null;
  usage: AIUsageInfo;
  duration_ms: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * 비용 계산 함수
 */
function calculateCost(model: string, usage: AIUsageInfo): CostCalculation {
  const modelPricing = PRICING[model] || PRICING["gpt-5-nano"];

  // 캐시된 토큰과 캐시되지 않은 토큰 구분
  const cachedTokens = usage.cached_tokens || 0;
  const nonCachedTokens = usage.prompt_tokens - cachedTokens;

  // 캐시된 입력과 캐시되지 않은 입력 비용 계산
  const cachedInputCost = cachedTokens * (modelPricing.inputCached / 1_000_000);
  const nonCachedInputCost = nonCachedTokens * (modelPricing.input / 1_000_000);
  const inputCost = cachedInputCost + nonCachedInputCost;

  const outputCost =
    usage.completion_tokens * (modelPricing.output / 1_000_000);
  const totalCostUSD = inputCost + outputCost;

  return {
    cost_usd: totalCostUSD,
    cost_krw: totalCostUSD * USD_TO_KRW,
  };
}

/**
 * OpenAI completion 응답에서 사용량 정보 추출
 */
export function extractUsageInfo(
  usage: ExtendedUsage | undefined
): AIUsageInfo | null {
  if (!usage) return null;

  const cachedTokens =
    (usage as any)?.prompt_tokens_details?.cached_tokens || 0;

  return {
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0,
    cached_tokens: cachedTokens,
  };
}

/**
 * AI 사용량을 데이터베이스에 로깅하는 함수
 *
 * @param params 로깅 파라미터
 * @returns 성공 여부
 */
export async function logAIRequest(
  params: LogAIRequestParams
): Promise<boolean> {
  try {
    const {
      userId,
      model,
      requestType,
      sectionName,
      usage,
      duration_ms,
      success,
      errorMessage,
    } = params;

    // 비용 계산
    const cost = calculateCost(model, usage);

    const supabase = getServiceSupabase();

    // ai_requests 테이블에 삽입
    const { error } = await supabase.from("ai_requests").insert({
      user_id: userId,
      model,
      request_type: requestType,
      section_name: sectionName,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      cached_tokens: usage.cached_tokens || 0,
      total_tokens: usage.total_tokens,
      cost_usd: cost.cost_usd,
      cost_krw: cost.cost_krw,
      duration_ms,
      success,
      error_message: errorMessage || null,
    });

    if (error) {
      console.error("AI 사용량 로깅 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("AI 사용량 로깅 중 예외 발생:", error);
    return false;
  }
}

/**
 * 비동기로 AI 사용량을 로깅하는 함수 (에러를 무시하고 백그라운드에서 실행)
 * AI 호출 성능에 영향을 주지 않기 위해 사용
 */
export function logAIRequestAsync(params: LogAIRequestParams): void {
  // Promise를 생성하지만 await하지 않음
  logAIRequest(params).catch((error) => {
    // 에러는 로깅만 하고 무시
    console.error("AI 사용량 비동기 로깅 실패:", error);
  });
}
