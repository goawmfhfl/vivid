import { TrendingUp, Zap } from "lucide-react";
import { Card } from "../../../ui/card";
import type { WeeklyReportData } from "../types";

type EmotionPatternAnalysisProps = {
  emotionOverview: WeeklyReportData["emotion_overview"];
};

export function EmotionPatternAnalysis({
  emotionOverview,
}: EmotionPatternAnalysisProps) {
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
