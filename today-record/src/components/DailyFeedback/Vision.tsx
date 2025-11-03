import { Target, Sparkles } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { SectionProps } from "./types";

export function VisionSection({ view }: SectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#8FA894" }}
        >
          <Target className="w-4 h-4 text-white" />
        </div>
        <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>
          오늘의 비전과 방향
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card
          className="p-5"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            비전 요약
          </p>
          <p
            style={{ color: "#333333", lineHeight: "1.7", fontSize: "0.95rem" }}
          >
            {view.vision_summary}
          </p>
        </Card>
        <Card
          className="p-5"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            자기 평가
          </p>
          <p
            style={{ color: "#333333", lineHeight: "1.7", fontSize: "0.95rem" }}
          >
            {view.vision_self}
          </p>
        </Card>
      </div>
      {view.vision_keywords && view.vision_keywords.length > 0 && (
        <div className="overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          <div className="flex gap-2" style={{ minWidth: "max-content" }}>
            {view.vision_keywords.map((keyword, index) => (
              <Badge
                key={index}
                style={{
                  backgroundColor: "#EAEDE9",
                  color: "#55685E",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                }}
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {view.reminder_sentence && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#8FA894", color: "white", border: "none" }}
        >
          <p
            style={{ fontSize: "0.8rem", opacity: 0.9, marginBottom: "0.5rem" }}
          >
            오늘의 리마인더
          </p>
          <p style={{ fontSize: "1.05rem", lineHeight: "1.6" }}>
            {view.reminder_sentence}
          </p>
        </Card>
      )}
      {view.vision_ai_feedback && (
        <div className="flex gap-2 items-start">
          <Sparkles
            className="w-4 h-4 flex-shrink-0 mt-1"
            style={{ color: "#8FA894", opacity: 0.85 }}
          />
          <p
            style={{ color: "#55685E", lineHeight: "1.6", fontSize: "0.85rem" }}
          >
            {view.vision_ai_feedback}
          </p>
        </div>
      )}
    </div>
  );
}
