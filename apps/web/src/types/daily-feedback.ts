// Emotion Timeline 항목
export interface EmotionTimelineItem {
  time_range: string; // "09:00-12:00" 형식
  emotion: string;
}

// Emotion Event 타입
export interface EmotionEvent {
  event: string;
  emotion: string;
  reason?: string | null;
  suggestion?: string | null;
}

// Emotion Report 타입
export interface EmotionReport {
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
  emotion_events?: EmotionEvent[] | null;
  ai_comment?: string | null;
}


// Vision Overview 섹션
export interface VisionOverview {
  vision_summary: string | null;
  vision_self: string | null;
  vision_keywords: string[];
  vision_ai_feedback: string[];
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





// Daily Feedback Row (DB에서 가져온 구조)
export interface DailyFeedbackRow {
  id: string;
  user_id: string;
  report_date: string;
  day_of_week: string | null;

  // 새로운 타입별 리포트 (jsonb)
  emotion_report: EmotionReport | null;
  vivid_report: VividReport | null;

  created_at: string;
  updated_at: string;
  is_ai_generated: boolean | null;
}
