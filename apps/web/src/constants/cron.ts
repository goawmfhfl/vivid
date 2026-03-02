/**
 * Cron 배치/동시성 설정 상수
 * - URL searchParams로 런타임 오버라이드 가능
 * - process.env 오버라이드는 제거 (상수로 일원화)
 */
export const CRON_BATCH = {
  WEEKLY_REPORT: 10,
  MONTHLY_REPORT: 5,
  USER_TRENDS_WEEKLY: 5,
  USER_TRENDS_MONTHLY: 5,
} as const;

export const CRON_CONCURRENCY = {
  WEEKLY_REPORT: 1,
  MONTHLY_REPORT: 1,
  USER_TRENDS_WEEKLY: 2,
  USER_TRENDS_MONTHLY: 2,
} as const;
