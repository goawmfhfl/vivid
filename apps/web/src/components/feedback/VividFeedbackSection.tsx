"use client";

import { useState } from "react";
import { Star, Lock, Send, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { COLORS, SPACING, TYPOGRAPHY, CARD_STYLES } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type {
  PageType,
  SubmitFeedbackRequest,
  VividType,
} from "@/types/vivid-feedback";

type VividFeedbackSectionProps = {
  pageType: PageType;
  /** 데일리 페이지일 때: vivid(비전) | review(회고) */
  vividType?: VividType;
};

export function VividFeedbackSection({
  pageType,
  vividType,
}: VividFeedbackSectionProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleStarClick = (value: number) => {
    if (isSubmitted) return;
    setRating(value);
  };

  const handleStarHover = (value: number | null) => {
    if (isSubmitted) return;
    setHoveredRating(value);
  };

  const handleSubmit = async () => {
    if (rating === null) return;
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      const requestBody: SubmitFeedbackRequest = {
        pageType,
        rating,
        comment: comment.trim() || undefined,
        ...(pageType === "daily" && vividType && { vividType }),
      };

      const response = await fetch("/api/vivid-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("피드백 제출에 실패했습니다.");
      }

      setIsSubmitted(true);
      setComment("");
    } catch (error) {
      console.error("피드백 제출 오류:", error);
      alert("피드백 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={cn(
          "rounded-2xl p-6 mb-8",
          SPACING.card.padding
        )}
        style={{
          ...CARD_STYLES.default,
          backgroundColor: COLORS.background.card,
        }}
      >
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div
            className="rounded-full p-3"
            style={{
              backgroundColor: `${COLORS.status.success}20`,
            }}
          >
            <CheckCircle2
              className="w-6 h-6"
              style={{ color: COLORS.status.success }}
            />
          </div>
          <div>
            <p
              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.fontWeight)}
              style={{ color: COLORS.text.primary }}
            >
              피드백을 남겨주셔서 감사합니다!
            </p>
            <p
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary, marginTop: "4px" }}
            >
              여러분의 의견이 vivid를 더 나은 서비스로 만들어갑니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-6 mb-8",
        SPACING.card.padding
      )}
      style={{
        ...CARD_STYLES.default,
        backgroundColor: COLORS.background.card,
      }}
    >
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 mt-0.5" style={{ color: COLORS.text.tertiary }} />
          <div className="flex-1">
            <h3
              className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight)}
              style={{ color: COLORS.text.primary, marginBottom: "4px" }}
            >
              이 VIVID에 대한 의견을 남겨주세요
            </h3>
            <p
              className={cn(TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.tertiary }}
            >
              <span className="font-semibold" style={{ color: COLORS.brand.primary }}>
                익명으로 안전하게
              </span>
              {" "}저장되며, 개인정보는 수집되지 않습니다.
            </p>
          </div>
        </div>

        {/* 별점 선택 */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isActive =
                (hoveredRating !== null && starValue <= hoveredRating) ||
                (hoveredRating === null && rating !== null && starValue <= rating);

              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => handleStarHover(starValue)}
                  onMouseLeave={() => handleStarHover(null)}
                  disabled={isSubmitting}
                  className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  <Star
                    className="w-8 h-8 sm:w-10 sm:h-10"
                    style={{
                      fill: isActive
                        ? COLORS.brand.primary
                        : "transparent",
                      color: isActive
                        ? COLORS.brand.primary
                        : COLORS.border.light,
                      strokeWidth: isActive ? 0 : 1.5,
                      transition: "all 0.2s ease",
                    }}
                  />
                </button>
              );
            })}
          </div>
          {rating !== null && (
            <p
              className={cn(TYPOGRAPHY.body.fontSize, "text-center")}
              style={{ color: COLORS.text.secondary }}
            >
              {rating}점을 선택하셨습니다
            </p>
          )}
        </div>

        {/* 의견 입력 (선택사항) */}
        {rating !== null && (
          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="더 구체적인 의견이 있으시면 자유롭게 남겨주세요 (선택사항)"
              className="resize-none"
              style={{
                backgroundColor: COLORS.background.cardElevated,
                border: `1px solid ${COLORS.border.light}`,
                color: COLORS.text.primary,
                minHeight: "80px",
              }}
              disabled={isSubmitting}
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
              }}
            >
              {isSubmitting ? (
                "제출 중..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  피드백 보내기
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
