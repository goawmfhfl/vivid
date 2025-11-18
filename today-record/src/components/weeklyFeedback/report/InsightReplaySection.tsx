import { Star } from "lucide-react";
import { Card } from "../../ui/card";
import type { WeeklyReportData } from "./types";

type InsightReplaySectionProps = {
  coreInsights: string[];
  metaQuestionsHighlight: string[];
};

export function InsightReplaySection({
  coreInsights,
  metaQuestionsHighlight,
}: InsightReplaySectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#D08C60" }}
        >
          <Star className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
          이번 주의 인사이트
        </h2>
      </div>

      {/* Core Insights */}
      <div className="space-y-3 mb-4">
        {coreInsights.map((insight, index) => (
          <Card
            key={index}
            className="p-4 sm:p-5"
            style={{
              backgroundColor: "white",
              border: "1px solid #EFE9E3",
            }}
          >
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: "#333333" }}
            >
              {insight}
            </p>
          </Card>
        ))}
      </div>

      {/* Meta Questions Highlight */}
      <Card
        className="p-4 sm:p-5"
        style={{
          backgroundColor: "#FDF6F0",
          border: "2px solid #D08C60",
        }}
      >
        <p
          className="text-xs sm:text-sm mb-2.5 sm:mb-3"
          style={{ color: "#D08C60" }}
        >
          이번 주 떠오른 질문들
        </p>
        <div className="space-y-2">
          {metaQuestionsHighlight.map((question, index) => (
            <p
              key={index}
              className="text-sm sm:text-base leading-relaxed italic"
              style={{ color: "#4E4B46" }}
            >
              "{question}"
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
