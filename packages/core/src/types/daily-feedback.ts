// Emotion Timeline 항목
export interface EmotionTimelineItem {
  time_range: string; // "09:00-12:00" 형식
  emotion: string;
}

// Emotion Overview 섹션
export interface EmotionOverview {
  ai_mood_valence: number | null;
  ai_mood_arousal: number | null;
  emotion_curve: string[];
  dominant_emotion: string | null;
  emotion_quadrant:
    | "몰입·설렘"
    | "불안·초조"
    | "슬픔·무기력"
    | "안도·평온"
    | null;
  emotion_quadrant_explanation: string | null;
  emotion_timeline: EmotionTimelineItem[];
}

// Narrative Overview 섹션
export interface NarrativeOverview {
  narrative_summary: string | null;
  narrative: string | null;
  lesson: string | null;
  keywords: string[];
  integrity_score: number | null;
}

// Insight Overview 섹션
export interface InsightOverview {
  core_insight: string | null;
  learning_source: string | null;
  meta_question: string | null;
  insight_ai_comment: string | null;
}

// Vision Overview 섹션
export interface VisionOverview {
  vision_summary: string | null;
  vision_self: string | null;
  vision_keywords: string[];
  reminder_sentence: string | null;
  vision_ai_feedback: string | null;
}

// Feedback Overview 섹션
export interface FeedbackOverview {
  core_feedback: string | null;
  positives: string[];
  improvements: string[];
  feedback_ai_comment: string | null;
  ai_message: string | null;
}

// Meta Overview 섹션
export interface MetaOverview {
  growth_point: string | null;
  adjustment_point: string | null;
  tomorrow_focus: string | null;
  integrity_reason: string | null;
}

// Daily Feedback Row (DB에서 가져온 구조)
export interface DailyFeedbackRow {
  id: string;
  user_id: string;
  report_date: string;
  day_of_week: string | null;

  // jsonb 섹션들
  emotion_overview: EmotionOverview | null;
  narrative_overview: NarrativeOverview | null;
  insight_overview: InsightOverview | null;
  vision_overview: VisionOverview | null;
  feedback_overview: FeedbackOverview | null;
  meta_overview: MetaOverview | null;

  created_at: string;
  updated_at: string;
  is_ai_generated: boolean | null;
}
