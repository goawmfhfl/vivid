"use client";

import { create } from "zustand";

export interface AIRequestInfo {
  id: string;
  name: string; // 요청 식별자 (예: "SummaryReport", "EmotionAnalysis" 등)
  model: string;
  startTime: number;
  endTime?: number;
  duration_ms?: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens?: number; // 캐시된 입력 토큰 수
  };
  cost?: {
    input_cost_usd: number;
    output_cost_usd: number;
    total_cost_usd: number;
    input_cost_krw: number;
    output_cost_krw: number;
    total_cost_krw: number;
    cached_input_cost_usd?: number; // 캐시된 입력 비용
    non_cached_input_cost_usd?: number; // 캐시되지 않은 입력 비용
  };
  error?: string;
}

interface AIRequestStore {
  requests: AIRequestInfo[];
  isOpen: boolean;
  addRequest: (request: Omit<AIRequestInfo, "id" | "startTime">) => string;
  updateRequest: (
    id: string,
    updates: Partial<Omit<AIRequestInfo, "id" | "name" | "startTime">>
  ) => void;
  openModal: () => void;
  closeModal: () => void;
  clearRequests: () => void;
}

// 모델별 토큰 가격 (USD per 1M tokens)
// 참고: OpenAI 모델은 더 이상 사용하지 않지만 하위 호환성을 위해 주석 처리로 유지
const PRICING: Record<
  string,
  { input: number; inputCached: number; output: number }
> = {
  // OpenAI 모델 (더 이상 사용하지 않음, 하위 호환성 유지)
  // "gpt-5-mini": { input: 0.25, inputCached: 0.25, output: 2.0 },
  // "gpt-5-nano": { input: 0.15, inputCached: 0.15, output: 0.6 },
  // "gpt-4-turbo": { input: 10.0, inputCached: 10.0, output: 30.0 },
  // "gpt-4": { input: 30.0, inputCached: 30.0, output: 60.0 },
  // "gpt-3.5-turbo": { input: 0.5, inputCached: 0.5, output: 1.5 },
  
  // Gemini 모델 가격 (현재 사용 중)
  "gemini-2.0-flash": { input: 0.075, inputCached: 0.075, output: 0.3 },
  "gemini-2.0-flash-exp": { input: 0.075, inputCached: 0.075, output: 0.3 },
  "gemini-3-flash-preview": { input: 0.075, inputCached: 0.075, output: 0.3 },
  "gemini-3.0-flash": { input: 0.075, inputCached: 0.075, output: 0.3 },
  "gemini-1.5-flash": { input: 0.075, inputCached: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 1.25, inputCached: 0.625, output: 5.0 },
};

const USD_TO_KRW = 1350; // 기본 환율

function calculateCost(
  model: string,
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    cached_tokens?: number;
  }
) {
  if (!usage) return undefined;

  const modelPricing = PRICING[model] || PRICING["gemini-3-flash-preview"];

  // 캐시된 토큰과 캐시되지 않은 토큰 구분
  const cachedTokens = usage.cached_tokens || 0;
  const nonCachedTokens = usage.prompt_tokens - cachedTokens;

  // Gemini 모델은 캐시 토큰 정보를 제공하지 않으므로 항상 0으로 처리
  // 하위 호환성을 위해 OpenAI 형식도 지원
  const cachedInputCost = cachedTokens * (modelPricing.inputCached / 1_000_000);
  const nonCachedInputCost = nonCachedTokens * (modelPricing.input / 1_000_000);
  const inputCost = cachedInputCost + nonCachedInputCost;

  const outputCost =
    usage.completion_tokens * (modelPricing.output / 1_000_000);
  const totalCost = inputCost + outputCost;

  return {
    input_cost_usd: inputCost,
    output_cost_usd: outputCost,
    total_cost_usd: totalCost,
    input_cost_krw: inputCost * USD_TO_KRW,
    output_cost_krw: outputCost * USD_TO_KRW,
    total_cost_krw: totalCost * USD_TO_KRW,
    cached_input_cost_usd: cachedInputCost,
    non_cached_input_cost_usd: nonCachedInputCost,
  };
}

export const useAIRequestStore = create<AIRequestStore>((set) => ({
  requests: [],
  isOpen: false,

  addRequest: (request) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    set((state) => ({
      requests: [
        ...state.requests,
        {
          ...request,
          id,
          startTime,
        },
      ],
    }));

    return id;
  },

  updateRequest: (id, updates) => {
    set((state) => {
      const request = state.requests.find((r) => r.id === id);
      if (!request) return state;

      const endTime = updates.endTime || Date.now();
      const duration_ms = endTime - request.startTime;

      // 비용 계산
      let cost = updates.cost;
      if (!cost && updates.usage && request.model) {
        cost = calculateCost(request.model, updates.usage);
      }

      const updatedRequest: AIRequestInfo = {
        ...request,
        ...updates,
        endTime,
        duration_ms,
        cost: cost || request.cost,
      };

      const newRequests = state.requests.map((r) =>
        r.id === id ? updatedRequest : r
      );

      // 모든 요청이 완료되었는지 확인
      const allCompleted = newRequests.every(
        (r) => r.endTime !== undefined || r.error !== undefined
      );

      return {
        requests: newRequests,
        // 모든 요청이 완료되면 자동으로 모달 열기 (테스트 환경에서만)
        isOpen: allCompleted && newRequests.length > 0 ? true : state.isOpen,
      };
    });
  },

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  clearRequests: () => set({ requests: [], isOpen: false }),
}));
