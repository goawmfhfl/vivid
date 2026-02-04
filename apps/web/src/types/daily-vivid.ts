export interface Report {
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
  alignment_analysis_points: string[]; // 일치도 점수 산정 근거 - Q1과 Q2에서 겹치는 키워드/주제 (1~3개)

  // 회고 인사이트 (Q3)
  retrospective_summary: string | null; // Q3 요약 (없으면 null)
  retrospective_evaluation: string | null; // Q3 평가 (없으면 null)

  // 실행력 점수 (Q1 <-> Q3)
  execution_score: number | null; // Q3가 있을 때만 점수, 없으면 null
  execution_analysis_points: string[] | null; // 실행 점수 근거 (1~3개), 없으면 null

  // 사용자 특성 분석
  user_characteristics: string[]; // 기록을 쓰는 사람의 특징 (최대 5가지) - 기록 패턴과 내용을 분석해 도출한 사용자 특성 (예: "자기 성찰을 중시하는", "미래 지향적인", "감정 표현이 풍부한" 등)
  aspired_traits: string[]; // 지향하는 모습 (최대 5가지) - 오늘의 VIVID 기록에서 드러난 지향 모습 (예: "균형 잡힌 삶을 추구하는", "창의적인 문제 해결자", "타인과의 깊은 연결을 원하는" 등)
}

// Trend 데이터 타입 (최근 동향 섹션용)
export interface TrendData {
  aspired_self: string; // 내가 지향하는 모습 1개
  interest: string; // 나의 관심사 1개
  immersion_moment: string; // 몰입 희망 순간 1개
  personality_trait: string; // 나라는 사람의 성향 1개
}





// Daily Vivid Row (DB에서 가져온 구조)
export interface DailyVividRow {
  id: string;
  user_id: string;
  report_date: string;
  day_of_week: string | null;

  // 통합 리포트 (jsonb)
  report: Report | null;
  trend: TrendData | null; // 최근 동향 데이터 (JSONB)

  created_at: string;
  updated_at: string;
  is_vivid_ai_generated: boolean | null;
  is_review_ai_generated: boolean | null;
  generation_duration_seconds?: number; // 피드백 생성에 소요된 시간 (초 단위)
}
