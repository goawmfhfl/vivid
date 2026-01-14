/**
 * 문의사항 타입
 */
export type InquiryType = 
  | 'bug'        // 버그 신고
  | 'feature'    // 기능 제안
  | 'question'   // 질문
  | 'payment'    // 결제 문의
  | 'account'    // 계정 문의
  | 'other';     // 기타

/**
 * 문의사항 상태
 */
export type InquiryStatus = 
  | 'pending'      // 대기 중
  | 'in_progress'  // 처리 중
  | 'resolved'     // 해결됨
  | 'closed';      // 닫힘

/**
 * 문의사항 인터페이스
 */
export interface Inquiry {
  id: string;
  user_id: string;
  type: InquiryType;
  title: string;
  content: string;
  images: string[]; // 이미지 URL 배열
  status: InquiryStatus;
  admin_response: string | null;
  admin_response_images: string[]; // 관리자 답변 이미지 URL 배열
  created_at: string;
  updated_at: string;
}

/**
 * 문의사항 생성 요청
 */
export interface CreateInquiryRequest {
  type: InquiryType;
  title: string;
  content: string;
  images?: string[]; // 이미지 URL 배열
}

/**
 * 문의사항 수정 요청 (관리자용)
 */
export interface UpdateInquiryRequest {
  status?: InquiryStatus;
  admin_response?: string;
  admin_response_images?: string[];
}

/**
 * 문의사항 타입 라벨
 */
export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  bug: '버그 신고',
  feature: '기능 제안',
  question: '질문',
  payment: '결제 문의',
  account: '계정 문의',
  other: '기타',
};

/**
 * 문의사항 상태 라벨
 */
export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: '대기 중',
  in_progress: '처리 중',
  resolved: '해결됨',
  closed: '닫힘',
};
