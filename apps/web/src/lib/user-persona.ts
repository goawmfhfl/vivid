import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptJsonbFields } from "./jsonb-encryption";
import type { JsonbValue } from "./jsonb-encryption";

/**
 * user_persona를 선택적으로 조회. 없거나 에러 시 null 반환 (throw 없음).
 */
export async function fetchUserPersonaOptional(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from("user_persona")
      .select("persona")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      return null;
    }

    if (!data?.persona) {
      return null;
    }

    const decrypted = decryptJsonbFields(data.persona as JsonbValue);
    if (
      typeof decrypted !== "object" ||
      decrypted === null ||
      Array.isArray(decrypted)
    ) {
      return null;
    }
    return decrypted as Record<string, unknown>;
  } catch {
    return null;
  }
}

const PERSONA_INTRO =
  "아래는 해당 사용자의 페르소나입니다. 이 내용을 기억하고, 리포트·피드백 작성 시 이 사용자의 성향과 최근 맥락에 맞게 반영하세요.";
const PERSONA_OUTRO =
  "위 페르소나를 참고해 이 사용자에 맞는 톤과 인사이트로 작성하세요.";

function joinList(arr: unknown[] | undefined): string {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr.filter((x) => typeof x === "string").join(", ");
}

/**
 * 페르소나 객체를 프롬프트에 넣을 한 블록 문자열로 포맷.
 * 1.3 "기억하라" 안내는 프롬프트 조립 쪽에서 앞뒤로 붙이므로 여기서는 본문만 반환.
 */
export function formatPersonaForPrompt(
  persona: Record<string, unknown>
): string {
  const lines: string[] = [];

  const identity = persona.identity as Record<string, unknown> | undefined;
  if (identity && typeof identity === "object") {
    const traits = joinList(identity.traits as unknown[] | undefined);
    const ideal = joinList(identity.ideal_self as unknown[] | undefined);
    const forces = joinList(identity.driving_forces as unknown[] | undefined);
    if (traits || ideal || forces) {
      const parts = [
        traits && `특성: ${traits}`,
        ideal && `지향하는 자아: ${ideal}`,
        forces && `원동력: ${forces}`,
      ].filter(Boolean);
      if (parts.length) {
        lines.push(`- 정체성·지향: ${parts.join(" / ")}`);
      }
    }
  }

  const patterns = persona.patterns as Record<string, unknown> | undefined;
  if (patterns && typeof patterns === "object") {
    const flow = joinList(patterns.flow_moments as unknown[] | undefined);
    const blocks = joinList(patterns.stumbling_blocks as unknown[] | undefined);
    const energy = joinList(patterns.energy_sources as unknown[] | undefined);
    const parts = [
      flow && `몰입 순간: ${flow}`,
      blocks && `걸림돌: ${blocks}`,
      energy && `에너지원: ${energy}`,
    ].filter(Boolean);
    if (parts.length) {
      lines.push(`- 패턴(몰입/걸림돌/에너지): ${parts.join(" / ")}`);
    }
  }

  const context = persona.context as Record<string, unknown> | undefined;
  if (context && typeof context === "object") {
    const quests = joinList(context.active_quests as unknown[] | undefined);
    const summary =
      typeof context.weekly_summary === "string"
        ? context.weekly_summary
        : "";
    if (quests || summary) {
      const parts = [
        quests && `활성 퀘스트: ${quests}`,
        summary && `주간 요약: ${summary}`,
      ].filter(Boolean);
      if (parts.length) {
        lines.push(`- 최근 맥락·퀘스트: ${parts.join(" / ")}`);
      }
    }
  }

  if (lines.length === 0) return "";
  return lines.join("\n");
}

/**
 * 프롬프트에 넣을 전체 페르소나 블록 (1.3 "기억하라" 문구 + 본문).
 * persona가 null이거나 formatPersonaForPrompt가 빈 문자열이면 "" 반환.
 */
export function buildPersonaContextBlock(
  persona: Record<string, unknown> | null
): string {
  if (!persona || typeof persona !== "object") return "";
  const body = formatPersonaForPrompt(persona);
  if (!body) return "";
  return `${PERSONA_INTRO}\n\n[사용자 페르소나 참고]\n${body}\n\n${PERSONA_OUTRO}`;
}
