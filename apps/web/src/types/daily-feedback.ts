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

// 타입별 리포트 구조
export interface SummaryReport {
  summary: string; // 전체 요약 (일반: 250자, Pro: 500자)
  key_points: string[]; // 핵심 포인트 (일반: 최대 5개, Pro: 최대 10개)
  overall_score: number | null; // 전체 점수 (0-10)
  // Pro 전용 필드
  detailed_analysis?: string | null; // 상세 분석 (Pro만)
  trend_analysis?: string | null; // 트렌드 분석 (Pro만)
}

export interface DailyReport {
  summary: string; // 일상 기록 요약 (일반: 250자, Pro: 500자)
  narrative: string; // 일상 서사 (일반: 400자, Pro: 800자)
  keywords: string[]; // 키워드 (일반: 최대 20개, Pro: 최대 30개)
  lesson: string | null; // 배운 점
  ai_comment: string | null; // AI 코멘트
  // Pro 전용 필드
  detailed_narrative?: string | null; // 상세 서사 (Pro만)
  context_analysis?: string | null; // 맥락 분석 (Pro만)
}

export interface EmotionReport {
  emotion_curve: string[]; // 감정 흐름 (3-7개)
  dominant_emotion: string | null; // 대표 감정
  ai_mood_valence: number | null; // 쾌-불쾌 (-1.0 ~ +1.0)
  ai_mood_arousal: number | null; // 각성-에너지 (0.0 ~ 1.0)
  emotion_quadrant:
    | "몰입·설렘"
    | "불안·초조"
    | "슬픔·무기력"
    | "안도·평온"
    | null;
  emotion_quadrant_explanation: string | null;
  emotion_timeline: EmotionTimelineItem[];
  ai_comment: string | null;
}

export interface DreamReport {
  summary: string; // 꿈/목표 요약
  vision_self: string; // 자기 평가
  vision_keywords: string[]; // 키워드 (최대 10개)
  reminder_sentence: string | null; // 리마인더 문장
  vision_ai_feedback: string | null; // AI 피드백 (핵심 3단 형식)
}

export interface InsightReport {
  core_insight: string; // 핵심 인사이트
  learning_source: string | null; // 학습 소스
  meta_question: string | null; // 메타 질문
  insight_ai_comment: string | null; // AI 코멘트
}

export interface FeedbackReport {
  core_feedback: string; // 핵심 피드백
  positives: string[]; // 긍정적 측면
  improvements: string[]; // 개선점
  feedback_ai_comment: string | null; // AI 코멘트
  ai_message: string | null; // AI 메시지
}

export interface FinalReport {
  closing_message: string; // 하루를 정리하는 멘트 (400자 이내)
  tomorrow_focus: string | null; // 내일 집중할 점
  growth_point: string | null; // 성장 포인트
  adjustment_point: string | null; // 조정 포인트
}

// Daily Feedback Row (DB에서 가져온 구조)
export interface DailyFeedbackRow {
  id: string;
  user_id: string;
  report_date: string;
  day_of_week: string | null;

  // 새로운 타입별 리포트 (jsonb)
  summary_report: SummaryReport | null;
  daily_report: DailyReport | null;
  emotion_report: EmotionReport | null;
  dream_report: DreamReport | null;
  insight_report: InsightReport | null;
  feedback_report: FeedbackReport | null;
  final_report: FinalReport | null;

  // 기존 필드들 (하위 호환성 유지)
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
