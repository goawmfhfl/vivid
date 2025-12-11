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
  vision_ai_feedback: string[];
}

// Feedback Overview 섹션
export interface FeedbackOverview {
  core_feedback: string | null;
  positives: string[];
  improvements: string[];
  ai_message: string | null;
}

// Meta Overview 섹션
export interface MetaOverview {
  tomorrow_focus: string | null;
  integrity_reason: string | null;
}

// 타입별 리포트 구조
export interface SummaryReport {
  summary: string; // 전체 요약 (일반: 200자, Pro: 300자)
  key_points: string[]; // 핵심 포인트 (일반: 최대 5개, Pro: 최대 10개)
  // Pro 전용 필드
  trend_analysis?: string | null; // 트렌드 분석 (Pro만)
}

export interface DailyReport {
  summary: string; // 일상 기록 요약 (일반: 150자, Pro: 300자, 최대 200자)
  daily_events: string[]; // 오늘 있었던 일 리스트 (서사 대신)
  keywords: string[]; // 키워드 (일반: 최대 5개, Pro: 최대 10개)
  ai_comment: string | null; // AI 코멘트
  // Pro 전용 필드
  emotion_triggers?: {
    people: string[]; // 사람 관련: 직장동료, 가족, 연인, 친구
    work: string[]; // 업무 관련: 데드라인, 불안, 일정폭주
    environment: string[]; // 환경: 날씨, 피로, 금전
    self: string[]; // 자기 요인: 기대, 비교, 자기비판
  } | null;
  behavioral_clues?: {
    avoidance: string[]; // 회피 행동
    routine_attempt: string[]; // 루틴 시도
    routine_failure: string[]; // 루틴 실패
    impulsive: string[]; // 즉흥 충동
    planned: string[]; // 계획적 행동
  } | null;
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
  emotion_events?:
    | {
        event: string;
        emotion: string;
        reason?: string | null;
        suggestion?: string | null;
      }[]
    | null;
}

export interface DreamReport {
  summary: string; // 꿈/목표 요약 (일반: 150자 이내, Pro: 250자 이내)
  vision_self: string; // 자기 평가 (나의 상태와 태도에 대한 짧은 메모, 200자 이내)
  vision_keywords: string[]; // 키워드 (6~10개 필수, 나의 비전을 잘 나타내는 단어)
  vision_ai_feedback: string[]; // AI 피드백 배열 (3개 요소)
  // Pro 전용 필드
  dream_goals?: string[] | null; // 시각화를 통해 이루고 싶은 구체적인 꿈/목표 리스트 (각 항목 1문장, 최대 5개)
  dreamer_traits?: string[] | null; // 이런 꿈을 꾸는 사람들의 특징 리스트 (각 항목 1문장, 최대 5개)
}

export interface InsightReport {
  core_insights: Array<{
    insight: string; // 핵심 인사이트 (1문장)
    source: string; // 이 인사이트를 얻은 출처 (예: "오늘의 일상 기록", "감정 기록", "책 '어떤 책'")
  }>; // 핵심 인사이트 리스트 (최대 5개)
  meta_question: string | null; // 오늘의 인사이트를 더 발전시키는 방법 (간단하고 실용적으로, Pro에서만 활용)
  insight_ai_comment: string | null; // AI 코멘트
  // Pro 전용: 인사이트 기반 추천 행동 리스트
  insight_next_actions?:
    | {
        label: string; // 추천 행동 한 문장
        difficulty: "낮음" | "보통" | "높음"; // 난이도
        estimated_minutes: number | null; // 예상 소요 시간 (분 단위, 없으면 null)
      }[]
    | null;
}

export interface FeedbackReport {
  core_feedback: string; // 핵심 피드백
  positives: string[]; // 긍정적 측면 (Pro: 최대 6개, Free: 2~3개)
  improvements: string[]; // 개선점 (Pro: 최대 6개, Free: 2~3개)
  ai_message: string | null; // AI 메시지 (Pro 전용)
  // Pro 전용 필드
  feedback_person_traits?: string[] | null; // 피드백을 통해 알 수 있는 사람들의 특징 (최대 5개)
}

export interface FinalReport {
  closing_message: string; // 하루를 정리하는 멘트 (400자 이내)
  tomorrow_focus: string[] | null; // 내일 집중할 점 배열 (3~5개, Pro 전용)
  // Pro 전용: 리스트 형식의 성장/조정 포인트
  growth_points?: string[] | null; // 성장 포인트 리스트 (Pro 전용)
  adjustment_points?: string[] | null; // 조정 포인트 리스트 (Pro 전용)
  // Pro 전용: 최근 동향 분석용 필드
  aspired_self?: string | null; // 지향하는 나의 모습
  aspired_self_description?: string | null; // 지향하는 나의 모습에 대한 정보 1줄
  interest_characteristic?: string | null; // 관심사의 특징 1가지
  personality_strength?: string | null; // 성격의 강점 특징 1가지
  immersion_hope_situation?: string | null; // 몰입-희망을 느끼는 구체적인 상황 1가지
  relief_comfort_situation?: string | null; // 안도-편안을 느끼는 구체적인 상황 1가지
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

  // 향후 pattern 컬럼 데이터 저장용
  pattern_points?: unknown | null;

  created_at: string;
  updated_at: string;
  is_ai_generated: boolean | null;
}
