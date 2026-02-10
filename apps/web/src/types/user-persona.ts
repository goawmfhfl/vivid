/**
 * user_persona 테이블의 persona JSON 구조.
 * cron/update-persona 스키마 및 API 응답과 동일한 구조를 사용합니다.
 * 페르소나 크론/업데이트 시 ai_requests에는 request_type: "user_persona", section_name: "[persona] persona"로 기록됩니다.
 */

export interface UserPersonaIdentity {
  traits: string[];
  ideal_self: string[];
  driving_forces: string[];
}

export interface UserPersonaPatterns {
  flow_moments: string[];
  stumbling_blocks: string[];
  energy_sources: string[];
}

export interface UserPersonaContext {
  active_quests: string[];
  weekly_summary: string;
}

export interface UserPersonaTrend {
  aspired_self: string;
  interest: string;
  immersion_moment: string;
  personality_trait: string;
}

export interface UserPersonaGrowthInsights {
  self_clarity_index: number;
  pattern_balance_score: number;
  self_clarity_rationale: string;
  pattern_balance_rationale: string;
}

export interface UserPersona {
  identity: UserPersonaIdentity;
  patterns: UserPersonaPatterns;
  context: UserPersonaContext;
  trend: UserPersonaTrend;
  growth_insights: UserPersonaGrowthInsights;
}
