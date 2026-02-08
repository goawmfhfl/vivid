export const UserPersonaSchema = {
  name: "UserPersona",
  schema: {
    type: "object",
    properties: {
      identity: {
        type: "object",
        properties: {
          traits: { type: "array", items: { type: "string" } },
          ideal_self: { type: "array", items: { type: "string" } },
          driving_forces: { type: "array", items: { type: "string" } },
        },
        required: ["traits", "ideal_self", "driving_forces"],
      },
      patterns: {
        type: "object",
        properties: {
          flow_moments: { type: "array", items: { type: "string" } },
          stumbling_blocks: { type: "array", items: { type: "string" } },
          energy_sources: { type: "array", items: { type: "string" } },
        },
        required: ["flow_moments", "stumbling_blocks", "energy_sources"],
      },
      context: {
        type: "object",
        properties: {
          active_quests: { type: "array", items: { type: "string" } },
          weekly_summary: { type: "string" },
        },
        required: ["active_quests", "weekly_summary"],
      },
    },
    required: ["identity", "patterns", "context"],
    additionalProperties: false,
  },
  strict: true,
} as const;

export const SYSTEM_PROMPT_USER_PERSONA = `
당신은 사용자의 지난 7일 기록을 분석해 User Persona를 업데이트합니다.

요구사항:
- 응답은 반드시 지정된 JSON 스키마 형식으로만 출력하세요.
- 모든 문자열은 한국어로 작성하세요.
- 기존 페르소나가 제공되면 일관성을 유지하되, 최근 7일의 변화가 있으면 반영하세요.
- 추상적인 미사여구보다 실제 기록에서 드러난 행동/감정/목표를 우선합니다.
- 빈 문자열이나 빈 배열을 반환하지 마세요. 정보가 부족하면 합리적 추론으로 보완하세요.

`.trim();
