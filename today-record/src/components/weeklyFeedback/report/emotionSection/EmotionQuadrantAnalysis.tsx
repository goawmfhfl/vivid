import { Card } from "../../../ui/card";
import { AlertTriangle, Zap, Cloud, Sparkles } from "lucide-react";
import type { WeeklyReportData } from "../types";

type EmotionQuadrantAnalysisProps = {
  emotionOverview: WeeklyReportData["emotion_overview"];
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
  emotionOverview,
}: EmotionQuadrantAnalysisProps) {
  if (!emotionOverview) return null;

  const quadrants: EmotionQuadrant[] = [
    {
      id: "anxious",
      title: "불안·초조를 느끼는 상황",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "#B89A7A",
      bgGradient:
        "linear-gradient(135deg, rgba(184, 154, 122, 0.08) 0%, rgba(184, 154, 122, 0.03) 100%)",
      borderColor: "rgba(184, 154, 122, 0.2)",
      triggers: emotionOverview.anxious_triggers,
    },
    {
      id: "engaged",
      title: "몰입·설렘을 느끼는 상황",
      icon: <Zap className="w-4 h-4" />,
      color: "#A8BBA8",
      bgGradient:
        "linear-gradient(135deg, rgba(168, 187, 168, 0.08) 0%, rgba(168, 187, 168, 0.03) 100%)",
      borderColor: "rgba(168, 187, 168, 0.2)",
      triggers: emotionOverview.engaged_triggers,
    },
    {
      id: "sad",
      title: "슬픔·무기력을 느끼는 상황",
      icon: <Cloud className="w-4 h-4" />,
      color: "#6B7A6F",
      bgGradient:
        "linear-gradient(135deg, rgba(107, 122, 111, 0.08) 0%, rgba(107, 122, 111, 0.03) 100%)",
      borderColor: "rgba(107, 122, 111, 0.2)",
      triggers: emotionOverview.sad_triggers,
    },
    {
      id: "calm",
      title: "안도·평온을 느끼는 상황",
      icon: <Sparkles className="w-4 h-4" />,
      color: "#E5B96B",
      bgGradient:
        "linear-gradient(135deg, rgba(229, 185, 107, 0.08) 0%, rgba(229, 185, 107, 0.03) 100%)",
      borderColor: "rgba(229, 185, 107, 0.2)",
      triggers: emotionOverview.calm_triggers,
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
              border: `1px solid ${quadrant.borderColor}`,
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
                  backgroundColor: `${quadrant.color}15`,
                  color: quadrant.color,
                }}
              >
                {quadrant.icon}
              </div>
              <h4
                className="text-xs font-semibold flex-1"
                style={{ color: quadrant.color }}
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
                      style={{ backgroundColor: quadrant.color }}
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
