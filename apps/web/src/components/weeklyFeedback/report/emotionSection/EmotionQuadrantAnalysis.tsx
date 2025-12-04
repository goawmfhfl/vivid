import { Card } from "../../../ui/card";
import { AlertTriangle, Zap, Cloud, Sparkles } from "lucide-react";
import type { EmotionReport } from "@/types/weekly-feedback";

type EmotionQuadrantAnalysisProps = {
  emotionReport: EmotionReport;
};

type EmotionQuadrant = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  triggers: string[] | undefined;
};

export function EmotionQuadrantAnalysis({
  emotionReport,
}: EmotionQuadrantAnalysisProps) {
  if (!emotionReport) return null;

  const quadrants: EmotionQuadrant[] = [
    {
      id: "anxious",
      title: "불안·초조를 느끼는 상황",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "#B89A7A",
      bgGradient:
        "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
      borderColor: "rgba(184, 154, 122, 0.2)",
      triggers: emotionReport.anxious_triggers,
    },
    {
      id: "engaged",
      title: "몰입·설렘을 느끼는 상황",
      icon: <Zap className="w-4 h-4" />,
      color: "#B89A7A",
      bgGradient:
        "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
      borderColor: "rgba(184, 154, 122, 0.2)",
      triggers: emotionReport.engaged_triggers,
    },
    {
      id: "sad",
      title: "슬픔·무기력을 느끼는 상황",
      icon: <Cloud className="w-4 h-4" />,
      color: "#B89A7A",
      bgGradient:
        "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
      borderColor: "rgba(184, 154, 122, 0.2)",
      triggers: emotionReport.sad_triggers,
    },
    {
      id: "calm",
      title: "안도·평온을 느끼는 상황",
      icon: <Sparkles className="w-4 h-4" />,
      color: "#B89A7A",
      bgGradient:
        "linear-gradient(135deg, rgba(184, 154, 122, 0.1) 0%, rgba(255, 255, 255, 1) 100%)",
      borderColor: "rgba(184, 154, 122, 0.2)",
      triggers: emotionReport.calm_triggers,
    },
  ];

  return (
    <div>
      <h3
        className="text-xl sm:text-2xl font-semibold mb-6"
        style={{ color: "#333333" }}
      >
        감정 영역별 상황 분석
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quadrant) => (
          <Card
            key={quadrant.id}
            className="p-5 transition-all duration-300 hover:shadow-lg"
            style={{
              background: quadrant.bgGradient,
              border: "1px solid rgba(184, 154, 122, 0.2)",
              borderRadius: "12px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
                style={{
                  backgroundColor: "rgba(139, 111, 71, 0.15)",
                  color: "#8B6F47",
                }}
              >
                {quadrant.icon}
              </div>
              <h4
                className="text-xs font-semibold flex-1"
                style={{ color: "#333333" }}
              >
                {quadrant.title}
              </h4>
            </div>

            {/* 트리거 리스트 */}
            {quadrant.triggers && quadrant.triggers.length > 0 ? (
              <div className="space-y-3">
                {quadrant.triggers.map((trigger, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#8B6F47" }}
                    />
                    <p
                      className="text-sm leading-relaxed flex-1"
                      style={{ color: "#333333" }}
                    >
                      {trigger}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6">
                <p
                  className="text-sm"
                  style={{
                    color: "#9CA3AF",
                    fontStyle: "italic",
                  }}
                >
                  이번 주에 해당 감정을 느끼는 상황이 없었습니다.
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
