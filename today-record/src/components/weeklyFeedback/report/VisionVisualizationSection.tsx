import { Sparkles, Target } from "lucide-react";
import { Card } from "../../ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyReportData } from "./types";

type VisionVisualizationSectionProps = {
  visionSummary: string;
  visionKeywordsTrend: Array<{ keyword: string; count: number }>;
  alignmentComment: string;
  reminderSentencesFeatured: string[];
};

export function VisionVisualizationSection({
  visionSummary,
  visionKeywordsTrend,
  alignmentComment,
  reminderSentencesFeatured,
}: VisionVisualizationSectionProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A3BFD9" }}
        >
          <Target className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl" style={{ color: "#333333" }}>
          비전과 일치도
        </h2>
      </div>

      {/* Vision Summary */}
      <Card
        className="p-4 sm:p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-sm sm:text-base leading-relaxed"
          style={{ color: "#333333" }}
        >
          {visionSummary}
        </p>
      </Card>

      {/* Vision Keywords Trend - Bar Chart */}
      <Card
        className="p-4 sm:p-5 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #EFE9E3" }}
      >
        <p
          className="text-xs sm:text-sm mb-2.5 sm:mb-3"
          style={{ color: "#6B7A6F" }}
        >
          비전 키워드 빈도
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={visionKeywordsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="keyword"
              tick={{ fontSize: 10, fill: "#6B7A6F" }}
              axisLine={{ stroke: "#E0E0E0" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6B7A6F" }}
              axisLine={{ stroke: "#E0E0E0" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #EFE9E3",
                borderRadius: "8px",
                fontSize: "0.8rem",
              }}
            />
            <Bar dataKey="count" fill="#A3BFD9" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Alignment Comment */}
      <div className="flex gap-2 items-start mb-4">
        <Sparkles
          className="w-4 h-4 flex-shrink-0 mt-1"
          style={{ color: "#A3BFD9", opacity: 0.7 }}
        />
        <p
          className="text-xs sm:text-sm leading-relaxed"
          style={{ color: "#6B7A6F" }}
        >
          {alignmentComment}
        </p>
      </div>

      {/* Featured Reminder Sentences */}
      <div className="space-y-3">
        {reminderSentencesFeatured.map((sentence, index) => (
          <Card
            key={index}
            className="p-4 sm:p-5"
            style={{
              backgroundColor: "#A3BFD9",
              color: "white",
              border: "none",
            }}
          >
            <p className="text-sm sm:text-base leading-relaxed">{sentence}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
