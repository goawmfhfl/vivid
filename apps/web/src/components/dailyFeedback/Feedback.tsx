import { TrendingUp, Sparkles, Lock, Heart, User } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";

export function FeedbackSection({ view, isPro = false }: SectionProps) {
  // Free 모드에서는 최대 3개만 표시
  const displayedPositives = isPro
    ? view.positives
    : view.positives.slice(0, 3);
  const displayedImprovements = isPro
    ? view.improvements
    : view.improvements.slice(0, 3);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          오늘의 자기 피드백
        </h2>
      </div>

      {/* 핵심 피드백 */}
      {view.core_feedback && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-sm"
            style={{ color: "#333333", lineHeight: "1.7" }}
          >
            {view.core_feedback}
          </p>
        </Card>
      )}

      {/* 잘한 점 & 개선할 점 */}
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
            {displayedPositives.map((item, index) => (
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
          {!isPro && view.positives.length > 3 && (
            <p
              className="text-xs mt-2"
              style={{
                color: "#6B7A6F",
                fontStyle: "italic",
              }}
            >
              +{view.positives.length - 3}개 더 보려면 Pro로 업그레이드하세요
            </p>
          )}
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
            {displayedImprovements.map((item, index) => (
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
          {!isPro && view.improvements.length > 3 && (
            <p
              className="text-xs mt-2"
              style={{
                color: "#6B7A6F",
                fontStyle: "italic",
              }}
            >
              +{view.improvements.length - 3}개 더 보려면 Pro로 업그레이드하세요
            </p>
          )}
        </Card>
      </div>

      {/* 피드백을 통해 알 수 있는 사람들의 특징 (Pro 전용) */}
      {isPro &&
        view.feedback_person_traits &&
        view.feedback_person_traits.length > 0 && (
          <Card
            className="p-5 mb-4"
            style={{
              backgroundColor: "#F7F8F6",
              borderLeft: "3px solid #6B7A6F",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" style={{ color: "#6B7A6F" }} />
              <p
                className="text-xs font-semibold"
                style={{
                  color: "#6B7A6F",
                }}
              >
                이 피드백을 통해 알 수 있는 나의 특징
              </p>
            </div>
            <ul className="space-y-2">
              {view.feedback_person_traits.map((trait, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: "#6B7A6F" }}
                  />
                  <p
                    className="text-sm"
                    style={{
                      color: "#4E4B46",
                      lineHeight: "1.6",
                    }}
                  >
                    {trait}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}

      {/* 응원의 메시지 (Pro 전용) */}
      {isPro && view.encouragement_message && (
        <Card
          className="p-5 mb-4"
          style={{
            backgroundColor: "#F5F7F5",
            borderLeft: "3px solid #A8BBA8",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4" style={{ color: "#A8BBA8" }} />
            <p
              className="text-xs font-semibold"
              style={{
                color: "#6B7A6F",
              }}
            >
              응원의 메시지
            </p>
          </div>
          <p
            className="text-sm"
            style={{
              color: "#4E4B46",
              lineHeight: "1.7",
            }}
          >
            {view.encouragement_message}
          </p>
        </Card>
      )}

      {/* AI 코멘트 */}
      {view.feedback_ai_comment && (
        <div
          className="p-5 rounded-xl flex gap-3 mb-4"
          style={{ backgroundColor: "#F5F7F5", border: "1px solid #E6E4DE" }}
        >
          <Sparkles
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: "#A8BBA8" }}
          />
          <p
            className="text-sm"
            style={{ color: "#4E4B46", lineHeight: "1.7" }}
          >
            {view.feedback_ai_comment}
          </p>
        </div>
      )}

      {/* AI 메시지 (Pro 전용) */}
      {isPro && view.ai_message && (
        <div
          className="p-5 rounded-xl flex gap-3"
          style={{
            backgroundColor: "#F5F7F5",
            borderLeft: "3px solid #A8BBA8",
          }}
        >
          <Sparkles
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: "#A8BBA8" }}
          />
          <div className="flex-1">
            <p
              className="text-xs"
              style={{
                color: "#6B7A6F",
                marginBottom: "0.5rem",
              }}
            >
              AI 메시지
            </p>
            <p
              className="text-sm"
              style={{
                color: "#4E4B46",
                lineHeight: "1.7",
              }}
            >
              {view.ai_message}
            </p>
          </div>
        </div>
      )}

      {/* Free 모드: Pro 업그레이드 유도 */}
      {!isPro && (
        <Card
          className="p-4"
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
                더 깊은 피드백 분석이 필요하신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  lineHeight: "1.5",
                  marginBottom: "0.5rem",
                }}
              >
                Pro 멤버십에서는 잘한 점과 개선할 점을 최대 6개까지 제공하고,
                이 피드백을 통해 알 수 있는 나의 특징과 응원의 메시지를 함께
                정리해 드립니다. 기록을 성장으로 바꾸는 당신만의 피드백 지도를
                함께 만들어보세요.
              </p>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  lineHeight: "1.5",
                  fontStyle: "italic",
                }}
              >
                오늘의 피드백을 흘려보내면, 같은 패턴을 다시 겪게 될 수 있어요.
                지금 기록을 성장으로 바꿔보세요.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
