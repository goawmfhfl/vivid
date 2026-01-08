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

export interface VividReport {
  // 오늘의 VIVID (현재 모습)
  current_summary: string; // 오늘의 비비드 요약 - 오늘 기록한 VIVID 내용의 요약, 하루의 핵심 내용을 간결하게 정리
  current_evaluation: string; // 오늘의 비비드 평가 - 오늘의 VIVID 기록에 대한 AI 평가, 현재 상태에 대한 객관적 분석
  current_keywords: string[]; // 오늘의 비비드 키워드 - 오늘의 VIVID에서 자주 등장한 키워드, 현재 관심사와 상태를 나타내는 핵심 단어들

  // 앞으로의 나의 모습 (미래 비전)
  future_summary: string; // 기대하는 모습 요약 - 기록에서 드러난 "앞으로 되고 싶은 모습" 요약, 미래 비전의 핵심 내용
  future_evaluation: string; // 기대하는 모습 평가 - 그 비전에 대한 AI 평가, 비전의 명확성과 실현 가능성 분석
  future_keywords: string[]; // 기대하는 모습 키워드 - 미래 비전에서 자주 등장한 키워드, 지향하는 가치와 목표를 나타내는 핵심 단어들

  // 일치도 분석
  alignment_score: number; // 일치도 점수 - 오늘의 모습 vs 앞으로 되고 싶은 모습의 일치도 (0-100점 척도), 현재와 목표의 거리 측정

  // 사용자 특성 분석
  user_characteristics: string[]; // 기록을 쓰는 사람의 특징 (최대 5가지) - 기록 패턴과 내용을 분석해 도출한 사용자 특성 (예: "자기 성찰을 중시하는", "미래 지향적인", "감정 표현이 풍부한" 등)
  aspired_traits: string[]; // 지향하는 모습 (최대 5가지) - 오늘의 VIVID 기록에서 드러난 지향 모습 (예: "균형 잡힌 삶을 추구하는", "창의적인 문제 해결자", "타인과의 깊은 연결을 원하는" 등)
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
  vivid_report: VividReport | null;
  insight_report: InsightReport | null;
  feedback_report: FeedbackReport | null;
  final_report: FinalReport | null;

  // 향후 pattern 컬럼 데이터 저장용
  pattern_points?: unknown | null;

  created_at: string;
  updated_at: string;
  is_ai_generated: boolean | null;
}
