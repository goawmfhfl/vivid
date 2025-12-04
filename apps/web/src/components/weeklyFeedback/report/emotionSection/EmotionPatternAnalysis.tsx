import { TrendingUp, Zap } from "lucide-react";
import { Card } from "../../../ui/card";
import type { EmotionReport } from "@/types/weekly-feedback";

type EmotionPatternAnalysisProps = {
  emotionReport: EmotionReport;
};

export function EmotionPatternAnalysis({
  emotionReport,
}: EmotionPatternAnalysisProps) {
  if (!emotionReport) return null;

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
              {emotionReport.valence_explanation}
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
              {emotionReport.arousal_explanation}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
