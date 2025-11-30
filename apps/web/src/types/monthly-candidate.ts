export interface MonthlyCandidate {
  month: string; // "YYYY-MM"
  month_label: string; // "2025년 11월"
  is_current: boolean; // 현재 달인지 여부
  monthly_feedback_id?: string | null; // 이미 생성된 월간 피드백 ID
  record_count?: number; // 해당 월의 기록 개수
}

