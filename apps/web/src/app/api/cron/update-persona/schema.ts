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
      trend: {
        type: "object",
        properties: {
          aspired_self: { type: "string" },
          interest: { type: "string" },
          immersion_moment: { type: "string" },
          personality_trait: { type: "string" },
        },
        required: ["aspired_self", "interest", "immersion_moment", "personality_trait"],
      },
      growth_insights: {
        type: "object",
        properties: {
          self_clarity_index: { type: "number", minimum: 0, maximum: 100 },
          pattern_balance_score: { type: "number", minimum: 0, maximum: 100 },
          vision_consistency_score: { type: "number", minimum: 0, maximum: 100 },
          self_clarity_rationale: { type: "string" },
          pattern_balance_rationale: { type: "string" },
          vision_consistency_rationale: { type: "string" },
        },
        required: [
          "self_clarity_index",
          "pattern_balance_score",
          "vision_consistency_score",
          "self_clarity_rationale",
          "pattern_balance_rationale",
          "vision_consistency_rationale",
        ],
      },
    },
    required: ["identity", "patterns", "context", "trend", "growth_insights"],
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
- 배열 필드는 각각 최대 5개 항목만 출력하세요: identity.traits, identity.ideal_self, identity.driving_forces, patterns.flow_moments, patterns.stumbling_blocks, patterns.energy_sources, context.active_quests 모두 최대 5개.

trend: 최근 7일 요약 기준으로 "지향하는 나의 모습(aspired_self)", "관심사(interest)", "몰입 희망 순간(immersion_moment)", "나라는 사람 성향(personality_trait)"을 각 한 문장으로 작성하세요.

growth_insights: 기록과 페르소나를 바탕으로 0-100 점수와 근거를 작성하세요.
- self_clarity_index: 정체성·지향이 얼마나 명확한지. self_clarity_rationale에 한 문장 근거.
- pattern_balance_score: 몰입·에너지 vs 걸림돌 균형. pattern_balance_rationale에 한 문장 근거.
- vision_consistency_score: 지향하는 모습/비전이 요즘 얼마나 일관되는지. vision_consistency_rationale에 한 문장 근거.

`.trim();
