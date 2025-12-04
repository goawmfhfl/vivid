import { useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { Card } from "../../../ui/card";
import type { EmotionReport } from "@/types/weekly-feedback";
import { EmotionChart } from "./EmotionChart";
import { EmotionValues } from "./EmotionValues";
import { EmotionInterpretation } from "./EmotionInterpretation";
import { EmotionPatternAnalysis } from "./EmotionPatternAnalysis";
import { EmotionQuadrantAnalysis } from "./EmotionQuadrantAnalysis";
import { TooltipProvider, useTooltip } from "./TooltipContext";

type EmotionSectionProps = {
  emotionReport: EmotionReport | null;
  isPro?: boolean;
};

export function EmotionSection({
  emotionReport,
  isPro = false,
}: EmotionSectionProps) {
  if (!emotionReport) {
    return null;
  }

  return (
    <TooltipProvider>
      <EmotionSectionContent emotionReport={emotionReport} isPro={isPro} />
    </TooltipProvider>
  );
}

function EmotionSectionContent({ emotionReport, isPro }: EmotionSectionProps) {
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
            style={{ color: "#333333" }}
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
          style={{ color: "#333333" }}
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

      {/* 감정 패턴 분석 */}
      {emotionReport && (
        <div style={{ marginTop: "32px" }}>
          <EmotionPatternAnalysis emotionReport={emotionReport} />
        </div>
      )}

      {/* 감정 영역별 상황 분석 */}
      {emotionReport && (
        <div style={{ marginTop: "32px" }}>
          <EmotionQuadrantAnalysis emotionReport={emotionReport} />
        </div>
      )}
    </div>
  );
}

export default EmotionSection;
