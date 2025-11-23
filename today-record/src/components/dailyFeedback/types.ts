/**
 * DailyFeedbackRow를 평면 구조로 변환한 일일 리포트 데이터
 * (프론트엔드 컴포넌트에서 사용하는 평면화된 구조)
 */
export type DailyReportData = {
  // ========== 기본 정보 ==========
  /** 리포트 날짜 (YYYY-MM-DD 형식) */
  date: string;
  /** 요일 (예: "월요일") */
  dayOfWeek: string;
  /** 하루 점수 (0-10 범위의 정수) */
  integrity_score: number;
  /** 오늘의 전체 흐름 요약 (헤더에 표시되는 짧은 요약) */
  narrative_summary: string;

  // ========== 감정 섹션 (Emotion Overview) ==========
  /** 하루의 감정 흐름을 순서대로 나타내는 배열 (예: ["기대", "집중", "안정"]) */
  emotion_curve: string[];
  /** 쾌-불쾌 감정 값 (-1.0 ~ +1.0 범위, -1: 매우 부정적, +1: 매우 긍정적) */
  ai_mood_valence: number | null;
  /** 각성-에너지 값 (0.0 ~ 1.0 범위, 0: 낮은 에너지, 1: 높은 에너지) */
  ai_mood_arousal: number | null;
  /** 그날 하루를 대표하는 감정 (한 단어 또는 짧은 구) */
  dominant_emotion: string | null;
  /** 하루 감정을 한 문장으로 요약 (80자 이내) */
  emotion_summary: string | null;
  /** 감정에 영향을 준 구체적인 맥락이나 상황 (한두 문장) */
  emotion_notes: string | null;

  // ========== 서사 섹션 (Narrative Overview) ==========
  /** 오늘의 전체 흐름을 서술한 본문 (400자 이내) */
  narrative: string;
  /** 오늘 배운 교훈이나 깨달음 */
  lesson: string;
  /** 오늘의 키워드 배열 (20개 이하) */
  keywords: string[];

  // ========== 시각화 섹션 (Vision Overview) ==========
  /** 시각화 요약 */
  vision_summary: string;
  /** 자기 평가 */
  vision_self: string;
  /** 시각화 키워드 배열 (10개 이하) */
  vision_keywords: string[];
  /** 오늘의 리마인더 문장 */
  reminder_sentence: string;
  /** AI 피드백 (핵심 3단 형식: "핵심 3단: 1) ..., 2) ..., 3) ...") */
  vision_ai_feedback: string;

  // ========== 인사이트 섹션 (Insight Overview) ==========
  /** 핵심 인사이트 */
  core_insight: string;
  /** 학습의 출처나 배경 */
  learning_source: string;
  /** 메타 질문 */
  meta_question: string;
  /** AI 인사이트 코멘트 */
  insight_ai_comment: string;

  // ========== 피드백 섹션 (Feedback Overview) ==========
  /** 핵심 피드백 */
  core_feedback: string;
  /** 잘한 점 배열 */
  positives: string[];
  /** 개선할 점 배열 */
  improvements: string[];
  /** AI 피드백 코멘트 */
  feedback_ai_comment: string;
  /** AI 메시지 */
  ai_message: string;

  // ========== 메타 섹션 (Meta Overview) ==========
  /** 성장 포인트 */
  growth_point: string;
  /** 조정 포인트 */
  adjustment_point: string;
  /** 내일 집중할 것 (리스트 형식: "1)..., 2)..., 3)...") */
  tomorrow_focus: string;
  /** 하루 점수(integrity_score)의 이유 */
  integrity_reason: string;
};

/**
 * 각 섹션 컴포넌트에 전달되는 Props 타입
 */
export type SectionProps = {
  /** 일일 리포트 데이터 */
  view: DailyReportData;
};
