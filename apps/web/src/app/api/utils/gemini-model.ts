/**
 * 리포트(daily/weekly/monthly) 생성용 Gemini 모델 선택
 * - GEMINI_REPORT_MODEL=pro | flash (기본: flash)
 * - cron(persona, user-trends)는 항상 flash 사용
 */

export const GEMINI_MODELS = {
  pro: "gemini-3-pro-preview",
  flash: "gemini-3-flash-preview",
} as const;

/**
 * daily/weekly/monthly 리포트 생성 시 사용할 모델
 * env: GEMINI_REPORT_MODEL=pro | flash
 */
export function getReportModel(): (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS] {
  const env = process.env.GEMINI_REPORT_MODEL?.toLowerCase();
  return env === "pro" ? GEMINI_MODELS.pro : GEMINI_MODELS.flash;
}
