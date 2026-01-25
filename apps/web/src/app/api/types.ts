/**
 * API 공통 타입 정의
 */

/**
 * JSON Schema 타입 (Gemini API용)
 */
export type JsonSchema = Record<string, unknown>;

/**
 * AI 리포트 생성 스키마 타입
 */
export type ReportSchema = {
  name: string;
  schema: JsonSchema;
  strict: boolean;
};

/**
 * 동적 스키마 생성 함수 타입
 */
export type SchemaGenerator = (isPro: boolean) => ReportSchema;

/**
 * 스키마 타입 (정적 또는 동적)
 */
export type Schema = ReportSchema | SchemaGenerator;

/**
 * AI Usage 확장 타입 (Gemini 및 OpenAI 호환)
 * Gemini API는 usageMetadata를 사용하며, OpenAI API는 usage를 사용 (하위 호환성)
 */
export interface ExtendedUsage {
  // OpenAI 형식
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
  // Gemini 형식
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

/**
 * 추적 정보 타입 (개발 환경용)
 */
export interface TrackingInfo {
  name: string;
  model: string;
  duration_ms: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens: number;
  };
}

/**
 * 추적 정보가 포함된 결과 타입
 */
export type WithTracking<T> = T & {
  __tracking?: TrackingInfo;
};

/**
 * API 에러 타입 (확장 가능)
 */
export interface ApiError extends Error {
  code?: string;
  status?: number;
  type?: string;
}

/**
 * 진행 상황 추적 콜백 타입
 */
export type ProgressCallback = (
  step: number,
  total: number,
  sectionName: string,
  tracking?: TrackingInfo
) => void;

