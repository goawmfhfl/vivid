export interface WeeklyCandidateWithFeedback {
  user_id: string;
  week_start: string; // ISO date string
  record_count: number;
  weekly_feedback_id: number | null;
  is_ai_generated: boolean;
}
