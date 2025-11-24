import { Target, Sparkles } from "lucide-react";
import { Card } from "../ui/card";
import { ScrollingKeywords } from "../ui/ScrollingKeywords";
import { SectionProps } from "./types";

export function VisionSection({ view }: SectionProps) {
  // vision_ai_feedback을 리스트로 파싱 ("핵심 3단: 1) ..., 2) ..., 3) ...")
  const feedbackItems = (() => {
    const raw = view.vision_ai_feedback ?? "";
    if (!raw) return [] as string[];
    const body = raw.replace(/^핵심\s*3단\s*:\s*/i, "");
    const byPattern = Array.from(body.matchAll(/\d+\)\s*([^,]+?)(?:,|$)/g)).map(
      (m) => m[1].trim()
    );
    if (byPattern.length > 0) return byPattern;
    return body
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  })();

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#E5B96B" }}
        >
          <Target className="w-4 h-4 text-white" />
        </div>
        <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>오늘의 시각화</h2>
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
            시각화 요약
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
        <div className="mb-4 -mx-4 px-4">
          <ScrollingKeywords keywords={view.vision_keywords} />
        </div>
      )}
      {view.reminder_sentence && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#E5B96B", color: "white", border: "none" }}
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
      {feedbackItems.length > 0 && (
        <Card
          className="p-5"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <div className="flex items-start gap-2 mb-3">
            <Sparkles
              className="w-4 h-4 flex-shrink-0 mt-1"
              style={{ color: "#E5B96B", opacity: 0.85 }}
            />
            <p style={{ color: "#6B7A6F", fontSize: "0.85rem" }}>핵심 3단</p>
          </div>
          <ul className="space-y-2">
            {feedbackItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: "#FFF8E7",
                    color: "#B8860B",
                    border: "1px solid #F2D9A6",
                  }}
                >
                  {idx + 1}
                </span>
                <span
                  style={{
                    color: "#55685E",
                    lineHeight: "1.6",
                    fontSize: "0.95rem",
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
