import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import {
  decryptDailyVivid,
  encryptJsonbFields,
} from "@/lib/jsonb-encryption";
import type { JsonbValue } from "@/lib/jsonb-encryption";
import { fetchUserPersonaOptional } from "@/lib/user-persona";
import { verifySubscription } from "@/lib/subscription-utils";
import { generateDailyVividInsight } from "../../ai-service-stream";
import { API_ENDPOINTS } from "@/constants";
import type { Report, DailyVividInsight } from "@/types/daily-vivid";

/**
 * POST: Daily Vivid 인사이트 생성 (Pro 전용)
 * 오늘의 계획과 user_persona 기반 일치도 분석 + 행동 제안
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const userId = body.userId as string | undefined;
    const forceRegenerate = body.forceRegenerate === true;

    if (!userId?.trim()) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!id?.trim()) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { isPro } = await verifySubscription(userId);
    if (!isPro) {
      return NextResponse.json(
        { error: "Pro subscription required for insight" },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: row, error } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch daily vivid: ${error.message}`);
    }

    if (!row) {
      return NextResponse.json(
        { error: "Daily vivid not found" },
        { status: 404 }
      );
    }

    const decrypted = decryptDailyVivid(
      row as unknown as { [key: string]: unknown }
    ) as {
      report?: Report | null;
      insight?: DailyVividInsight | null;
      insight_message?: string | null;
      is_vivid_ai_generated?: boolean;
    };

    // type=vivid(비비드)일 때만 인사이트 생성/반환
    const rowType = row.type ?? (row.is_vivid_ai_generated === true ? "vivid" : "review");
    if (rowType !== "vivid") {
      return NextResponse.json(
        { error: "Insight is only available for vivid type (not review)" },
        { status: 400 }
      );
    }

    // 기존 구조화된 인사이트가 있으면 즉시 반환 (forceRegenerate 요청 시 제외)
    if (!forceRegenerate && decrypted.insight && typeof decrypted.insight === "object") {
      const insight = decrypted.insight as DailyVividInsight;
      if (
        (insight.feedback?.length ?? 0) > 0 ||
        (insight.improvements?.length ?? 0) > 0
      ) {
        return NextResponse.json({ insight }, { status: 200 });
      }
    }

    // 하위 호환: insight 없고 insight_message만 있으면 summary 형태로 반환 (forceRegenerate 시 제외)
    if (!forceRegenerate && decrypted.insight_message?.trim()) {
      return NextResponse.json(
        {
          insight: {
            feedback: [],
            improvements: [],
            summary: decrypted.insight_message,
          } satisfies DailyVividInsight,
        },
        { status: 200 }
      );
    }

    const report = decrypted.report;
    if (!report) {
      return NextResponse.json(
        { error: "Report not found for insight generation" },
        { status: 400 }
      );
    }

    const persona = await fetchUserPersonaOptional(supabase, userId);
    if (!persona || typeof persona !== "object") {
      // persona 없을 때 400 대신 안내용 인사이트 반환 (UI에서 "페르소나 업데이트 필요" 표시 가능)
      return NextResponse.json(
        {
          insight: {
            feedback: [],
            improvements: [],
            summary: "페르소나를 설정해 주시면 맞춤 인사이트를 받을 수 있습니다.",
          } satisfies DailyVividInsight,
        },
        { status: 200 }
      );
    }

    const { data: profile } = await supabase
      .from(API_ENDPOINTS.PROFILES)
      .select("name")
      .eq("id", userId)
      .maybeSingle();
    const userName = (profile?.name as string)?.trim() || undefined;

    const insight = await generateDailyVividInsight(
      report,
      persona,
      userName,
      userId
    );

    const encryptedInsight = encryptJsonbFields(insight as unknown as JsonbValue);

    const { error: updateError } = await supabase
      .from(API_ENDPOINTS.DAILY_VIVID)
      .update({
        insight: encryptedInsight,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to save insight: ${updateError.message}`);
    }

    return NextResponse.json({ insight }, { status: 200 });
  } catch (error) {
    console.error("[insight] API error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
