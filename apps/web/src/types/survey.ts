/**
 * 설문 관련 타입 정의
 * 질문별 점수 구조: { "1-1": 4, "1-2": 3, ... }
 */

/** 질문 ID -> 점수 (0~5) */
export type QuestionScores = Record<string, number>;

export interface SurveySubmission {
  id: string;
  user_id: string;
  section_scores: QuestionScores;
  free_comment: string | null;
  phone: string | null;
  created_at: string;
}

export interface SubmitSurveyRequest {
  questionScores: QuestionScores;
  freeComment?: string;
  phone?: string;
}

/** 질문별 평균 점수 */
export type QuestionAverages = Record<string, number>;

export interface SurveyStats {
  total: number;
  sectionAverages: Record<string, number>;
  questionAverages: QuestionAverages;
}

export interface SurveyResultsResponse {
  submissions: SurveySubmission[];
  stats: SurveyStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** AI 인사이트 구조화 응답 */
export interface SurveyInsights {
  strengths: string[];
  weaknesses: string[];
  keyInsights: string[];
}
