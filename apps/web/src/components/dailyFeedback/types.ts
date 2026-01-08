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
  /** 오늘의 전체 흐름 요약 (헤더에 표시되는 짧은 요약) - summary_report의 summary */
  narrative_summary: string;

  // ========== Summary Report 데이터 ==========
  /** 핵심 포인트 배열 */
  summary_key_points: string[];
  /** 트렌드 분석 (Pro 전용) */
  trend_analysis: string | null;

  // ========== Daily Report 데이터 ==========
  /** 일상 기록 요약 */
  daily_summary: string;
  /** 오늘 있었던 일 리스트 (서사 대신) */
  daily_events: string[];
  /** 키워드 배열 */
  keywords: string[];
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
  /** 오늘의 감정을 이끈 주요 사건들 */
  emotion_events:
    | {
        event: string;
        emotion: string;
        reason?: string | null;
        suggestion?: string | null;
      }[]
    | null;

  // ========== Vivid Report 데이터 ==========
  /** 오늘의 VIVID (현재 모습) - 요약 */
  current_summary: string;
  /** 오늘의 VIVID (현재 모습) - 평가 */
  current_evaluation: string;
  /** 오늘의 VIVID (현재 모습) - 키워드 */
  current_keywords: string[];
  /** 앞으로의 나의 모습 (미래 비전) - 요약 */
  future_summary: string;
  /** 앞으로의 나의 모습 (미래 비전) - 평가 */
  future_evaluation: string;
  /** 앞으로의 나의 모습 (미래 비전) - 키워드 */
  future_keywords: string[];
  /** 일치도 점수 (0-100) */
  alignment_score: number | null;
  /** 기록을 쓰는 사람의 특징 (최대 5가지) */
  user_characteristics: string[];
  /** 지향하는 모습 (최대 5가지) */
  aspired_traits: string[];
  
  // 하위 호환성을 위한 레거시 필드
  /** @deprecated vision_summary는 current_summary를 사용하세요 */
  vision_summary: string;
  /** @deprecated vision_self는 current_evaluation을 사용하세요 */
  vision_self: string;
  /** @deprecated vision_keywords는 current_keywords와 future_keywords를 사용하세요 */
  vision_keywords: string[];
  /** @deprecated vision_ai_feedback는 더 이상 사용되지 않습니다 */
  vision_ai_feedback: string[];
  /** @deprecated dream_goals는 더 이상 사용되지 않습니다 */
  dream_goals: string[] | null;
  /** @deprecated dreamer_traits는 user_characteristics를 사용하세요 */
  dreamer_traits: string[] | null;

  // ========== Insight Report 데이터 ==========
  /** 핵심 인사이트 리스트 (각 항목에 출처 포함) */
  core_insights: Array<{ insight: string; source: string }>;
  /** 오늘의 인사이트를 더 발전시키는 방법 (간단하고 실용적으로) */
  meta_question: string | null;
  /** AI 인사이트 코멘트 */
  insight_ai_comment: string | null;
  /** 인사이트 기반 추천 행동 리스트 (Pro 전용) */
  insight_next_actions:
    | {
        label: string;
        difficulty: "낮음" | "보통" | "높음";
        estimated_minutes: number | null;
      }[]
    | null;

  // ========== Feedback Report 데이터 ==========
  /** 핵심 피드백 */
  core_feedback: string;
  /** 잘한 점 배열 (Pro: 최대 6개, Free: 2~3개) */
  positives: string[];
  /** 개선할 점 배열 (Pro: 최대 6개, Free: 2~3개) */
  improvements: string[];
  /** AI 메시지 (Pro 전용) */
  ai_message: string | null;
  /** 피드백을 통해 알 수 있는 사람들의 특징 (Pro 전용) */
  feedback_person_traits: string[] | null;

  // ========== Final Report 데이터 ==========
  /** 하루를 정리하는 멘트 */
  closing_message: string;
  /** 내일 집중할 것 배열 (3~5개, Pro 전용) */
  tomorrow_focus: string[] | null;
  /** 성장 포인트 리스트 (Pro 전용) */
  growth_points: string[] | null;
  /** 조정 포인트 리스트 (Pro 전용) */
  adjustment_points: string[] | null;
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
