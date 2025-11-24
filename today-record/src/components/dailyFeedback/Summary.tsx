import { Lightbulb, Sparkles } from "lucide-react";
import { Card } from "../ui/card";
import { ScrollingKeywords } from "../ui/ScrollingKeywords";
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
        <h2 style={{ color: "#333333", fontSize: "1.3rem" }}>
          오늘의 전체 흐름
        </h2>
      </div>
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <div className="space-y-4">
          <div>
            <p
              style={{ color: "#333333", lineHeight: "1.8", fontSize: "1rem", textAlign: "left" }}
            >
              {view.narrative}
            </p>
          </div>
          {view.lesson && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "#F7F8F6",
                borderLeft: "3px solid #A8BBA8",
                maxWidth: "fit-content",
              }}
            >
              <p
                style={{
                  color: "#4E4B46",
                  lineHeight: "1.7",
                  fontSize: "0.95rem",
                  textAlign: "left",
                }}
              >
                {view.lesson}
              </p>
            </div>
          )}
          {view.keywords && view.keywords.length > 0 && (
            <div className="pt-2 -mx-6 px-6">
              <ScrollingKeywords
                keywords={view.keywords}
                duration={25}
                gap="0.5rem"
                badgeStyle={{
                  backgroundColor: "#EAEDE9",
                  color: "#55685E",
                  fontSize: "0.85rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "9999px",
                }}
              />
            </div>
          )}
        </div>
      </Card>
      {view.feedback_ai_comment && (
        <div
          className="p-5 rounded-xl flex gap-3"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <Sparkles
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "#A8BBA8" }}
          />
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7A6F",
                marginBottom: "0.5rem",
              }}
            >
              AI 코멘트
            </p>
            <p
              style={{
                color: "#4E4B46",
                lineHeight: "1.7",
                fontSize: "0.9rem",
                fontStyle: "italic",
              }}
            >
              {view.feedback_ai_comment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
