type MetricName =
  | "reflection_continuity"
  | "identity_coherence";

type MetricSnapshot = Record<MetricName, number> & {
  period_start: string;
  period_end: string;
  source_count: number;
};

type BuildWeeklyTrendsPromptParams = {
  currentWeek: MetricSnapshot;
  previousWeeks: MetricSnapshot[];
  validWeeks: number;
  recordEvidenceContext: string;
};

function formatWeekLabel(start: string, end: string): string {
  return `${start} ~ ${end}`;
}

const METRIC_LABELS: Record<MetricName, string> = {
  reflection_continuity: "꾸준히 기록하기",
  identity_coherence: "나에 대한 이야기",
};

function buildMetricSeriesLines(allWeeks: MetricSnapshot[], metricName: MetricName): string {
  return allWeeks
    .map((week, index) => {
      const label = index === allWeeks.length - 1 ? "이번 주" : `${allWeeks.length - 1 - index}주 전`;
      return `  - ${label} (${formatWeekLabel(week.period_start, week.period_end)}): ${week[metricName]}%`;
    })
    .join("\n");
}

export function buildWeeklyUserTrendsPrompt(
  params: BuildWeeklyTrendsPromptParams
): string {
  const { currentWeek, previousWeeks, validWeeks, recordEvidenceContext } = params;
  const allWeeks = [...previousWeeks, currentWeek];
  const metricBlocks = (Object.keys(METRIC_LABELS) as MetricName[]).map((metricName) => {
    const title = METRIC_LABELS[metricName];
    return [`[${title}]`, buildMetricSeriesLines(allWeeks, metricName)].join("\n");
  });

  const sourceLines = allWeeks
    .map(
      (week) =>
        `- ${formatWeekLabel(week.period_start, week.period_end)}: 원천 기록 ${week.source_count}개`
    )
    .join("\n");

  return `
최근 주간 user_trends 지표를 바탕으로 변화 인사이트를 생성하세요.

[유효 주차 수]
${validWeeks}

[주차별 지표(퍼센트)]
${metricBlocks.join("\n\n")}

[주차별 원천 기록 수]
${sourceLines}

[이번 주 실제 기록 근거]
${recordEvidenceContext}

[출력 요구]
- 지표별 score_reason_summary는 한 문장으로 간결하게 작성
- 지표별 score_reason_items는 최대 5개
- 지표별 score_evidence_items는 최대 5개
- 지표별 flow_insight는 4주 흐름의 상승/정체/하락 패턴을 설명
- overall_summary는 2개 지표 종합 1~2문장
- 데이터가 부족하면 억지 추정하지 말고 빈 배열/빈 문자열로 반환
- "이번 주"는 반드시 ${currentWeek.period_start} ~ ${currentWeek.period_end}를 의미
- score_evidence_items에는 가능한 경우 날짜/기록 타입/행동 패턴 근거를 포함
`.trim();
}
