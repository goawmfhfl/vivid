export interface WeeklyCandidateWithFeedback {
  user_id: string;
  week_start: string; // ISO date string (월요일, YYYY-MM-DD 형식)
  record_count: number; // 해당 주의 daily_vivid 개수 (하나라도 있으면 >= 1)
  weekly_vivid_id: number | null; // 이미 생성된 주간 비비드 ID (null이면 아직 생성 안 됨)
  is_ai_generated: boolean; // 주간 비비드가 AI로 생성되었는지 여부
}
