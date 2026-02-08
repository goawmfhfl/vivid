import type { Report, TrendData } from "@/types/daily-vivid";

type DailyVividPersonaRecord = {
  report_date: string;
  day_of_week: string | null;
  report: Report | null;
  trend: TrendData | null;
  created_at: string;
};

function formatReportSummary(report: Report | null): string {
  if (!report) return "리포트 없음";

  return [
    report.current_summary ? `- Q1 요약: ${report.current_summary}` : null,
    report.future_summary ? `- Q2 요약: ${report.future_summary}` : null,
    report.retrospective_summary
      ? `- Q3 요약: ${report.retrospective_summary}`
      : "- Q3 요약: 없음",
    report.user_characteristics?.length
      ? `- 사용자 특성: ${report.user_characteristics.join(", ")}`
      : null,
    report.aspired_traits?.length
      ? `- 지향 모습: ${report.aspired_traits.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatTrendSummary(trend: TrendData | null): string {
  if (!trend) return "트렌드 없음";

  return [
    trend.aspired_self ? `- 지향하는 모습: ${trend.aspired_self}` : null,
    trend.interest ? `- 관심사: ${trend.interest}` : null,
    trend.immersion_moment ? `- 몰입 순간: ${trend.immersion_moment}` : null,
    trend.personality_trait ? `- 성향: ${trend.personality_trait}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildUserPersonaPrompt(params: {
  records: DailyVividPersonaRecord[];
  startDate: string;
  endDate: string;
  existingPersona: Record<string, unknown> | null;
}): string {
  const { records, startDate, endDate, existingPersona } = params;

  const header = `아래는 ${startDate}부터 ${endDate}까지 최근 7일간의 Daily Vivid 리포트 요약입니다.
각 날짜는 Q1(현재), Q2(미래 비전), Q3(회고)을 기반으로 생성된 리포트입니다.`;

  const body = records
    .map((record, index) => {
      const title = `${index + 1}. ${record.report_date}${
        record.day_of_week ? ` (${record.day_of_week})` : ""
      }`;
      const reportSummary = formatReportSummary(record.report);
      const trendSummary = formatTrendSummary(record.trend);

      return [title, reportSummary, trendSummary].join("\n");
    })
    .join("\n\n");

  const personaSection = existingPersona
    ? `\n\n[기존 User Persona]\n${JSON.stringify(existingPersona, null, 2)}`
    : "\n\n[기존 User Persona]\n없음";

  return `${header}\n\n${body}${personaSection}\n\n위 정보를 바탕으로 새로운 User Persona를 생성하세요.`;
}
