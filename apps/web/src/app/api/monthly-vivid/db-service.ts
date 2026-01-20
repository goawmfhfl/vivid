/**
 * db-service.ts - 역할별로 분리된 DB 서비스 함수들을 re-export
 *
 * 이 파일은 기존 import 경로를 유지하기 위한 re-export 파일입니다.
 * 실제 구현은 다음 파일들에 있습니다:
 * - daily-vivid-db.ts: Daily Vivid 관련 함수
 * - monthly-vivid-db.ts: Monthly Vivid 관련 함수
 * - weekly-vivid-db.ts: Weekly Vivid 관련 함수
 * - validation-helpers.ts: 검증 함수들
 */

// Daily Vivid 관련 함수
export { fetchDailyVividByMonth } from "./daily-vivid-db";

// Monthly Vivid 관련 함수
export {
  fetchMonthlyVividList,
  fetchMonthlyVividByMonth,
  fetchMonthlyVividDetail,
  saveMonthlyVivid,
} from "./monthly-vivid-db";

// Weekly Vivid 관련 함수
export { fetchWeeklyVividByMonth } from "./weekly-vivid-db";

// 검증 함수들
export { validateSectionData, validateAllSections } from "./validation-helpers";
