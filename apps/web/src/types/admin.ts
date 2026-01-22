/**
 * 관리자 페이지 관련 타입 정의
 */

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  proUsers: number;
  todayAIRequests: number;
  todayAICost: {
    usd: number;
    krw: number;
  };
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  subscription?: {
    plan: "free" | "pro";
    status: "active" | "canceled" | "expired" | "past_due";
    expires_at: string | null;
    current_period_start?: string | null;
    cancel_at_period_end?: boolean | null;
  };
  aiUsage?: {
    total_requests: number;
    total_tokens: number;
    total_cost_usd: number;
    total_cost_krw: number;
  };
}

export interface UserDetail extends UserListItem {
  phone: string | null;
  birth_year: string | null;
  gender: string | null;
  stats?: {
    records_count: number;
    daily_vivid_count: number;
    weekly_vivid_count: number;
    monthly_vivid_count: number;
  };
}

export interface AIUsageStats {
  total_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  total_cost_krw: number;
  by_model: Array<{
    model: string;
    requests: number;
    tokens: number;
    cost_usd: number;
    cost_krw: number;
    avg_duration_ms?: number;
  }>;
  by_type: Array<{
    request_type: string;
    requests: number;
    tokens: number;
    cost_usd: number;
    cost_krw: number;
    avg_duration_ms?: number;
  }>;
  daily_trend: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost_usd: number;
    cost_krw: number;
    avg_duration_ms?: number;
  }>;
}

export interface AIUsageDetail {
  id: string;
  model: string;
  request_type: string;
  section_name: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  total_tokens: number;
  cost_usd: number;
  cost_krw: number;
  duration_ms: number | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
}
