import type { DailyReportData } from "./types";
import type { DailyVividRow, Report } from "@/types/daily-vivid";

/**
 * jsonb 구조의 DailyVividRow를 평면 구조의 DailyReportData로 변환
 * 통합 report 구조를 사용
 */
export function mapDailyVividRowToReport(
  row: DailyVividRow
): DailyReportData {
  // Report에서 데이터 추출
  const report: Report | null = row.report;
  // 오늘의 VIVID (현재 모습)
  const currentSummary = report?.current_summary ?? "";
  const currentEvaluation = report?.current_evaluation ?? "";
  const currentKeywords = report?.current_keywords ?? [];
  // 앞으로의 나의 모습 (미래 비전)
  const futureSummary = report?.future_summary ?? "";
  const futureEvaluation = report?.future_evaluation ?? "";
  const futureKeywords = report?.future_keywords ?? [];
  // 일치도 분석
  const alignmentScore = report?.alignment_score ?? null;
  const alignmentScoreReason = report?.alignment_score_reason ?? [];
  // 사용자 특성 분석
  const userCharacteristics = report?.user_characteristics ?? [];
  const aspiredTraits = report?.aspired_traits ?? [];
  
  // 하위 호환성을 위한 레거시 필드 매핑
  const visionSummary = currentSummary || futureSummary || "";
  const visionSelf = currentEvaluation || "";
  const visionKeywords = [...currentKeywords, ...futureKeywords];
  const visionAiFeedback: string[] = [];
  const dreamGoals = null;
  const dreamerTraits = null;

  // narrative_summary는 report의 current_summary를 사용
  const narrativeSummary = currentSummary || futureSummary;

  return {
    date: row.report_date,
    dayOfWeek: row.day_of_week ?? "",
    narrative_summary: narrativeSummary,

    // Report 데이터
    current_summary: currentSummary,
    current_evaluation: currentEvaluation,
    current_keywords: currentKeywords,
    future_summary: futureSummary,
    future_evaluation: futureEvaluation,
    future_keywords: futureKeywords,
    alignment_score: alignmentScore,
    alignment_score_reason: alignmentScoreReason,
    user_characteristics: userCharacteristics,
    aspired_traits: aspiredTraits,
    
    // 하위 호환성을 위한 레거시 필드
    vision_summary: visionSummary,
    vision_self: visionSelf,
    vision_keywords: visionKeywords,
    vision_ai_feedback: visionAiFeedback,
    dream_goals: dreamGoals,
    dreamer_traits: dreamerTraits,
  };
}
