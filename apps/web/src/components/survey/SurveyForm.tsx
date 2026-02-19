"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AppHeader } from "@/components/common/AppHeader";
import { SurveySection } from "./SurveySection";
import {
  SURVEY_SECTIONS,
  type SurveySection as SurveySectionType,
} from "@/constants/survey";
import {
  COLORS,
  CARD_STYLES,
  SPACING,
  TYPOGRAPHY,
  GRADIENT_UTILS,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { SURVEY_SCORE_QUESTION_IDS } from "@/constants/survey";
import type { QuestionScores } from "@/types/survey";
import { ShieldCheck, Gift, Send, CheckCircle } from "lucide-react";

export function SurveyForm() {
  const [questionScores, setQuestionScores] = useState<QuestionScores>({});
  const [freeComment, setFreeComment] = useState("");
  const [phone, setPhone] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string>("1");
  const [hasParticipated, setHasParticipated] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const checkParticipation = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setHasParticipated(false);
        return;
      }
      const res = await fetch("/api/survey/participation-status", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "조회 실패");
      setHasParticipated(data.hasParticipated);
    } catch {
      setHasParticipated(false);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    checkParticipation();
  }, [checkParticipation]);

  useEffect(() => {
    if (hasParticipated || isSubmitted) return;
    const ids = ["1", "2", "3", "4", "5"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section-id");
            if (id) setActiveSectionId(id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(`survey-section-${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [hasParticipated, isSubmitted]);

  const handleScoreSelect = (questionId: string, score: number) => {
    setQuestionScores((prev) => ({ ...prev, [questionId]: score }));
  };

  const isFormValid = () => {
    return SURVEY_SCORE_QUESTION_IDS.every(
      (id) =>
        typeof questionScores[id] === "number" &&
        questionScores[id] >= 0 &&
        questionScores[id] <= 5
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("모든 질문에 답변해주세요. (섹션 1~4: 0~5점 선택)");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("로그인이 필요합니다.");
      }
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionScores,
          freeComment: freeComment.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "제출 실패");
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div
        className={cn(
          SPACING.page.maxWidthNarrow,
          "mx-auto w-full min-w-0 max-w-full overflow-x-hidden",
          "px-3 min-[365px]:px-4 sm:px-6 py-6 pb-24"
        )}
      >
        <AppHeader title="설문 참여" showBackButton />
        <div className="flex items-center justify-center min-h-[300px]">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: COLORS.brand.primary }}
          />
        </div>
      </div>
    );
  }

  if (hasParticipated) {
    return (
      <div
        className={cn(
          SPACING.page.maxWidthNarrow,
          "mx-auto w-full min-w-0 max-w-full overflow-x-hidden",
          "px-3 min-[365px]:px-4 sm:px-6 py-6 pb-24"
        )}
      >
        <AppHeader title="설문 참여" showBackButton />
        <div
          className="rounded-2xl p-8 text-center"
          style={{ ...CARD_STYLES.default }}
        >
          <CheckCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: COLORS.status.success }}
          />
          <h2 className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight, "mb-2")} style={{ color: COLORS.text.primary }}>
            이미 참여하셨습니다
          </h2>
          <p className={cn(TYPOGRAPHY.body.fontSize)} style={{ color: COLORS.text.secondary }}>
            참여해 주셔서 감사합니다.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div
        className={cn(
          SPACING.page.maxWidthNarrow,
          "mx-auto w-full min-w-0 max-w-full overflow-x-hidden",
          "px-3 min-[365px]:px-4 sm:px-6 py-6 pb-24"
        )}
      >
        <AppHeader title="설문 참여" showBackButton />
        <div
          className="rounded-2xl p-8 text-center"
          style={{ ...CARD_STYLES.default }}
        >
          <CheckCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: COLORS.status.success }}
          />
          <h2 className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight, "mb-2")} style={{ color: COLORS.text.primary }}>
            제출 완료
          </h2>
          <p className={cn(TYPOGRAPHY.body.fontSize, "mb-4")} style={{ color: COLORS.text.secondary }}>
            소중한 의견 감사합니다.
          </p>
        </div>
      </div>
    );
  }

  const scoreSections = SURVEY_SECTIONS.filter((s) => s.id !== "5");

  return (
    <div
      className={cn(
        SPACING.page.maxWidthNarrow,
        "mx-auto w-full min-w-0 max-w-full overflow-x-hidden",
        "px-3 min-[365px]:px-4 sm:px-6",
        "py-6 pb-24"
      )}
    >
      <AppHeader title="설문 참여" showBackButton />

      {/* 섹션 네비게이션 */}
      <div
        className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 min-w-0 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SURVEY_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setActiveSectionId(s.id);
              document
                .getElementById(`survey-section-${s.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
              activeSectionId === s.id ? "text-white" : ""
            )}
            style={{
              backgroundColor:
                activeSectionId === s.id
                  ? COLORS.brand.primary
                  : COLORS.background.hover,
              color:
                activeSectionId === s.id
                  ? COLORS.text.white
                  : COLORS.text.secondary,
            }}
          >
            {s.id === "1"
              ? "나를 이해"
              : s.id === "2"
                ? "기록·성장"
                : s.id === "3"
                  ? "비전 설계"
                  : s.id === "4"
                    ? "앱 경험"
                    : "자유의견"}
          </button>
        ))}
      </div>

      {/* 익명 배너 */}
      <div
        className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 min-w-0"
        style={{
          background: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.15),
          border: `1px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.light, "30")}`,
        }}
      >
        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: COLORS.brand.primary }} />
        <p className={cn("text-xs sm:text-sm", TYPOGRAPHY.body.fontSize)} style={{ color: COLORS.text.secondary }}>
          이 설문은 <strong style={{ color: COLORS.text.primary }}>익명</strong>으로 작성됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 min-w-0">
        {error && (
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: `${COLORS.status.error}20`,
              border: `1px solid ${COLORS.status.error}`,
            }}
          >
            <p style={{ color: COLORS.status.error }}>{error}</p>
          </div>
        )}

        {scoreSections.map((section) => (
          <SurveySection
            key={section.id}
            section={section}
            sectionIndex={Number(section.id) - 1}
            questionScores={questionScores}
            freeComment=""
            onScoreSelect={handleScoreSelect}
            onFreeCommentChange={() => {}}
            isActive={activeSectionId === section.id}
          />
        ))}

        {/* 섹션 5: 자유의견 */}
        <SurveySection
          section={SURVEY_SECTIONS[4]}
          sectionIndex={4}
          questionScores={{}}
          freeComment={freeComment}
          onScoreSelect={() => {}}
          onFreeCommentChange={setFreeComment}
          isActive={activeSectionId === "5"}
        />

        {/* 추첨 섹션 */}
        <div
          className="rounded-2xl p-4 sm:p-6 lg:p-8 min-w-0"
          style={{ ...CARD_STYLES.default }}
        >
          <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" style={{ color: COLORS.brand.primary }} />
            <div className="min-w-0 flex-1">
              <h3 className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight, "mb-1 sm:mb-2")} style={{ color: COLORS.text.primary }}>
                추첨 안내
              </h3>
              <p className={cn("text-xs sm:text-sm", TYPOGRAPHY.body.fontSize)} style={{ color: COLORS.text.secondary }}>
                핸드폰 번호를 남겨주시면 추첨을 통해 소정의 상품을 보내드립니다.
              </p>
            </div>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000 (선택)"
            className="w-full min-w-0 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border transition-all outline-none focus:ring-2 text-sm sm:text-base"
            style={{
              borderColor: COLORS.border.input,
              backgroundColor: COLORS.background.base,
              color: COLORS.text.primary,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="w-full min-w-0 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          style={{
            background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.secondary} 100%)`,
            color: COLORS.text.white,
            boxShadow: `0 4px 12px ${COLORS.brand.primary}40`,
          }}
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? "제출 중..." : "제출하기"}
        </button>
      </form>
    </div>
  );
}
