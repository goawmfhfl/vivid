export type Entry = {
  id: string;
  type: "insight" | "feedback" | "visualizing";
  content: string;
  timestamp: Date;
};

export type DailyFeedback = {
  date: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
};

export type DailyFeedbackPayload = {
  date: string; // "2025-10-21"
  lesson: string;
  keywords: string[]; // ["#몰입", "#자기효능감", "#루틴"]
  observation: string;
  insight: string;
  action_feedback: {
    well_done: string;
    to_improve: string;
  };
  focus_tomorrow: string;
  focus_score: number; // 0~10
  satisfaction_score: number; // 0~10
};

export type PeriodSummary = {
  id: string;
  period: string;
  type: "weekly" | "monthly";
  dateRange: string;
  totalEntries: number;
  overview: string;
  keyInsights: string[];
  emotionalTrends: string;
  growthAreas: string[];
  highlights: string[];
  nextSteps: string;
  createdAt: Date;
  weekNumber?: number; // For weekly summaries
  monthNumber?: number; // For monthly summaries
  year?: number;
  // New fields for contextual analysis
  week?: string; // "2025-W43"
  month?: string; // "2025-10"
  summary?: string; // 주간/월간 전체 요약
  insight_core?: string; // 핵심 인사이트
  growth_area?: string; // 성장 영역
  dominant_keywords?: string[]; // ["루틴", "AI활용", "집중", "성찰"]
  pattern_summary?: string; // 행동 패턴 요약
  trend_changes?: string; // 트렌드 변화
  strengths?: string[]; // 강점 분석
  weaknesses?: string[]; // 약점 분석
  growth_direction?: string; // 성장 방향
  representative_sentence?: string; // 대표 문장
  // Monthly-specific fields
  keyword_trend?: {
    increased: string[];
    decreased: string[];
  };
  behavior_pattern?: string;
  growth_curve?: {
    focus_score_avg: number;
    satisfaction_trend: string | number;
    consistency: number;
  };
  insight_summary?: string;
  action_recommendation?: string[];
  weekly_refs?: Array<{ week: string; note?: string }>;
};

