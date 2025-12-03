import { Star, Sparkles, Lightbulb, ListChecks, Lock } from "lucide-react";
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
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          오늘의 깨달음
        </h2>
      </div>

      {/* 핵심 인사이트 리스트 */}
      {view.core_insights && view.core_insights.length > 0 && (
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
          <ul className="space-y-3">
            {view.core_insights.map((item, idx) => (
              <li key={idx} className="space-y-1">
                <p
                  className="text-sm"
                  style={{ color: "#333333", lineHeight: "1.7" }}
                >
                  {item.insight}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: "#6B7A6F",
                    fontStyle: "italic",
                  }}
                >
                  출처: {item.source}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 메타 퀘스천 - 인사이트를 발전시키는 방법 (Pro 전용) */}
      {isPro && view.meta_question && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#FAFAF8", border: "1px solid #E6E4DE" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" style={{ color: "#B89A7A" }} />
            <p
              className="text-xs"
              style={{
                color: "#6B7A6F",
                fontWeight: "500",
              }}
            >
              인사이트 발전하기
            </p>
          </div>
          <p
            className="text-sm"
            style={{ color: "#4E4B46", lineHeight: "1.6" }}
          >
            {view.meta_question}
          </p>
        </Card>
      )}

      {/* 추천 행동 (Next Actions) - 인사이트를 행동으로 옮기기 (Pro 전용) */}
      {isPro &&
        view.insight_next_actions &&
        view.insight_next_actions.length > 0 && (
          <Card
            className="p-5 mb-4"
            style={{ backgroundColor: "#FAFAF8", border: "1px solid #E6E4DE" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-4 h-4" style={{ color: "#6B7A6F" }} />
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  fontWeight: "500",
                }}
              >
                오늘 인사이트 기반 추천 행동
              </p>
            </div>
            <ul className="space-y-2">
              {view.insight_next_actions.map((action, idx) => (
                <li key={idx} className="space-y-1">
                  <p
                    className="text-sm"
                    style={{ color: "#4E4B46", lineHeight: "1.6" }}
                  >
                    • {action.label}
                  </p>
                  <p className="text-xs" style={{ color: "#6B7A6F" }}>
                    난이도: {action.difficulty}
                    {typeof action.estimated_minutes === "number" &&
                    action.estimated_minutes > 0
                      ? ` · 예상 ${action.estimated_minutes}분`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && (
        <Card
          className="p-4 mb-4"
          style={{
            backgroundColor: "#FAFAF8",
            border: "1px solid #E6E4DE",
          }}
        >
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5" style={{ color: "#6B7A6F" }} />
            <div className="flex-1">
              <p
                className="text-xs font-semibold mb-1"
                style={{
                  color: "#4E4B46",
                }}
              >
                인사이트를 행동으로 옮기고 싶으신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  lineHeight: "1.5",
                  marginBottom: "0.5rem",
                }}
              >
                Pro 멤버십에서는 오늘의 인사이트를 더 발전시키는 방법과, 바로
                시도해볼 수 있는 작은 행동을 제안해드립니다. 깨달음이 그냥
                감탄으로 끝나지 않고, 당신의 성장으로 이어지도록 도와드려요.
              </p>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  lineHeight: "1.5",
                  fontStyle: "italic",
                }}
              >
                오늘의 인사이트를 흘려보내면, 같은 패턴을 다시 겪게 될 수
                있어요. 지금 기록을 성장으로 바꿔보세요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AI 코멘트 (Pro 전용) */}
      {isPro && view.insight_ai_comment && (
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
