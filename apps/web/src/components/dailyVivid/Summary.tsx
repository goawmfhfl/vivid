import { Lightbulb } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export function SummarySection({ view }: SectionProps) {
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
          {view.narrative_summary && (
            <p
              className="text-sm"
              style={{
                color: "#4E4B46",
                lineHeight: "1.7",
                textAlign: "left",
              }}
            >
              {view.narrative_summary}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
