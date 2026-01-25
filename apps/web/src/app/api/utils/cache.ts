import crypto from "crypto";

// 입력 캐싱을 위한 인터페이스
interface CacheEntry<T> {
  result: T;
  timestamp: number;
}

// 캐시 저장소 (메모리 기반)
const cacheStore = new Map<string, CacheEntry<unknown>>();
// Daily/Weekly 피드백은 한 번 생성되면 변경되지 않으므로 캐시를 더 길게 설정
// 7일 (일주일)로 설정하여 메모리 효율성과 성능을 균형있게 유지
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7일 (밀리초)

/**
 * 캐시 키 생성 (시스템 프롬프트 + 사용자 프롬프트 기반)
 * 전체 입력(시스템 + 사용자)을 기반으로 고유한 캐시 키를 생성합니다.
 */
export function generateCacheKey(
  systemPrompt: string,
  userPrompt: string
): string {
  const combined = `${systemPrompt}|||${userPrompt}`;
  return crypto.createHash("sha256").update(combined).digest("hex");
}

/**
 * 캐시에서 결과 조회
 * 캐시에 저장된 결과가 있고 만료되지 않았다면 반환합니다.
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  // 캐시 만료 확인
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cacheStore.delete(key);
    return null;
  }

  return entry.result as T;
}

/**
 * 캐시에 결과 저장
 * 생성된 결과를 캐시에 저장하여 이후 동일한 요청 시 재사용할 수 있도록 합니다.
 */
export function setCache<T>(key: string, result: T): void {
  cacheStore.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * 프롬프트 캐시 키 생성 (하위 호환성 유지)
 * 시스템 프롬프트를 기반으로 고정된 캐시 키를 생성합니다.
 * 참고: OpenAI CachedInput을 위한 함수였으나, 현재는 Gemini를 사용하며 이 함수는 하위 호환성을 위해 유지됩니다.
 *
 * @param systemPrompt 시스템 프롬프트 (고정된 값)
 * @returns 프롬프트 캐시 키 (32자리 해시)
 */
export function generatePromptCacheKey(systemPrompt: string): string {
  return crypto
    .createHash("sha256")
    .update(systemPrompt)
    .digest("hex")
    .substring(0, 32); // OpenAI 권장 길이
}
