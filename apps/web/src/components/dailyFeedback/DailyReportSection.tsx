import { BookOpen, Sparkles, Lock } from "lucide-react";
import { Card } from "../ui/card";
import { ScrollingKeywords } from "../ui/ScrollingKeywords";
import { SectionProps } from "./types";

export function DailyReportSection({ view, isPro = false }: SectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#A8BBA8" }}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#333333" }}>
          오늘의 일상
        </h2>
      </div>
      <Card
        className="p-6 mb-4"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <div className="space-y-4">
          {view.daily_summary && (
            <div>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.5rem",
                }}
              >
                요약
              </p>
              <p
                className="text-sm"
                style={{
                  color: "#333333",
                  lineHeight: "1.8",
                  textAlign: "left",
                }}
              >
                {view.daily_summary}
              </p>
            </div>
          )}
          {view.narrative && (
            <div>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.5rem",
                }}
              >
                서사
              </p>
              <p
                className="text-sm"
                style={{
                  color: "#333333",
                  lineHeight: "1.8",
                  textAlign: "left",
                }}
              >
                {view.narrative}
              </p>
            </div>
          )}
          {isPro && view.detailed_narrative && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "#F7F8F6",
                borderLeft: "3px solid #A8BBA8",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#6B7A6F",
                  }}
                >
                  상세 서사 (Pro)
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
                {view.detailed_narrative}
              </p>
            </div>
          )}
          {!isPro && (
            <div
              className="p-4 rounded-xl flex items-center gap-2"
              style={{
                backgroundColor: "#FAFAF8",
                border: "1px solid #E6E4DE",
              }}
            >
              <Lock className="w-4 h-4" style={{ color: "#6B7A6F" }} />
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                }}
              >
                상세 서사는 Pro 멤버십에서만 제공됩니다.
              </p>
            </div>
          )}
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
                className="text-sm"
                style={{
                  color: "#4E4B46",
                  lineHeight: "1.7",
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
                  fontSize: "0.875rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "9999px",
                }}
              />
            </div>
          )}
          {isPro && view.context_analysis && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "#F7F8F6",
                borderLeft: "3px solid #A8BBA8",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: "#6B7A6F",
                  }}
                >
                  맥락 분석 (Pro)
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
                {view.context_analysis}
              </p>
            </div>
          )}
        </div>
      </Card>
      {view.ai_comment && (
        <div
          className="p-5 rounded-xl flex gap-3"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E0E5E0" }}
        >
          <Sparkles
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: "#A8BBA8" }}
          />
          <div>
            <p
              className="text-xs"
              style={{
                color: "#6B7A6F",
                marginBottom: "0.5rem",
              }}
            >
              AI 코멘트
            </p>
            <p
              className="text-sm italic"
              style={{
                color: "#4E4B46",
                lineHeight: "1.7",
              }}
            >
              {view.ai_comment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

