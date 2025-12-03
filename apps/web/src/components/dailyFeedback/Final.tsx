"use client";

import { Sparkles, Lock } from "lucide-react";
import { Card } from "../ui/card";
import { SectionProps } from "./types";
import { useCountUp } from "@/hooks/useCountUp";

export function FinalSection({ view, isPro = false }: SectionProps) {
  const [displayScore, countRef] = useCountUp({
    targetValue: view.integrity_score ?? 0,
    duration: 1000,
    delay: 900,
    triggerOnVisible: true,
    threshold: 0.3,
  });

  // 내일의 포커스를 리스트로 파싱
  const focusItems = (() => {
    const s = view.tomorrow_focus ?? "";
    if (!s) return [] as string[];
    const byPattern = Array.from(s.matchAll(/\d+\)\s*([^,]+)(?:,|$)/g)).map(
      (m) => m[1].trim().replace(/,$/, "")
    );
    if (byPattern.length > 0) return byPattern;
    return s
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  })();

  // 성장/조정 포인트 리스트 (Pro 전용)
  const growthItems = view.growth_points ?? [];
  const adjustmentItems = view.adjustment_points ?? [];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#6B7A6F" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          오늘의 마무리
        </h2>
      </div>
      <Card
        ref={countRef}
        className="p-6 mb-4"
        style={{
          background: "linear-gradient(135deg, #6B7A6F 0%, #55685E 100%)",
          color: "white",
          border: "none",
        }}
      >
        <div className="mb-3">
          <p
            className="text-xs"
            style={{
              opacity: 0.9,
              marginBottom: "0.5rem",
            }}
          >
            하루 점수
          </p>
          <div className="flex items-center gap-6">
            <p
              className="text-4xl font-semibold"
              style={{
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {displayScore}
            </p>
            <div
              className="relative flex-1 overflow-hidden rounded-full"
              style={{
                height: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${displayScore * 10}%`,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          </div>
        </div>
      </Card>
      {view.closing_message && (
        <Card
          className="p-6 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Sparkles
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#A8BBA8" }}
            />
            <p
              className="text-sm"
              style={{ color: "#333333", lineHeight: "1.8" }}
            >
              {view.closing_message}
            </p>
          </div>
        </Card>
      )}
      {/* AI 메시지 (Pro 전용) */}
      {isPro && view.ai_message && (
        <Card
          className="p-6 mb-4"
          style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Sparkles
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#A8BBA8" }}
            />
            <p
              className="text-sm"
              style={{ color: "#333333", lineHeight: "1.8" }}
            >
              {view.ai_message}
            </p>
          </div>
        </Card>
      )}
      {/* 성장/조정 포인트 (Pro 전용 리스트) */}
      {isPro && (growthItems.length > 0 || adjustmentItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {growthItems.length > 0 && (
            <Card
              className="p-5"
              style={{
                backgroundColor: "#F4F6F4",
                border: "1px solid #E6E4DE",
              }}
            >
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                성장 포인트
              </p>
              <ul className="space-y-2">
                {growthItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className="inline-flex w-1.5 h-1.5 rounded-full mt-2"
                      style={{ backgroundColor: "#6B7A6F" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "#333333", lineHeight: "1.6" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {adjustmentItems.length > 0 && (
            <Card
              className="p-5"
              style={{
                backgroundColor: "#F9F3EF",
                border: "1px solid #E6E4DE",
              }}
            >
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  marginBottom: "0.75rem",
                }}
              >
                조정 포인트
              </p>
              <ul className="space-y-2">
                {adjustmentItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className="inline-flex w-1.5 h-1.5 rounded-full mt-2"
                      style={{ backgroundColor: "#B89A7A" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "#333333", lineHeight: "1.6" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Free 모드: 성장/조정 포인트 Pro 업그레이드 유도 */}
      {!isPro && (growthItems.length > 0 || adjustmentItems.length > 0) && (
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
                오늘 하루에서 배운 점을 더 깊게 정리해보고 싶으신가요?
              </p>
              <p
                className="text-xs"
                style={{
                  color: "#6B7A6F",
                  lineHeight: "1.5",
                  marginBottom: "0.5rem",
                }}
              >
                Pro 멤버십에서는 성장 포인트와 조정 포인트를 리스트로 정리해
                드리고, 오늘 점수가 나온 이유까지 함께 정리해 드립니다. 기록을
                성장으로 바꾸는 당신만의 마무리 리포트를 확인해보세요.
              </p>
            </div>
          </div>
        </Card>
      )}
      <Card
        className="p-6"
        style={{ backgroundColor: "#8FA894", color: "white", border: "none" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs"
              style={{
                opacity: 0.9,
                marginBottom: "0.5rem",
              }}
            >
              내일의 포커스
            </p>
            {focusItems.length > 0 ? (
              <ul className="space-y-2">
                {focusItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.35)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm" style={{ lineHeight: "1.6" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ lineHeight: "1.6" }}>
                {view.tomorrow_focus}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
