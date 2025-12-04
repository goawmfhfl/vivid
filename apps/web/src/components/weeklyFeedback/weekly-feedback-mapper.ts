import type { WeeklyFeedback } from "@/types/weekly-feedback";
import type { WeeklyReportData } from "./report/types";

/**
 * 날짜 포맷 변환: YYYY-MM-DD -> YYYY.MM.DD
 */
function formatDateForDisplay(dateString: string): string {
  return dateString.replace(/-/g, ".");
}

/**
 * 요일 변환: "11/24월" 형식에서 요일 추출 또는 "Mon" -> "월요일"
 */
function convertWeekdayToKorean(weekday: string): string {
  // 이미 "월요일" 형식이면 그대로 반환
  if (weekday.includes("요일")) {
    return weekday;
  }

  // "11/24월" 형식에서 요일 추출
  if (
    weekday.includes("월") ||
    weekday.includes("화") ||
    weekday.includes("수") ||
    weekday.includes("목") ||
    weekday.includes("금") ||
    weekday.includes("토") ||
    weekday.includes("일")
  ) {
    const weekdayMap: Record<string, string> = {
      월: "월요일",
      화: "화요일",
      수: "수요일",
      목: "목요일",
      금: "금요일",
      토: "토요일",
      일: "일요일",
    };
    for (const [key, value] of Object.entries(weekdayMap)) {
      if (weekday.includes(key)) {
        return value;
      }
    }
  }

  // 영문 요일 변환
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
 * 숫자로 변환하는 헬퍼 함수 (복호화 과정에서 문자열로 변환될 수 있음)
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * WeeklyFeedback을 WeeklyReportData로 변환 (새로운 구조 반영)
 */
export function mapWeeklyFeedbackToReportData(
  feedback: WeeklyFeedback
): WeeklyReportData {
  return {
    week_range: {
      start: formatDateForDisplay(feedback.week_range.start),
      end: formatDateForDisplay(feedback.week_range.end),
    },
    integrity_score: toNumber(feedback.integrity_score),
    weekly_overview: feedback.weekly_overview,
    daily_life_report: feedback.daily_life_report,
    emotion_report: feedback.emotion_report
      ? {
          ...feedback.emotion_report,
          daily_emotions: (feedback.emotion_report.daily_emotions || []).map(
            (day) => ({
              ...day,
              date: day.date.includes("-")
                ? formatDateForDisplay(day.date)
                : day.date,
              weekday: convertWeekdayToKorean(day.weekday),
              ai_mood_valence:
                day.ai_mood_valence !== null &&
                day.ai_mood_valence !== undefined
                  ? toNumber(day.ai_mood_valence)
                  : null,
              ai_mood_arousal:
                day.ai_mood_arousal !== null &&
                day.ai_mood_arousal !== undefined
                  ? toNumber(day.ai_mood_arousal)
                  : null,
            })
          ),
        }
      : null,
    vision_report: feedback.vision_report,
    insight_report: feedback.insight_report,
    execution_report: feedback.execution_report,
    closing_report: feedback.closing_report,
    daily_integrity_scores: feedback.daily_integrity_scores?.map((day) => ({
      date: day.date.includes("-") ? formatDateForDisplay(day.date) : day.date,
      weekday: day.weekday.includes("요일")
        ? day.weekday
        : convertWeekdayToKorean(day.weekday),
      score: toNumber(day.score),
    })),
  };
}
