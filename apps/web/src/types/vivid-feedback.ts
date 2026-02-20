export type PageType = 'daily' | 'weekly' | 'monthly' | 'improvement';

/** 데일리 페이지에서 vivid(비전) vs review(회고) 구분 */
export type VividType = 'vivid' | 'review';

/**
 * 유저 피드백 인터페이스
 * 사용자가 VIVID 페이지에 남긴 피드백 정보
 */
export interface VividFeedback {
  id: string;
  page_type: PageType;
  /** 데일리 페이지일 때만: vivid(비전) | review(회고) */
  vivid_type?: VividType | null;
  rating: number | null; // 1-5 (개선점 피드백은 null)
  comment: string | null;
  content?: string | null; // 개선점 피드백용
  user_id?: string | null; // 개선점 피드백은 필수, 일반 피드백은 null
  created_at: string;
  updated_at?: string;
}

export interface SubmitFeedbackRequest {
  pageType: PageType;
  /** 데일리 페이지일 때만: vivid | review */
  vividType?: VividType;
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
