import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-service";
import { decryptDailyFeedback } from "@/lib/jsonb-encryption";
import type { DailyFeedbackRow } from "@/types/daily-feedback";
import { API_ENDPOINTS } from "@/constants";

interface RecentTrendsResponse {
  emotionData: Array<{
    date: string;
    valence: number | null;
    arousal: number | null;
    quadrant: string | null;
  }>;
  aspired_self: string[];
  interests: string[];
  personalityStrengths: string[];
  immersionSituations: string[];
  reliefSituations: string[];
}

/**
 * GET 핸들러: 최근 5일의 daily-feedback 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 최근 5일의 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // 최근 5일의 daily-feedback 데이터 조회 (필요한 컬럼만 선택)
    const { data, error } = await supabase
      .from(API_ENDPOINTS.DAILY_FEEDBACK)
      .select("report_date, emotion_report, final_report")
      .in("report_date", dates);

    if (error) {
      throw new Error(`Failed to fetch daily feedback: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json<RecentTrendsResponse>(
        {
          emotionData: [],
          aspired_self: [],
          interests: [],
          personalityStrengths: [],
          immersionSituations: [],
          reliefSituations: [],
        },
        { status: 200 }
      );
    }

    // 데이터 복호화 처리
    const decryptedData = data.map((item) =>
      decryptDailyFeedback(item as unknown as { [key: string]: unknown })
    ) as unknown as Pick<
      DailyFeedbackRow,
      "report_date" | "emotion_report" | "final_report"
    >[];

    // 감정 데이터 추출 (emotion_report가 있는 경우만)
    const emotionData: RecentTrendsResponse["emotionData"] = [];
    const aspired_selfSet = new Set<string>();
    const interestsSet = new Set<string>();
    const personalityStrengthsSet = new Set<string>();
    const immersionSituationsSet = new Set<string>();
    const reliefSituationsSet = new Set<string>();

    for (const item of decryptedData) {
      const date = item.report_date;

      // 감정 데이터 추출
      if (
        item.emotion_report &&
        typeof item.emotion_report === "object" &&
        item.emotion_report !== null &&
        "ai_mood_valence" in item.emotion_report &&
        "ai_mood_arousal" in item.emotion_report &&
        item.emotion_report.ai_mood_valence !== null &&
        item.emotion_report.ai_mood_arousal !== null
      ) {
        emotionData.push({
          date,
          valence: item.emotion_report.ai_mood_valence,
          arousal: item.emotion_report.ai_mood_arousal,
          quadrant: item.emotion_report.emotion_quadrant || null,
        });
      }

      // final_report에서 데이터 추출 (타입 가드 강화)
      if (item.final_report) {
        const finalReport = item.final_report;

        // aspired_self 추출
        if (
          finalReport.aspired_self &&
          typeof finalReport.aspired_self === "string" &&
          finalReport.aspired_self.trim().length > 0
        ) {
          aspired_selfSet.add(finalReport.aspired_self.trim());
        }

        // interest_characteristic 추출
        if (
          finalReport.interest_characteristic &&
          typeof finalReport.interest_characteristic === "string" &&
          finalReport.interest_characteristic.trim().length > 0
        ) {
          interestsSet.add(finalReport.interest_characteristic.trim());
        }

        // personality_strength 추출
        if (
          finalReport.personality_strength &&
          typeof finalReport.personality_strength === "string" &&
          finalReport.personality_strength.trim().length > 0
        ) {
          personalityStrengthsSet.add(finalReport.personality_strength.trim());
        }

        // immersion_hope_situation 추출
        if (
          finalReport.immersion_hope_situation &&
          typeof finalReport.immersion_hope_situation === "string" &&
          finalReport.immersion_hope_situation.trim().length > 0
        ) {
          immersionSituationsSet.add(
            finalReport.immersion_hope_situation.trim()
          );
        }

        // relief_comfort_situation 추출
        if (
          finalReport.relief_comfort_situation &&
          typeof finalReport.relief_comfort_situation === "string" &&
          finalReport.relief_comfort_situation.trim().length > 0
        ) {
          reliefSituationsSet.add(finalReport.relief_comfort_situation.trim());
        }
      } else {
        // 디버깅: final_report가 없는 경우
        console.log(
          `[RecentTrends] ${date} - final_report is null or undefined`
        );
      }
    }

    // Set을 배열로 변환하고 최대 5개로 제한
    const response: RecentTrendsResponse = {
      emotionData: emotionData.slice(0, 5),
      aspired_self: Array.from(aspired_selfSet).slice(0, 5),
      interests: Array.from(interestsSet).slice(0, 5),
      personalityStrengths: Array.from(personalityStrengthsSet).slice(0, 5),
      immersionSituations: Array.from(immersionSituationsSet).slice(0, 5),
      reliefSituations: Array.from(reliefSituationsSet).slice(0, 5),
    };

    return NextResponse.json<RecentTrendsResponse>(response, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
