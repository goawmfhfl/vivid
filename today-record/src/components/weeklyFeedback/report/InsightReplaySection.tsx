import { Sparkles, Brain, Lightbulb, Zap } from "lucide-react";
import { Card } from "../../ui/card";

type InsightReplaySectionProps = {
  coreInsights: string[];
  metaQuestionsHighlight: string[];
};

export function InsightReplaySection({
  coreInsights,
  metaQuestionsHighlight,
}: InsightReplaySectionProps) {
  const insightIcons = [
    <Sparkles key="sparkles" className="w-5 h-5" />,
    <Brain key="brain" className="w-5 h-5" />,
    <Lightbulb key="lightbulb" className="w-5 h-5" />,
    <Zap key="zap" className="w-5 h-5" />,
  ];

  const insightColors = [
    {
      gradient:
        "linear-gradient(135deg, rgba(168, 187, 168, 0.12) 0%, rgba(168, 187, 168, 0.04) 100%)",
      border: "rgba(168, 187, 168, 0.3)",
      iconColor: "#A8BBA8",
      glow: "rgba(168, 187, 168, 0.2)",
    },
    {
      gradient:
        "linear-gradient(135deg, rgba(229, 185, 107, 0.12) 0%, rgba(229, 185, 107, 0.04) 100%)",
      border: "rgba(229, 185, 107, 0.3)",
      iconColor: "#E5B96B",
      glow: "rgba(229, 185, 107, 0.2)",
    },
    {
      gradient:
        "linear-gradient(135deg, rgba(184, 154, 122, 0.12) 0%, rgba(184, 154, 122, 0.04) 100%)",
      border: "rgba(184, 154, 122, 0.3)",
      iconColor: "#B89A7A",
      glow: "rgba(184, 154, 122, 0.2)",
    },
    {
      gradient:
        "linear-gradient(135deg, rgba(107, 122, 111, 0.12) 0%, rgba(107, 122, 111, 0.04) 100%)",
      border: "rgba(107, 122, 111, 0.3)",
      iconColor: "#6B7A6F",
      glow: "rgba(107, 122, 111, 0.2)",
    },
  ];

  return (
    <div className="mb-10 sm:mb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div
          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, #D08C60 0%, #E5B96B 50%, #A8BBA8 100%)",
            boxShadow: "0 4px 12px rgba(208, 140, 96, 0.3)",
          }}
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <div
            className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
            }}
          />
        </div>
        <div>
          <h2
            className="text-xl sm:text-2xl font-semibold"
            style={{ color: "#333333" }}
          >
            이번 주의 인사이트
          </h2>
        </div>
      </div>

      {/* Core Insights */}
      <div className="space-y-4 mb-6">
        {coreInsights.map((insight, index) => {
          const colorScheme = insightColors[index % insightColors.length];
          const icon = insightIcons[index % insightIcons.length];

          return (
            <Card
              key={index}
              className="group relative p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
              style={{
                background: colorScheme.gradient,
                border: `1.5px solid ${colorScheme.border}`,
                borderRadius: "16px",
              }}
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 20% 20%, ${colorScheme.glow} 0%, transparent 50%)`,
                }}
              />

              {/* Content */}
              <div className="relative flex gap-4">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${colorScheme.iconColor}15`,
                    border: `1.5px solid ${colorScheme.iconColor}30`,
                  }}
                >
                  <div style={{ color: colorScheme.iconColor }}>{icon}</div>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#333333", lineHeight: "1.8" }}
                  >
                    {insight}
                  </p>
                </div>
              </div>

              {/* Decorative line */}
              <div
                className="absolute bottom-0 left-0 h-1 rounded-full transition-all duration-500 group-hover:w-full"
                style={{
                  width: "30%",
                  background: `linear-gradient(90deg, ${colorScheme.iconColor} 0%, transparent 100%)`,
                }}
              />
            </Card>
          );
        })}
      </div>

      {/* Meta Questions Highlight */}
      <Card
        className="relative p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(208, 140, 96, 0.08) 0%, rgba(229, 185, 107, 0.05) 100%)",
          border: "2px solid rgba(208, 140, 96, 0.25)",
          borderRadius: "16px",
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-5"
          style={{
            background:
              "radial-gradient(circle, rgba(208, 140, 96, 0.5) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #D08C60 0%, #E5B96B 100%)",
              }}
            >
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <p
              className="text-xs font-semibold"
              style={{ color: "#D08C60", letterSpacing: "0.5px" }}
            >
              이번 주 떠오른 질문들
            </p>
          </div>

          <div className="space-y-3">
            {metaQuestionsHighlight.map((question, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/40"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    backgroundColor: "rgba(208, 140, 96, 0.15)",
                    color: "#D08C60",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </div>
                <p
                  className="text-sm leading-relaxed italic flex-1"
                  style={{
                    color: "#4E4B46",
                    lineHeight: "1.7",
                  }}
                >
                  &ldquo;{question}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
