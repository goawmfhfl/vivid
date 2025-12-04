import { useEffect, useRef } from "react";
import {
  Heart,
  Lock,
  ArrowRight,
  TrendingUp,
  Zap,
  Sparkles,
} from "lucide-react";
import { Card } from "../../../ui/card";
import type { EmotionReport } from "@/types/weekly-feedback";
import { EmotionChart } from "./EmotionChart";
import { EmotionValues } from "./EmotionValues";
import { EmotionInterpretation } from "./EmotionInterpretation";
import { EmotionPatternAnalysis } from "./EmotionPatternAnalysis";
import { EmotionQuadrantAnalysis } from "./EmotionQuadrantAnalysis";
import { TooltipProvider, useTooltip } from "./TooltipContext";
import { COLORS } from "@/lib/design-system";
import { useRouter } from "next/navigation";

type EmotionSectionProps = {
  emotionReport: EmotionReport | null;
  isPro?: boolean;
};

export function EmotionSection({
  emotionReport,
  isPro = false,
}: EmotionSectionProps) {
  return (
    <TooltipProvider>
      <EmotionSectionContent emotionReport={emotionReport} isPro={isPro} />
    </TooltipProvider>
  );
}

function EmotionSectionContent({ emotionReport, isPro }: EmotionSectionProps) {
  const router = useRouter();
  console.log("emotionReport", emotionReport);
  // 일별 감정 데이터 (기록이 있는 날짜만 포함)
  const dailyEmotions = emotionReport?.daily_emotions || [];

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { setSelectedDayIndex } = useTooltip();

  // 외부 클릭/터치 감지하여 선택 해제
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        chartContainerRef.current &&
        !chartContainerRef.current.contains(event.target as Node)
      ) {
        setSelectedDayIndex(null);
      }
    };

    // 클릭과 터치 이벤트 모두 처리
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [setSelectedDayIndex]);

  // AI가 생성한 주간 평균 감정 데이터
  const weeklyAverage =
    emotionReport &&
    emotionReport.ai_mood_valence !== null &&
    emotionReport.ai_mood_arousal !== null
      ? {
          valence: emotionReport.ai_mood_valence,
          arousal: emotionReport.ai_mood_arousal,
        }
      : null;

  if (!weeklyAverage) {
    return (
      <div className="mb-10 sm:mb-12">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#B89A7A" }}
          >
            <Heart className="w-4 h-4 text-white" />
          </div>
          <h2
            className="text-xl sm:text-2xl font-semibold"
            style={{ color: COLORS.text.primary }}
          >
            이번 주 감정
          </h2>
        </div>
        <Card
          className="p-6"
          style={{ backgroundColor: "#F7F8F6", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              color: "#6B7A6F",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            이번 주 감정 데이터가 없습니다.
          </p>
        </Card>
      </div>
    );
  }

  const valence = weeklyAverage?.valence ?? 0;
  const arousal = weeklyAverage?.arousal ?? 0;

  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#B89A7A" }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: COLORS.text.primary }}
        >
          이번 주 감정
        </h2>
      </div>

      {/* 감정 차트 */}
      <EmotionChart
        dailyEmotions={dailyEmotions}
        valence={valence}
        arousal={arousal}
        chartContainerRef={chartContainerRef}
      />

      {/* 감정 수치 표시 */}
      <div style={{ marginTop: "32px" }}>
        <EmotionValues valence={valence} arousal={arousal} />
      </div>

      {/* 감정 해석 */}
      <div style={{ marginTop: "32px" }}>
        <EmotionInterpretation valence={valence} arousal={arousal} />
      </div>

      {/* 기본 패턴 분석 - 모든 사용자 */}
      {emotionReport && (
        <div style={{ marginTop: "32px" }}>
          <EmotionPatternAnalysis emotionReport={emotionReport} />
        </div>
      )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && emotionReport && (
        <Card
          className="p-5 sm:p-6 mt-6 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, rgba(184, 154, 122, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            border: "1px solid #D5E3D5",
            borderRadius: "16px",
          }}
          onClick={() => router.push("/subscription")}
        >
          {/* 장식 요소 */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(184, 154, 122, 0.8) 0%, transparent 70%)",
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 154, 122, 0.3) 0%, rgba(184, 154, 122, 0.15) 100%)",
                border: "1px solid rgba(184, 154, 122, 0.3)",
              }}
            >
              <Lock className="w-5 h-5" style={{ color: "#B89A7A" }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  감정 패턴을 더 깊이 이해하고 싶으신가요?
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    backgroundColor: "rgba(184, 154, 122, 0.2)",
                    color: "#6B7A6F",
                    letterSpacing: "0.5px",
                  }}
                >
                  PRO
                </span>
              </div>
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{
                  color: COLORS.text.secondary,
                  lineHeight: "1.6",
                }}
              >
                Pro 멤버십에서는 이번 주의 감정 패턴, 트리거 분석, 감정 영역별
                상황 분석을 시각화해 드립니다. 지금 기록을 성장으로 바꿔보세요.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span style={{ color: COLORS.brand.primary }}>
                  Pro 멤버십으로 업그레이드
                </span>
                <ArrowRight className="w-4 h-4" style={{ color: "#B89A7A" }} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Pro 모드: 상세 분석 표시 */}
      {isPro && emotionReport && (
        <div className="space-y-6 mt-6">
          {/* 상세 패턴 분석 */}
          {(emotionReport.valence_patterns?.length > 0 ||
            emotionReport.arousal_patterns?.length > 0) && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(107, 122, 111, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #6B7A6F 0%, #5A6A5F 100%)",
                  }}
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    상세 패턴 분석
                  </p>

                  {/* 쾌-불쾌 패턴 */}
                  {Array.isArray(emotionReport.valence_patterns) &&
                    emotionReport.valence_patterns.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp
                          className="w-4 h-4"
                          style={{ color: "#6B7A6F" }}
                        />
                        <p
                          className="text-xs font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          쾌-불쾌 패턴
                        </p>
                      </div>
                      <ul className="space-y-1.5 ml-6">
                        {emotionReport.valence_patterns.map((pattern, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            <span
                              className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: COLORS.brand.primary,
                              }}
                            />
                            <span style={{ lineHeight: "1.6" }}>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 각성-에너지 패턴 */}
                  {Array.isArray(emotionReport.arousal_patterns) &&
                    emotionReport.arousal_patterns.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4" style={{ color: "#E5B96B" }} />
                        <p
                          className="text-xs font-medium"
                          style={{ color: COLORS.text.primary }}
                        >
                          각성-에너지 패턴
                        </p>
                      </div>
                      <ul className="space-y-1.5 ml-6">
                        {emotionReport.arousal_patterns.map((pattern, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            <span
                              className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: "#E5B96B",
                              }}
                            />
                            <span style={{ lineHeight: "1.6" }}>{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* 트리거 분석 */}
          {((Array.isArray(emotionReport.valence_triggers) &&
            emotionReport.valence_triggers.length > 0) ||
            (Array.isArray(emotionReport.arousal_triggers) &&
              emotionReport.arousal_triggers.length > 0)) && (
            <Card
              className="p-5 sm:p-6 relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168, 187, 168, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
                border: "1px solid #D5E3D5",
                borderRadius: "16px",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #A8BBA8 0%, #8FA38F 100%)",
                  }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs mb-3 font-semibold"
                    style={{ color: COLORS.text.secondary }}
                  >
                    감정 트리거 분석
                  </p>

                  {/* 쾌-불쾌 트리거 */}
                  {Array.isArray(emotionReport.valence_triggers) &&
                    emotionReport.valence_triggers.length > 0 && (
                    <div className="mb-4">
                      <p
                        className="text-xs font-medium mb-2"
                        style={{ color: COLORS.text.primary }}
                      >
                        쾌-불쾌 트리거
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {emotionReport.valence_triggers.map((trigger, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-lg text-xs"
                            style={{
                              backgroundColor: "#F0F5F0",
                              color: "#6B7A6F",
                              border: "1px solid #D5E3D5",
                            }}
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 각성-에너지 트리거 */}
                  {Array.isArray(emotionReport.arousal_triggers) &&
                    emotionReport.arousal_triggers.length > 0 && (
                    <div>
                      <p
                        className="text-xs font-medium mb-2"
                        style={{ color: COLORS.text.primary }}
                      >
                        각성-에너지 트리거
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {emotionReport.arousal_triggers.map((trigger, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-lg text-xs"
                            style={{
                              backgroundColor: "#FFF9E6",
                              color: "#B89A7A",
                              border: "1px solid #E5D4B3",
                            }}
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* 감정 영역별 상황 분석 */}
          <EmotionQuadrantAnalysis emotionReport={emotionReport} />
        </div>
      )}
    </div>
  );
}

export default EmotionSection;
