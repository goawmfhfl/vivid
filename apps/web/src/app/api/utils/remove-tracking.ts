/**
 * AI 생성 결과에 포함된 __tracking(사용량/디버깅 메타데이터) 제거
 * DB 저장 전에 호출하여 불필요한 메타데이터가 저장되지 않도록 함
 */

/** 객체에서 재귀적으로 __tracking 제거 */
export function removeTrackingFromObject<T extends Record<string, unknown>>(
  obj: T
): T {
  if (!obj || typeof obj !== "object") return obj;

  const cleaned = { ...obj } as Record<string, unknown>;

  if ("__tracking" in cleaned) {
    delete cleaned.__tracking;
  }

  for (const key in cleaned) {
    const val = cleaned[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      cleaned[key] = removeTrackingFromObject(val as Record<string, unknown>);
    } else if (Array.isArray(val)) {
      cleaned[key] = val.map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return removeTrackingFromObject(item as Record<string, unknown>);
        }
        return item;
      });
    }
  }

  return cleaned as T;
}
