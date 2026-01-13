export type PageType = 'daily' | 'weekly' | 'monthly';

/**
 * 유저 피드백 인터페이스
 * 사용자가 VIVID 페이지에 남긴 피드백 정보
 */
export interface VividFeedback {
  id: string;
  page_type: PageType;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
}

export interface SubmitFeedbackRequest {
  pageType: PageType;
  rating: number; // 1-5
  comment?: string;
}

export interface FeedbackStats {
  total: number;
  byPageType: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  byRating: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  averageRating: number; // 평균 별점
}

export interface FeedbackListResponse {
  feedbacks: VividFeedback[];
  stats: FeedbackStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
