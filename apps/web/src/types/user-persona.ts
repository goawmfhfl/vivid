/**
 * user_persona 테이블의 persona JSON 구조.
 * 당분간 trend만 유지 (weekly_vivid trend 마이그레이션)
 * growth_insights, identity, patterns, context는 레거시 호환용 (deprecated)
 */

export interface UserPersonaTrend {
  direction: string[];
  core_value: string[];
  driving_force: string[];
  current_self: string[];
}

export interface UserPersonaTodoAnalysis {
  current_projects: string[];
  recurring_tasks: string[];
}

export interface UserPersona {
  trend?: UserPersonaTrend;
  todo_analysis?: UserPersonaTodoAnalysis;
}

/** @deprecated persona에 trend만 유지할 예정 */
export interface UserPersonaIdentity {
  traits: string[];
  ideal_self: string[];
  driving_forces: string[];
}

/** @deprecated persona에 trend만 유지할 예정 */
export interface UserPersonaPatterns {
  flow_moments: string[];
  stumbling_blocks: string[];
  energy_sources: string[];
}

/** @deprecated persona에 trend만 유지할 예정 */
export interface UserPersonaContext {
  active_quests: string[];
  weekly_summary: string;
}

/** @deprecated persona에 trend만 유지할 예정 */
export interface UserPersonaGrowthInsights {
  self_clarity_index: number;
  pattern_balance_score: number;
  self_clarity_rationale: string;
  pattern_balance_rationale: string;
}
