import { TrendingUp } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export function FeedbackSection({ view }: SectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#333333" }}>
          오늘의 자기 피드백
        </h2>
      </div>
      {view.core_feedback && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p className="text-sm" style={{ color: "#333333", lineHeight: "1.7" }}>
            {view.core_feedback}
          </p>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card
          className="p-5"
          style={{ backgroundColor: "#F4F6F4", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-xs"
            style={{
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            잘한 점
          </p>
          <ul className="space-y-2">
            {view.positives.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: "#6B7A6F" }}
                />
                <p
                  className="text-sm"
                  style={{
                    color: "#333333",
                    lineHeight: "1.6",
                  }}
                >
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          className="p-5"
          style={{ backgroundColor: "#F9F3EF", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-xs"
            style={{
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            개선할 점
          </p>
          <ul className="space-y-2">
            {view.improvements.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: "#B89A7A" }}
                />
                <p
                  className="text-sm"
                  style={{
                    color: "#333333",
                    lineHeight: "1.6",
                  }}
                >
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {view.feedback_ai_comment && (
        <div
          className="p-5 rounded-xl flex gap-3"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-sm"
            style={{ color: "#4E4B46", lineHeight: "1.7" }}
          >
            {view.feedback_ai_comment}
          </p>
        </div>
      )}
    </div>
  );
}
