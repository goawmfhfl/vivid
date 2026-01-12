// React Query Query Keys
export const QUERY_KEYS = {
  RECORDS: "records",
  CURRENT_USER: "currentUser",
  PROFILES: "profiles",
  DAILY_FEEDBACK: "dailyFeedback",
  WEEKLY_SUMMARIES: "weeklySummaries",
  MONTHLY_SUMMARIES: "monthlySummaries",
  USER_CONSENTS: "userConsents",
  WEEKLY_CANDIDATES: "weeklyCandidates",
  WEEKLY_FEEDBACK: "weeklyFeedback",
  MONTHLY_FEEDBACK: "monthlyFeedback",
  MONTHLY_CANDIDATES: "monthlyCandidates",
  NOTION_POLICIES: "notionPolicies",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  RECORDS: "records",
  PROFILES: "profiles",
  DAILY_FEEDBACK: "daily_feedback",
  WEEKLY_SUMMARIES: "weekly_summaries",
  MONTHLY_SUMMARIES: "monthly_summaries",
  USER_CONSENTS: "user_consents",
  WEEKLY_CANDIDATES: "weekly_candidates",
  WEEKLY_FEEDBACKS: "weekly_feedback",
  MONTHLY_FEEDBACK: "monthly_feedback",
  MONTHLY_CANDIDATES: "monthly_candidates",
} as const;

// Record Types
export const RECORD_TYPES = {
  INSIGHT: "insight",
  FEEDBACK: "feedback",
  VISUALIZING: "visualizing",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  LOGIN_REQUIRED: "로그인이 필요합니다.",
  RECORD_FETCH_FAILED: "기록 조회 실패",
  RECORD_CREATE_FAILED: "기록 생성 실패",
  RECORD_UPDATE_FAILED: "기록 수정 실패",
  RECORD_DELETE_FAILED: "기록 삭제 실패",
  UNEXPECTED_ERROR: "예상치 못한 오류가 발생했습니다.",
} as const;
