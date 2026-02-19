// React Query Query Keys
export const QUERY_KEYS = {
  RECORDS: "vivid_records",
  CURRENT_USER: "currentUser",
  PROFILES: "profiles",
  DAILY_VIVID: "dailyVivid",
  WEEKLY_SUMMARIES: "weeklySummaries",
  MONTHLY_SUMMARIES: "monthlySummaries",
  USER_CONSENTS: "userConsents",
  WEEKLY_CANDIDATES: "weeklyCandidates",
  WEEKLY_VIVID: "weeklyVivid",
  MONTHLY_VIVID: "monthlyVivid",
  MONTHLY_CANDIDATES: "monthlyCandidates",
  NOTION_POLICIES: "notionPolicies",
  NOTION_QUESTIONS: "notionQuestions",
  USER_PERSONA_INSIGHTS: "userPersonaInsights",
  USER_TRENDS: "userTrends",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  SURVEY_SUBMISSIONS: "survey_submissions",
  RECORDS: "vivid_records",
  PROFILES: "profiles",
  DAILY_VIVID: "daily_vivid",
  WEEKLY_SUMMARIES: "weekly_summaries",
  MONTHLY_SUMMARIES: "monthly_summaries",
  USER_CONSENTS: "user_consents",
  WEEKLY_CANDIDATES: "weekly_candidates",
  WEEKLY_VIVID: "weekly_vivid",
  MONTHLY_VIVID: "monthly_vivid",
  MONTHLY_CANDIDATES: "monthly_candidates",
  USER_TRENDS: "user_trends",
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
