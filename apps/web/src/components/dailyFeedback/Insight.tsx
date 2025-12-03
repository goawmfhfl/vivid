import { Star, Sparkles } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export function InsightSection({ view, isPro = false }: SectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#B89A7A" }}
        >
          <Star className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#333333" }}>오늘의 깨달음</h2>
      </div>
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <p
          className="text-xs"
          style={{
            color: "#6B7A6F",
            marginBottom: "0.75rem",
          }}
        >
          핵심 인사이트
        </p>
        <p className="text-sm" style={{ color: "#333333", lineHeight: "1.7" }}>
          {view.core_insight}
        </p>
        {view.learning_source && (
          <p
            className="text-xs"
            style={{
              color: "#6B7A6F",
              marginTop: "0.75rem",
            }}
          >
            출처: {view.learning_source}
          </p>
        )}
      </Card>
      {view.meta_question && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#FAFAF8", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-xs"
            style={{
              color: "#6B7A6F",
              marginBottom: "0.5rem",
            }}
          >
            내일의 질문
          </p>
          <p className="text-sm" style={{ color: "#4E4B46", lineHeight: "1.6" }}>
            {view.meta_question}
          </p>
        </Card>
      )}
      {view.insight_ai_comment && (
        <div
          className="p-4 rounded-lg flex gap-3"
          style={{
            backgroundColor: "#F5F7F5",
            borderLeft: "3px solid #A8BBA8",
          }}
        >
          <Sparkles
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: "#A8BBA8" }}
          />
          <p
            className="text-sm"
            style={{ color: "#4E4B46", lineHeight: "1.7" }}
          >
            {view.insight_ai_comment}
          </p>
        </div>
      )}
    </div>
  );
}
