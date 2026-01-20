export interface MonthlyCandidate {
  month: string; // "YYYY-MM" 형식의 월 문자열
  month_label: string; // "2025년 11월" 형식의 라벨
  is_current: boolean; // 현재 달인지 여부
  monthly_vivid_id: string | null; // 이미 생성된 월간 비비드 ID (null이면 아직 생성 안 됨)
  daily_vivid_count: number; // 해당 월의 daily-vivid 개수
}
