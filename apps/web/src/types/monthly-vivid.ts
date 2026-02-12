// ============================================
// Monthly Vivid 타입 정의
// ============================================

export type MonthlyVivid = {
  id?: string;
  month: string; // "YYYY-MM"
  month_label: string; // "2025년 11월"
  date_range: {
    start_date: string; // "YYYY-MM-DD"
    end_date: string; // "YYYY-MM-DD"
  };
  total_days: number;
  recorded_days: number;
  title: string | { title?: string };
  report: MonthlyReport;
  trend?: MonthlyTrendData | null;
  is_ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
  generation_duration_seconds?: number; // 피드백 생성에 소요된 시간 (초 단위)
};

/**
 * Monthly Vivid 리스트 아이템 타입 (가벼운 데이터만 포함)
 */
export type MonthlyVividListItem = {
  id: string;
  month: string; // "YYYY-MM"
  month_label: string; // "2025년 11월"
  date_range: {
    start_date: string; // "YYYY-MM-DD"
    end_date: string; // "YYYY-MM-DD"
  };
  recorded_days: number;
  title: string;
  monthly_score: number;
  is_ai_generated?: boolean;
  created_at?: string;
};

// ============================================
// Monthly Report (기존 Vivid Report 구조)
// ============================================
export type MonthlyReport = {
  // 1. 비전 진화 스토리 (30%)
  vision_evolution: {
    core_visions: Array<{
      vision: string;
      consistency: number; // 0-1
      first_date: string;
      last_date: string;
      evolution_story: string;
    }>;
    priority_shifts: Array<{
      from: string;
      to: string;
      when: string;
      why: string;
    }>;
  };

  // 2. 현재-미래 일치도 분석 (25%)
  alignment_analysis: {
    gap_analysis: {
      biggest_gaps: Array<{
        current_state: string;
        desired_state: string;
        gap_description: string;
        actionable_steps: string[];
      }>;
    };
  };

  // 3. 하루 패턴 인사이트 (20%)
  daily_life_patterns: {
    recurring_patterns: Array<{
      pattern: string;
      frequency: number;
      days: Array<{
        date: string;
        summary: string;
      }>;
      impact: "positive" | "neutral" | "negative";
      why_it_matters: string;
    }>;
    weekly_evolution: Array<{
      week: number;
      dominant_activities: string[];
      dominant_keywords: string[];
      narrative: string;
    }>;
    evaluation_themes: {
      strengths: Array<{
        theme: string;
        frequency: number;
        examples: string[];
        how_to_maintain: string;
      }>;
      improvements: Array<{
        theme: string;
        frequency: number;
        examples: string[];
        actionable_steps: string[];
      }>;
    };
  };

  // 4. 특성-비전 매칭 (15%)
  identity_alignment: {
    trait_mapping: Array<{
      current: string;
      aspired: string;
      match_score: number; // 0-1
      gap_description: string;
      progress_evidence: string[];
    }>;
    trait_evolution: {
      strengthened: Array<{
        trait: string;
        early_month: string;
        late_month: string;
        evidence: string[];
      }>;
      emerging: Array<{
        trait: string;
        first_date: string;
        frequency: number;
      }>;
      fading: Array<{
        trait: string;
        last_date: string;
        last_appeared: string;
        why: string;
      }>;
    };
    focus_traits?: Array<{
      trait: string;
      current_state: string;
      desired_state: string;
      monthly_action: string;
    }>;
  };

  // 5. 다음 달 계획 (10%)
  next_month_plan: {
    focus_areas?: Array<{
      area: string;
      why: string;
      current_state: string;
      desired_state: string;
      simple_action: string;
    }>;
    maintain_patterns?: Array<{
      pattern: string;
      why_important: string;
      how_to_maintain: string;
    }>;
    experiment_patterns?: Array<{
      pattern: string;
      why_suggested: string;
      how_to_start: string;
    }>;
    top_3_focuses: Array<{
      focus: string;
      why_now: string;
      simple_action: string;
    }>;
    risky_areas: Array<{
      risk: string;
      sign: string;
      simple_guard: string;
    }>;
  };

  // Pro 모드에서만 제공되는 정체성 분석
  this_month_identity?: {
    visualization?: {
      characteristics_radar: {
        type: "radar";
        data: Array<{
          characteristic: string;
          value: number;
        }>;
      };
    };
  };
};

// ============================================
// Monthly Trend Data (월간 흐름 - 4가지 인사이트)
// ============================================
export type MonthlyTrendData = {
  recurring_self: string; // 가장 자주 드러나는 나의 모습
  effort_to_keep: string; // 지키기 위해서 노력했던 것
  most_meaningful: string; // 내게 가장 의미가 있었던 것
  biggest_change: string; // 발생한 가장 큰 변화
};

// ============================================
// Monthly Trends Response (최근 4달 데이터 - user_trends 기반)
// 각 항목은 [26년1월]: 텍스트 형식
// ============================================
export type MonthlyTrendsResponse = {
  recurring_self: string[];
  effort_to_keep: string[];
  most_meaningful: string[];
  biggest_change: string[];
};
