import { Target, Sparkles, Lock } from "lucide-react";
import { Card } from "../ui/card";
import { ScrollingKeywords } from "../ui/ScrollingKeywords";
import { SectionProps } from "./types";

export function VisionSection({ view, isPro = false }: SectionProps) {
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
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          오늘의 시각화
        </h2>
      </div>

      {/* 기본 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card
          className="p-5"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-xs"
            style={{
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            시각화 요약
          </p>
          <p
            className="text-sm"
            style={{ color: "#333333", lineHeight: "1.7" }}
          >
            {view.vision_summary}
          </p>
        </Card>
        <Card
          className="p-5"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-xs"
            style={{
              color: "#6B7A6F",
              marginBottom: "0.75rem",
            }}
          >
            자기 평가
          </p>
          <p
            className="text-sm"
            style={{ color: "#333333", lineHeight: "1.7" }}
          >
            {view.vision_self}
          </p>
        </Card>
      </div>

      {/* 키워드 스크롤링 (Free/Pro 공통) */}
      {view.vision_keywords && view.vision_keywords.length > 0 && (
        <div className="mb-4 -mx-4 px-4">
          <ScrollingKeywords keywords={view.vision_keywords} />
        </div>
      )}

      {/* Pro 전용: 시각화를 통해 이루고 싶은 꿈 목표 리스트 */}
      {isPro && view.dream_goals && view.dream_goals.length > 0 && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "#E5B96B" }} />
            <p className="text-xs font-semibold" style={{ color: "#6B7A6F" }}>
              이 시각화가 가리키는 꿈 목표 (Pro)
            </p>
          </div>
          <ul className="space-y-2">
            {view.dream_goals.map((goal, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#E5B96B" }}
                />
                <p
                  className="text-sm"
                  style={{ color: "#4E4B46", lineHeight: "1.6" }}
                >
                  {goal}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Pro 전용: 이런 꿈을 꾸는 사람들의 특징 */}
      {isPro && view.dreamer_traits && view.dreamer_traits.length > 0 && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "#F7F8F6", border: "1px solid #E6E4DE" }}
        >
          <p
            className="text-xs font-semibold mb-3"
            style={{ color: "#6B7A6F" }}
          >
            이런 꿈을 꾸는 사람의 특징 (Pro)
          </p>
          <ul className="space-y-2">
            {view.dreamer_traits.map((trait, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: "#A8BBA8" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "#55685E", lineHeight: "1.6" }}
                >
                  {trait}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 핵심 3단 피드백 */}
      {feedbackItems.length > 0 && (
        <Card
          className="p-5 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <div className="flex items-start gap-2 mb-3">
            <Sparkles
              className="w-4 h-4 flex-shrink-0 mt-1"
              style={{ color: "#E5B96B", opacity: 0.85 }}
            />
            <p className="text-xs" style={{ color: "#6B7A6F" }}>
              핵심 3단
            </p>
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
                  className="text-sm"
                  style={{
                    color: "#55685E",
                    lineHeight: "1.6",
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Card>
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
                더 깊은 시각화 분석이 필요하신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  lineHeight: "1.5",
                }}
              >
                Pro 멤버십에서는 시각화를 통해 이루고 싶은 꿈 목표 리스트와,
                비슷한 꿈을 꾸는 사람들의 특징을 정리해 드립니다. 기록을
                성장으로 바꾸는 당신만의 비전 지도를 함께 만들어보세요.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
