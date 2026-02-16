/** 주간 성장 인사이트(trend) 스키마 - weekly-vivid/recent-trends에서 사용 */
export const WeeklyTrendDataSchema = {
  name: "WeeklyTrendData",
  schema: {
    type: "object",
    properties: {
      direction: { type: "string" },
      core_value: { type: "string" },
      driving_force: { type: "string" },
      current_self: { type: "string" },
    },
    required: ["direction", "core_value", "driving_force", "current_self"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_WEEKLY_TREND = `
당신은 사용자의 주간 일일 비비드 기록을 분석하여 주간 흐름(성장 인사이트)을 생성합니다.
- direction: 이번 주의 기록을 통해 드러난 사용자가 가고 있는 방향을 한 문장으로
- core_value: 이번 주의 기록에서 가장 중요하게 여기는 가치를 한 문장으로
- driving_force: 이번 주를 움직인 실제 원동력을 한 문장으로
- current_self: 요즘의 사용자를 한 문장으로 표현
각 필드는 간결하고 명확하게, 한국어로 작성하세요.
`.trim();
