/**
 * DailyVividRow를 평면 구조로 변환한 일일 리포트 데이터
 * report만 사용
 */
export type DailyReportData = {
  // ========== 기본 정보 ==========
  /** 리포트 날짜 (YYYY-MM-DD 형식) */
  date: string;
  /** 요일 (예: "월요일") */
  dayOfWeek: string;
  /** 오늘의 전체 흐름 요약 (report의 current_summary 사용) */
  narrative_summary: string;

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

  // ========== 감정 분석 데이터 ==========
  /** 감정 valence (-1~1). 문자열로 들어올 수 있음 */
  ai_mood_valence?: number | string | null;
  /** 감정 arousal (0~1). 문자열로 들어올 수 있음 */
  ai_mood_arousal?: number | string | null;
  /** 감정 사분면 라벨 */
  emotion_quadrant?: string | null;
  /** 감정 사분면 설명 */
  emotion_quadrant_explanation?: string | null;
  /** 감정 흐름 */
  emotion_curve?: string[];
  /** 시간대별 감정 흐름 */
  emotion_timeline?: { time_range: string; emotion: string }[];
  /** 대표 감정 */
  dominant_emotion?: string | null;
  /** 감정에 영향을 준 사건 */
  emotion_events?: {
    emotion: string;
    event: string;
    reason?: string | null;
    suggestion?: string | null;
  }[];
  
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
