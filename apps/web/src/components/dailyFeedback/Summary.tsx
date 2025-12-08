import { Lightbulb, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export function SummarySection({ view, isPro = false }: SectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          전체 요약
        </h2>
      </div>
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <div className="space-y-4">
          {view.summary_key_points && view.summary_key_points.length > 0 && (
            <div>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                핵심 포인트
              </p>
              <ul className="space-y-2">
                {view.summary_key_points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#A8BBA8" }}
                    />
                    <p
                      className="text-sm"
                      style={{
                        color: "#333333",
                        lineHeight: "1.6",
                      }}
                    >
                      {point}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isPro && view.trend_analysis && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "#F7F8F6",
                borderLeft: "3px solid #A8BBA8",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" style={{ color: "#A8BBA8" }} />
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#6B7A6F",
                  }}
                >
                  트렌드 분석 (Pro)
                </p>
              </div>
              <p
                className="text-sm"
                style={{
                  color: "#4E4B46",
                  lineHeight: "1.7",
                  textAlign: "left",
                }}
              >
                {view.trend_analysis}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
