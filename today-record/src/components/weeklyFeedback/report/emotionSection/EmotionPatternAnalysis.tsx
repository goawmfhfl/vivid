import { TrendingUp, Zap, HelpCircle } from "lucide-react";
import { Card } from "../../../ui/card";
import type { WeeklyReportData } from "../types";
import { useTooltip } from "./TooltipContext";

type EmotionPatternAnalysisProps = {
  emotionOverview: WeeklyReportData["emotion_overview"];
};

export function EmotionPatternAnalysis({ emotionOverview }: EmotionPatternAnalysisProps) {
  const { showValenceTooltip, showArousalTooltip, setShowValenceTooltip, setShowArousalTooltip } = useTooltip();
  if (!emotionOverview) return null;

  return (
    <div className="space-y-4">
      {/* 설명 섹션 */}
      <Card
        className="p-5"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <div className="space-y-4">
          {/* 쾌-불쾌 설명 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#6B7A6F" }} />
              <h3
                className="text-sm font-semibold"
                style={{
                  color: "#333333",
                }}
              >
                쾌-불쾌 패턴 분석
              </h3>
              <div className="relative">
                <HelpCircle
                  className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    setShowValenceTooltip(
                      !showValenceTooltip
                    )
                  }
                />
                {showValenceTooltip && (
                  <div
                    className="absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg z-50"
                    style={{
                      backgroundColor: "#333333",
                      color: "white",
                      fontSize: "0.8rem",
                      lineHeight: "1.4",
                      maxWidth: "280px",
                      whiteSpace: "normal",
                    }}
                  >
                    쾌-불쾌(Valence)는 내가 하루를 얼마나 기쁘고 만족스럽게
                    느꼈는지, 혹은 아쉽고 불편하게 느꼈는지를 나타내는 축이에요.
                    이 축을 함께 보는 이유는, 어떤 상황에서 기쁨·만족이
                    올라가고, 어떤 순간에 불안·후회·스트레스가 올라오는지 더
                    선명하게 알 수 있기 때문이에요.
                    <div
                      className="absolute top-0 left-4 transform -translate-y-full"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderBottom: "6px solid #333333",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p
              className="text-sm"
              style={{
                color: "#6B7A6F",
                lineHeight: "1.6",
              }}
            >
              {emotionOverview.valence_explanation}
            </p>
          </div>

          {/* 각성-에너지 설명 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" style={{ color: "#6B7A6F" }} />
              <h3
                className="text-sm font-semibold"
                style={{
                  color: "#333333",
                }}
              >
                각성-에너지 패턴 분석
              </h3>
              <div className="relative">
                <HelpCircle
                  className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    setShowArousalTooltip(
                      !showArousalTooltip
                    )
                  }
                />
                {showArousalTooltip && (
                  <div
                    className="absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg z-50"
                    style={{
                      backgroundColor: "#333333",
                      color: "white",
                      fontSize: "0.8rem",
                      lineHeight: "1.4",
                      maxWidth: "280px",
                      whiteSpace: "normal",
                    }}
                  >
                    각성-에너지(Arousal)는 내가 얼마나 에너지가 올라와 있고,
                    몸과 마음이 활성화되어 있는지를 보여주는 축이에요. 이 축을
                    함께 쓰는 이유는, 같은 '기분 좋음'이라도 편안한 휴식
                    상태인지, 아니면 몰입해서 불타는 상태인지 구분할 수 있기
                    때문이에요.
                    <div
                      className="absolute top-0 left-4 transform -translate-y-full"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderBottom: "6px solid #333333",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p
              className="text-sm"
              style={{
                color: "#6B7A6F",
                lineHeight: "1.6",
              }}
            >
              {emotionOverview.arousal_explanation}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
