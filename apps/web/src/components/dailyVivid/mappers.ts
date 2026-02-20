import type { DailyReportData } from "./types";
import type { DailyVividRow, Report, ReviewReport } from "@/types/daily-vivid";
import { getDailyVividType, isReviewReport } from "@/types/daily-vivid";

/**
 * jsonb 구조의 DailyVividRow를 평면 구조의 DailyReportData로 변환
 * Report(vivid) 또는 ReviewReport(review) 지원
 */
export function mapDailyVividRowToReport(
  row: DailyVividRow
): DailyReportData {
  const report = row.report;
  const rowType = getDailyVividType(row);
  const isReview = rowType === "review" || isReviewReport(report);
  const r = report as Report | ReviewReport | null;

  // vivid 필드: Report 또는 병합된 report에서 (꿈 일치도=vivid)
  const currentSummary = r && "current_summary" in r ? r.current_summary : "";
  const currentEvaluation = r && "current_evaluation" in r ? r.current_evaluation : "";
  const currentKeywords = r && "current_keywords" in r ? (r.current_keywords ?? []) : [];
  const futureSummary = r && "future_summary" in r ? r.future_summary : "";
  const futureEvaluation = r && "future_evaluation" in r ? r.future_evaluation : "";
  const futureKeywords = r && "future_keywords" in r ? (r.future_keywords ?? []) : [];
  // 꿈 일치도: vivid에서, 투두 달성률: review에서 (병합된 report는 둘 다 가질 수 있음)
  const alignmentScore = r && "alignment_score" in r ? r.alignment_score : null;
  const alignmentAnalysisPoints =
    r && "alignment_analysis_points" in r
      ? (r.alignment_analysis_points ?? [])
      : (r as { alignment_score_reason?: string[] })?.alignment_score_reason ?? [];
  const retrospectiveSummary = r && "retrospective_summary" in r ? (r.retrospective_summary ?? null) : null;
  const retrospectiveEvaluation = r && "retrospective_evaluation" in r ? (r.retrospective_evaluation ?? null) : null;
  const userCharacteristics = r && "user_characteristics" in r ? (r.user_characteristics ?? []) : [];
  const aspiredTraits = r && "aspired_traits" in r ? (r.aspired_traits ?? []) : [];
  const completedTodos = isReview && r ? (Array.isArray((r as ReviewReport).completed_todos) ? (r as ReviewReport).completed_todos : []) : undefined;
  const uncompletedTodos = isReview && r ? (Array.isArray((r as ReviewReport).uncompleted_todos) ? (r as ReviewReport).uncompleted_todos : []) : undefined;
  const todoFeedback = isReview && r ? (Array.isArray((r as ReviewReport).todo_feedback) ? (r as ReviewReport).todo_feedback : []) : undefined;
  const rawSuggested = isReview && r && "suggested_todos_for_tomorrow" in r
    ? (r as ReviewReport).suggested_todos_for_tomorrow
    : undefined;
  const suggestedTodosForTomorrow =
    rawSuggested &&
    typeof rawSuggested === "object" &&
    Array.isArray(rawSuggested.items)
      ? {
          reason: String(rawSuggested.reason ?? ""),
          items: rawSuggested.items.filter((s): s is string => typeof s === "string"),
        }
      : undefined;
  
  // 하위 호환성을 위한 레거시 필드 매핑
  const visionSummary = currentSummary || futureSummary || "";
  const visionSelf = currentEvaluation || "";
  const visionKeywords = [...currentKeywords, ...futureKeywords];
  const visionAiFeedback: string[] = [];
  const dreamGoals = null;
  const dreamerTraits = null;

  const narrativeSummary = isReview
    ? (retrospectiveSummary ?? (currentSummary || futureSummary))
    : (currentSummary || futureSummary);

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
    alignment_analysis_points: alignmentAnalysisPoints,
    alignment_based_on_persona: r && "alignment_based_on_persona" in r ? r.alignment_based_on_persona : undefined,
    retrospective_summary: retrospectiveSummary,
    retrospective_evaluation: retrospectiveEvaluation,
    user_characteristics: userCharacteristics,
    aspired_traits: aspiredTraits,
    completed_todos: completedTodos,
    uncompleted_todos: uncompletedTodos,
    todo_feedback: todoFeedback,
    suggested_todos_for_tomorrow: suggestedTodosForTomorrow,

    // 하위 호환성을 위한 레거시 필드
    vision_summary: visionSummary,
    vision_self: visionSelf,
    vision_keywords: visionKeywords,
    vision_ai_feedback: visionAiFeedback,
    dream_goals: dreamGoals,
    dreamer_traits: dreamerTraits,
  };
}
