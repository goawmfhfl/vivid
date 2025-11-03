export type DailyReportData = {
  date: string;
  dayOfWeek: string;
  integrity_score: number;
  narrative_summary: string;
  emotion_curve: string[];
  narrative: string;
  lesson: string;
  keywords: string[];
  daily_ai_comment: string;
  vision_summary: string;
  vision_self: string;
  vision_keywords: string[];
  reminder_sentence: string;
  vision_ai_feedback: string;
  core_insight: string;
  learning_source: string;
  meta_question: string;
  insight_ai_comment: string;
  core_feedback: string;
  positives: string[];
  improvements: string[];
  feedback_ai_comment: string;
  ai_message: string;
  growth_point: string;
  adjustment_point: string;
  tomorrow_focus: string;
  integrity_reason: string;
};

export type SectionProps = {
  view: DailyReportData;
};
