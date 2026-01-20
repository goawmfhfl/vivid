// ============================================
// 주간 비비드 타입 정의
// ============================================

export type WeekRange = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone: string; // "Asia/Seoul"
};

// ============================================
// Weekly Report (주간 비비드 분석)
// ============================================
export type WeeklyReport = {
  // 1. 주간 비비드 요약
  weekly_vivid_summary: {
    summary: string; // 300자 내외
    key_points: Array<{
      point: string;
      dates: string[]; // ["2025-12-17", "2025-12-18"]
    }>;
    next_week_vision_key_points: string[];
  };

  // 2. 주간 키워드 분석
  weekly_keywords_analysis: {
    vision_keywords_trend: Array<{
      keyword: string;
      days: number;
      context: string;
      related_keywords: string[];
    }>; // 기존 vision_keywords_trend와 동일한 구조, 최대 8개, 홀수 개수(4, 6, 8개)
  };

  // 3. 앞으로의 모습 종합 분석
  future_vision_analysis: {
    integrated_summary: string;
    consistency_analysis: {
      consistent_themes: string[];
      changing_themes: string[];
      analysis: string;
    };
    evaluation_trend: Array<{
      date: string;
      evaluation_score: number; // future_evaluation에서 추출한 점수
    }>;
  };

  // 4. 일치도 트렌드 분석
  alignment_trend_analysis: {
    daily_alignment_scores: Array<{
      date: string;
      score: number;
    }>;
    highest_alignment_day: {
      date: string;
      score: number;
      pattern: string;
    };
    lowest_alignment_day: {
      date: string;
      score: number;
      pattern: string;
    };
    trend: "improving" | "declining" | "stable";
  };

  // 5. 사용자 특징 심화 분석
  user_characteristics_analysis: {
    consistency_summary: string;
    top_5_characteristics: Array<{
      characteristic: string;
      frequency: number;
      dates: string[];
    }>;
    change_patterns: {
      new_characteristics: Array<{
        characteristic: string;
        first_appeared: string;
      }>;
      disappeared_characteristics: Array<{
        characteristic: string;
        last_appeared: string;
      }>;
    };
  };

  // 6. 지향하는 모습 심화 분석
  aspired_traits_analysis: {
    consistency_summary: string;
    top_5_aspired_traits: Array<{
      trait: string;
      frequency: number;
      dates: string[];
    }>;
    evolution_process: {
      summary: string;
      stages: Array<{
        period: string;
        traits: string[];
        description: string;
      }>;
    };
  };

  // 7. 주간 인사이트
  weekly_insights: {
    patterns: Array<{
      pattern: string;
      description: string;
      evidence: string[];
    }>;
    unexpected_connections: Array<{
      connection: string;
      description: string;
      significance: string;
    }>;
  };
};

// Weekly Trend 데이터 타입 (주간 흐름 섹션용)
export type WeeklyTrendData = {
  direction: string; // 어떤 방향으로 가고 있는 사람인가
  core_value: string; // 내가 진짜 중요하게 여기는 가치 (한 문장)
  driving_force: string; // 나를 움직이는 실제 원동력
  current_self: string; // 요즘의 나라는 사람 (한 문장)
};

// ============================================
// Weekly Vivid (메인 타입)
// ============================================
export type WeeklyVivid = {
  id?: string;
  week_range: WeekRange;
  report: WeeklyReport;
  title?: string; // "~ 했던 주" 형식의 제목 (예: "개발과 운동에 집중했던 주")
  trend?: WeeklyTrendData | null; // 주간 흐름 데이터 (JSONB)
  // 메타 정보
  is_ai_generated?: boolean;
  created_at?: string;
};

// ============================================
// 리스트용 가벼운 타입
// ============================================
export type WeeklyVividListItem = {
  id: string;
  title: string;
  week_range: {
    start: string;
    end: string;
  };
  is_ai_generated?: boolean;
  created_at?: string;
};

// ============================================
// API 요청 타입
// ============================================
export type WeeklyVividGenerateRequest = {
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  timezone?: string; // default "Asia/Seoul"
};
