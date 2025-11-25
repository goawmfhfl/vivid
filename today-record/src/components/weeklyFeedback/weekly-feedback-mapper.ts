import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { WeeklyReportData } from "./WeeklyFeedbackReport";

/**
 * 날짜 포맷 변환: YYYY-MM-DD -> YYYY.MM.DD
 */
function formatDateForDisplay(dateString: string): string {
  return dateString.replace(/-/g, ".");
}

/**
 * 요일 변환: "Tue" -> "화요일"
 */
function convertWeekdayToKorean(weekday: string): string {
  const weekdayMap: Record<string, string> = {
    Mon: "월요일",
    Tue: "화요일",
    Wed: "수요일",
    Thu: "목요일",
    Fri: "금요일",
    Sat: "토요일",
    Sun: "일요일",
  };
  return weekdayMap[weekday] || weekday;
}

/**
 * 정합도 트렌드 텍스트 생성 (간단한 버전)
 */
function generateIntegrityTrend(): string {
  // 실제로는 이전 주 데이터와 비교해야 하지만, 일단 기본값 반환
  return "전주 대비 유지";
}

/**
 * WeeklyFeedback을 WeeklyReportData로 변환
 */
export function mapWeeklyFeedbackToReportData(
  feedback: WeeklyFeedback
): WeeklyReportData {
  // 정합도 점수 계산 (growth_trends에서 가져옴)
  const integrityStats = feedback.growth_trends.integrity_score;
  const integrityAverage = integrityStats.avg;
  const integrityMin = integrityStats.min;
  const integrityMax = integrityStats.max;
  const integrityStddev = integrityStats.stddev_est;

  return {
    week_range: {
      start: formatDateForDisplay(feedback.week_range.start),
      end: formatDateForDisplay(feedback.week_range.end),
    },
    integrity: {
      average: Math.round(integrityAverage * 10) / 10,
      min: integrityMin,
      max: integrityMax,
      stddev: Math.round(integrityStddev * 10) / 10,
      trend: generateIntegrityTrend(),
    },
    weekly_one_liner: feedback.closing_section.weekly_one_liner,
    next_week_focus: feedback.weekly_overview.next_week_focus,
    weekly_overview: {
      narrative: feedback.weekly_overview.narrative,
      top_keywords: feedback.weekly_overview.top_keywords,
      repeated_themes: feedback.insight_replay.repeated_themes,
      ai_overall_comment: feedback.weekly_overview.ai_overall_comment,
    },
    emotion_overview: feedback.emotion_overview
      ? {
          ai_mood_valence: feedback.emotion_overview.ai_mood_valence,
          ai_mood_arousal: feedback.emotion_overview.ai_mood_arousal,
          dominant_emotion: feedback.emotion_overview.dominant_emotion,
          valence_explanation:
            feedback.emotion_overview.valence_explanation || "",
          arousal_explanation:
            feedback.emotion_overview.arousal_explanation || "",
          valence_patterns: feedback.emotion_overview.valence_patterns || [],
          arousal_patterns: feedback.emotion_overview.arousal_patterns || [],
          valence_triggers: feedback.emotion_overview.valence_triggers || [],
          arousal_triggers: feedback.emotion_overview.arousal_triggers || [],
          anxious_triggers: feedback.emotion_overview.anxious_triggers || [],
          engaged_triggers: feedback.emotion_overview.engaged_triggers || [],
          sad_triggers: feedback.emotion_overview.sad_triggers || [],
          calm_triggers: feedback.emotion_overview.calm_triggers || [],
          daily_emotions: (feedback.emotion_overview.daily_emotions || []).map(
            (day) => ({
              date: formatDateForDisplay(day.date),
              weekday: convertWeekdayToKorean(day.weekday),
              ai_mood_valence: day.ai_mood_valence,
              ai_mood_arousal: day.ai_mood_arousal,
              dominant_emotion: day.dominant_emotion,
            })
          ),
        }
      : null,
    growth_points_top3: feedback.growth_trends.growth_points_top3,
    adjustment_points_top3: feedback.growth_trends.adjustment_points_top3,
    core_insights: feedback.insight_replay.core_insights,
    meta_questions_highlight: feedback.insight_replay.meta_questions_highlight,
    vision_summary: feedback.vision_visualization_report.vision_summary,
    vision_keywords_trend:
      feedback.vision_visualization_report.vision_keywords_trend.map(
        (item) => ({
          keyword: item.keyword,
          count: item.days,
        })
      ),
    alignment_comment: feedback.vision_visualization_report.alignment_comment,
    reminder_sentences_featured:
      feedback.vision_visualization_report.reminder_sentences_featured,
    positives_top3: feedback.execution_reflection.positives_top3,
    improvements_top3: feedback.execution_reflection.improvements_top3,
    ai_feedback_summary: feedback.execution_reflection.ai_feedback_summary,
    next_week_objective: feedback.closing_section.next_week_objective,
    call_to_action: feedback.closing_section.call_to_action,
  };
}