// Generate dummy summaries
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateDummySummaries = (): PeriodSummary[] => {
  const summaries: PeriodSummary[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Generate weekly summaries (last 15 weeks)
  for (let i = 0; i < 15; i++) {
    const weekNumber = Math.max(
      1,
      Math.ceil(
        (now.getTime() - new Date(currentYear, 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      ) - i
    );
    const year = weekNumber <= 0 ? currentYear - 1 : currentYear;
    const actualWeek = weekNumber <= 0 ? 52 + weekNumber : weekNumber;

    const firstDayOfYear = new Date(year, 0, 1);
    const weekStart = new Date(firstDayOfYear);
    weekStart.setDate(
      firstDayOfYear.getDate() + (actualWeek - 1) * 7 - firstDayOfYear.getDay()
    );
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const monthName = weekStart
      .toLocaleDateString("ko-KR", { month: "long" })
      .replace("월", "");

    summaries.push({
      id: `weekly-${year}-${actualWeek}`,
      period: `${monthName}월 ${actualWeek}주차`,
      type: "weekly",
      dateRange: `${weekStart.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })} - ${weekEnd.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })}`,
      totalEntries: Math.floor(Math.random() * 20) + 5,
      overview:
        "이번 주는 자기 성찰과 업무 효율성 사이에서 균형을 찾으려는 노력이 돋보였습니다. 감정적으로는 안정적이었으나, 가끔 과부하를 느끼는 순간들이 있었습니다.",
      keyInsights: [
        "아침 루틴이 하루 전체의 생산성에 큰 영향을 미친다는 것을 발견했어요",
        "타인의 피드백을 수용하는 능력이 향상되었어요",
        "감정 기복이 있을 때 글쓰기가 효과적인 대처법임을 깨달았어요",
      ],
      emotionalTrends:
        "주 초반에는 에너지가 높았으나, 주 중반 약간의 피로감을 느꼈습니다. 주말로 갈수록 회복되는 패턴을 보였어요.",
      growthAreas: [
        "스트레스 관리: 업무 과부하 시 조기에 감지하고 대응하기",
        '경계 설정: 타인의 요청에 적절히 "아니오"라고 말하기',
      ],
      highlights: [
        "어려운 대화를 피하지 않고 솔직하게 나눴어요",
        "새로운 기술을 배우는 데 시간을 투자했어요",
        "운동 루틴을 3일 연속 지켰어요",
      ],
      nextSteps:
        '다음 주에는 하루 10분 명상 루틴을 추가하고, 업무 시작 전 "오늘의 우선순위 3가지"를 정하는 습관을 만들어보세요. 또한 주 중 하루는 디지털 디톡스 시간을 가져보세요.',
      createdAt: new Date(year, 0, 1 + (actualWeek - 1) * 7),
      weekNumber: actualWeek,
      year,
      // New contextual analysis fields
      week: `${year}-W${actualWeek}`,
      dominant_keywords: ["루틴", "AI활용", "집중", "성찰"],
      pattern_summary:
        "오전 시간대 집중력은 안정적이지만 주말엔 루틴이 흔들리는 경향이 있습니다.",
      trend_changes:
        '"불안", "피로" 언급이 줄고 "실행", "몰입" 표현이 증가했습니다.',
      strengths: [
        "기록 루틴의 일관성 강화",
        "자기 피드백의 구체성 향상",
        "AI 도구 활용 효율 상승",
      ],
      weaknesses: [
        "식습관 루틴 불안정",
        "수면 패턴 불균형",
        "피로 누적으로 인한 생산성 저하",
      ],
      growth_direction: "실행 중심에서 시스템 중심으로 확장되는 단계",
      representative_sentence:
        "루틴이 삶의 중심이 될수록, 의식적 노력은 줄어든다.",
    });
  }

  // Generate monthly summaries (last 6 months)
  for (let i = 0; i < 6; i++) {
    let month = currentMonth - i;
    let year = currentYear;

    if (month <= 0) {
      month = 12 + month;
      year = currentYear - 1;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    summaries.push({
      id: `monthly-${year}-${month}`,
      period: `${year}년 ${month}월`,
      type: "monthly",
      dateRange: `${startDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
      })}`,
      totalEntries: Math.floor(Math.random() * 60) + 20,
      overview:
        "이번 달은 성장과 도전의 시간이었습니다. 새로운 시도를 두려워하지 않았고, 실패에서도 배움을 얻으려는 자세가 인상적이었습니다. 전반적으로 자기 인식 수준이 높아진 한 달이었습니다.",
      keyInsights: [
        "장기적 목표를 세우고 작은 단계로 나누어 실행하는 능력이 생겼어요",
        "자기 돌봄의 중요성을 인지하고 실천하기 시작했어요",
        "완벽주의 성향을 조금씩 내려놓고 과정을 즐기게 되었어요",
        "의미 있는 관계에 더 많은 에너지를 투자하게 되었어요",
      ],
      emotionalTrends:
        "월 초에는 새로운 시작에 대한 설렘이 컸고, 중반에는 현실적인 어려움과 마주하며 감정 기복이 있었습니다. 월말로 갈수록 안정감을 되찾고 성취감을 느꼈어요.",
      growthAreas: [
        "일관성: 좋은 습관을 꾸준히 유지하는 능력 기르기",
        "자기 연민: 실수나 실패 후 자신을 너무 가혹하게 대하지 않기",
        "깊은 집중: 산만함을 줄이고 몰입하는 시간 늘리기",
      ],
      highlights: [
        "중요한 프로젝트를 성공적으로 마무리했어요",
        "오랜만에 가족과 깊은 대화를 나눴어요",
        "건강 검진을 받고 자기 관리를 시작했어요",
        "새로운 취미를 발견하고 즐겼어요",
      ],
      nextSteps:
        "다음 달에는 월초에 구체적인 목표를 3개 설정하고, 매주 진행 상황을 점검해보세요. 또한 월 2회 자연 속에서 산책하는 시간을 계획에 포함시키고, 감사 일기를 주 3회 이상 작성해보세요.",
      createdAt: new Date(year, month - 1, 1),
      monthNumber: month,
      year,
      // New contextual analysis fields
      month: `${year}-${String(month).padStart(2, "0")}`,
      dominant_keywords: ["성장", "도전", "실행", "균형", "성찰"],
      pattern_summary:
        "월초 에너지가 높고 실행력이 강하나, 월말로 갈수록 피로도가 누적되는 패턴을 보입니다.",
      trend_changes:
        "감정 표현에서 행동 기록으로, 수동적 관찰에서 능동적 실험으로 변화하고 있습니다.",
      strengths: [
        "장기 목표 설정 능력 향상",
        "자기 돌봄 실천 증가",
        "성찰의 깊이 심화",
        "실행과 휴식의 균형 개선",
      ],
      weaknesses: [
        "일관성 유지의 어려움",
        "번아웃 예방 미흡",
        "휴식과 실행의 균형 부족",
        "장기 계획 추적 부족",
      ],
      growth_direction: "계획 → 실행 → 최적화 사이클 구축 중",
      representative_sentence:
        "성장은 완벽한 계획이 아니라, 불완전한 실행의 반복에서 시작된다.",
      // Monthly-specific fields
      keyword_trend: {
        increased: ["AI활용", "실행력", "시스템화"],
        decreased: ["불안", "피로", "산만함"],
      },
      behavior_pattern:
        "기록과 운동 루틴이 평일에 완전히 습관화되고, 주말엔 변동성이 줄어들었다.",
      growth_curve: {
        focus_score_avg: 8.2,
        satisfaction_trend: "+12%",
        consistency: 0.9,
      },
      insight_summary:
        "결과보다 과정에 집중하는 태도가 강화되며 자기확신이 뚜렷해졌다.",
      action_recommendation: [
        "매일의 실행을 시스템 단위로 자동화할 것",
        "루틴 점검일(주 1회)을 고정하여 회고 리듬 유지",
        "다음 달엔 '루틴 → 창의성' 단계로 확장",
      ],
      weekly_refs: [
        { week: "2025-W41", note: "집중도 반등의 시작점" },
        { week: "2025-W43", note: "만족도 상승을 견인한 주" },
      ],
    });
  }

  return summaries;
};
