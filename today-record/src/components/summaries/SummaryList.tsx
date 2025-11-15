import { Card } from "../ui/card";
import { Calendar } from "lucide-react";
import type { PeriodSummary } from "@/types/Entry";

interface SummaryListProps {
  summaries: PeriodSummary[];
  color: string;
  onSummaryClick: (summary: PeriodSummary) => void;
}

export function SummaryList({
  summaries,
  color,
  onSummaryClick,
}: SummaryListProps) {
  if (summaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {summaries.map((summary) => (
        <Card
          key={summary.id}
          className="p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]"
          onClick={() => onSummaryClick(summary)}
          style={{
            backgroundColor: "white",
            border: "1px solid #EFE9E3",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                <Calendar className="w-4 h-4" style={{ color: "white" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="truncate"
                  style={{ color: "#333333", fontSize: "1rem" }}
                >
                  {summary.period} {summary.type === "weekly" ? "주간" : "월간"}{" "}
                  인사이트 & 피드백
                </h3>
                <p
                  className="truncate"
                  style={{
                    color: "#4E4B46",
                    opacity: 0.7,
                    fontSize: "0.8rem",
                  }}
                >
                  {summary.dateRange}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
