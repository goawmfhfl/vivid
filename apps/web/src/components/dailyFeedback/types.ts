/**
 * DailyFeedbackRow를 평면 구조로 변환한 일일 리포트 데이터
 * 새로운 리포트 구조(summary_report, daily_report 등)를 사용
 */
export type DailyReportData = {
  // ========== 기본 정보 ==========
  /** 리포트 날짜 (YYYY-MM-DD 형식) */
  date: string;
  /** 요일 (예: "월요일") */
  dayOfWeek: string;
  /** 하루 점수 (0-10 범위의 정수) - summary_report의 overall_score */
  integrity_score: number;
  /** 오늘의 전체 흐름 요약 (헤더에 표시되는 짧은 요약) - summary_report의 summary */
  narrative_summary: string;

  // ========== Summary Report 데이터 ==========
  /** 핵심 포인트 배열 */
  summary_key_points: string[];
  /** 전체 점수 */
  overall_score: number;
  /** 상세 분석 (Pro 전용) */
  detailed_analysis: string | null;
  /** 트렌드 분석 (Pro 전용) */
  trend_analysis: string | null;

  // ========== Daily Report 데이터 ==========
  /** 일상 기록 요약 */
  daily_summary: string;
  /** 오늘 있었던 일 리스트 (서사 대신) */
  daily_events: string[];
  /** 키워드 배열 */
  keywords: string[];
  /** 배운 점 */
  lesson: string | null;
  /** AI 코멘트 */
  ai_comment: string | null;
  /** 감정 트리거 (Pro 전용) */
  emotion_triggers: {
    people: string[]; // 사람 관련: 직장동료, 가족, 연인, 친구
    work: string[]; // 업무 관련: 데드라인, 불안, 일정폭주
    environment: string[]; // 환경: 날씨, 피로, 금전
    self: string[]; // 자기 요인: 기대, 비교, 자기비판
  } | null;
  /** 행동 단서 (Pro 전용) */
  behavioral_clues: {
    avoidance: string[]; // 회피 행동
    routine_attempt: string[]; // 루틴 시도
    routine_failure: string[]; // 루틴 실패
    impulsive: string[]; // 즉흥 충동
    planned: string[]; // 계획적 행동
  } | null;

  // ========== Emotion Report 데이터 ==========
  /** 하루의 감정 흐름을 순서대로 나타내는 배열 */
  emotion_curve: string[];
  /** 쾌-불쾌 감정 값 (-1.0 ~ +1.0 범위) */
  ai_mood_valence: number | null;
  /** 각성-에너지 값 (0.0 ~ 1.0 범위) */
  ai_mood_arousal: number | null;
  /** 그날 하루를 대표하는 감정 */
  dominant_emotion: string | null;
  /** 감정 영역 */
  emotion_quadrant:
    | "몰입·설렘"
    | "불안·초조"
    | "슬픔·무기력"
    | "안도·평온"
    | null;
  /** 감정 영역이 선정된 이유에 대한 설명 */
  emotion_quadrant_explanation: string | null;
  /** 시간대별 감정 흐름 배열 */
  emotion_timeline: Array<{ time_range: string; emotion: string }>;

  // ========== Dream Report 데이터 ==========
  /** 시각화 요약 */
  vision_summary: string;
  /** 자기 평가 */
  vision_self: string;
  /** 시각화 키워드 배열 */
  vision_keywords: string[];
  /** 오늘의 리마인더 문장 */
  reminder_sentence: string | null;
  /** AI 피드백 */
  vision_ai_feedback: string | null;

  // ========== Insight Report 데이터 ==========
  /** 핵심 인사이트 */
  core_insight: string;
  /** 학습의 출처나 배경 */
  learning_source: string | null;
  /** 메타 질문 */
  meta_question: string | null;
  /** AI 인사이트 코멘트 */
  insight_ai_comment: string | null;

  // ========== Feedback Report 데이터 ==========
  /** 핵심 피드백 */
  core_feedback: string;
  /** 잘한 점 배열 */
  positives: string[];
  /** 개선할 점 배열 */
  improvements: string[];
  /** AI 피드백 코멘트 */
  feedback_ai_comment: string | null;
  /** AI 메시지 */
  ai_message: string | null;

  // ========== Final Report 데이터 ==========
  /** 하루를 정리하는 멘트 */
  closing_message: string;
  /** 내일 집중할 것 */
  tomorrow_focus: string | null;
  /** 성장 포인트 */
  growth_point: string | null;
  /** 조정 포인트 */
  adjustment_point: string | null;
  /** 하루 점수의 이유 */
  integrity_reason: string;
};

/**
 * 각 섹션 컴포넌트에 전달되는 Props 타입
 */
export type SectionProps = {
  /** 일일 리포트 데이터 */
  view: DailyReportData;
  /** Pro 멤버십 여부 */
  isPro?: boolean;
};
