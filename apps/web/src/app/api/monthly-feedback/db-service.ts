/**
 * db-service.ts - 역할별로 분리된 DB 서비스 함수들을 re-export
 *
 * 이 파일은 기존 import 경로를 유지하기 위한 re-export 파일입니다.
 * 실제 구현은 다음 파일들에 있습니다:
 * - daily-feedback-db.ts: Daily Feedback 관련 함수
 * - monthly-feedback-db.ts: Monthly Feedback 관련 함수
 * - weekly-feedback-db.ts: Weekly Feedback 관련 함수
 * - validation-helpers.ts: 검증 함수들
 */

// Daily Feedback 관련 함수
export { fetchDailyFeedbacksByMonth } from "./daily-feedback-db";

// Monthly Feedback 관련 함수
export {
  fetchMonthlyFeedbackList,
  fetchMonthlyFeedbackByMonth,
  fetchMonthlyFeedbackDetail,
  saveMonthlyFeedback,
} from "./monthly-feedback-db";

// Weekly Feedback 관련 함수
export { fetchWeeklyFeedbacksByMonth } from "./weekly-feedback-db";

// 검증 함수들
export { validateSectionData, validateAllSections } from "./validation-helpers";
