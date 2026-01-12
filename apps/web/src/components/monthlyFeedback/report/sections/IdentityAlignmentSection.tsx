"use client";

import {
  Users,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Rocket,
} from "lucide-react";
import type { VividReport } from "@/types/monthly-feedback-new";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  GradientCard,
  EvidenceDropdown,
} from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";

// 특성 매핑 아이템 컴포넌트
function TraitMappingItem({
  mapping,
  idx,
  vividColor,
}: {
  mapping: VividReport["identity_alignment"]["trait_mapping"][number];
  idx: number;
  vividColor: string;
}) {
  const matchPercent = Math.round(mapping.match_score * 100);
  const animatedPercent = useCountUp(matchPercent, 1200);
  const animatedWidth = useCountUp(matchPercent, 1200);

  return (
    <div
      className="relative p-4 rounded-lg overflow-visible"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        border: "1px solid rgba(163, 191, 217, 0.3)",
      }}
    >
      {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
      <div
        className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `${vividColor}`,
          border: `2px solid white`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)`,
          transform: `rotate(-3deg)`,
        }}
      >
        <span
          className={cn(
            TYPOGRAPHY.caption.fontSize,
            TYPOGRAPHY.caption.fontWeight
          )}
          style={{ color: "white" }}
        >
          {idx + 1}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <p
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              "mb-1 uppercase"
            )}
            style={{ color: COLORS.text.tertiary }}
          >
            현재 나의 모습
          </p>
          <p
            className={cn(
              TYPOGRAPHY.body.fontSize,
              "font-medium"
            )}
            style={{ color: COLORS.text.primary }}
          >
            {mapping.current}
          </p>
        </div>
        <div>
          <p
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              "mb-1 uppercase"
            )}
            style={{ color: COLORS.text.tertiary }}
          >
            목표하는 모습
          </p>
          <p
            className={cn(
              TYPOGRAPHY.body.fontSize,
              "font-medium"
            )}
            style={{ color: COLORS.text.primary }}
          >
            {mapping.aspired}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "#E8F0F8" }}
        >
          <div
            className="h-full transition-all duration-1000 ease-out"
            style={{
              width: `${animatedWidth}%`,
              backgroundColor: vividColor,
            }}
          />
        </div>
        <span
          className={cn(
            TYPOGRAPHY.bodySmall.fontSize,
            "font-semibold whitespace-nowrap"
          )}
          style={{ color: vividColor }}
        >
          {animatedPercent}%
        </span>
      </div>
      <p
        className={cn(
          TYPOGRAPHY.body.fontSize,
          TYPOGRAPHY.body.lineHeight,
          "mb-2"
        )}
        style={{ color: COLORS.text.secondary }}
      >
        {mapping.gap_description}
      </p>
      {mapping.progress_evidence &&
        mapping.progress_evidence.length > 0 && (
          <EvidenceDropdown
            evidence={mapping.progress_evidence}
            color="163, 191, 217"
            label="진행 증거"
          />
        )}
    </div>
  );
}

type IdentityAlignmentSectionProps = {
  identityAlignment: VividReport["identity_alignment"];
  vividColor: string;
};

export function IdentityAlignmentSection({
  identityAlignment,
  vividColor,
}: IdentityAlignmentSectionProps) {
  if (!identityAlignment) return null;

  return (
    <div className="space-y-5">
      <GradientCard gradientColor="163, 191, 217">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${vividColor}, ${vividColor}dd)`,
              border: `2px solid ${vividColor}40`,
              boxShadow: `0 2px 8px ${vividColor}20`,
            }}
          >
            <span
              className={cn(
                TYPOGRAPHY.h4.fontSize,
                TYPOGRAPHY.h4.fontWeight
              )}
              style={{ color: "white" }}
            >
              4
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5" style={{ color: vividColor }} />
              <p
                className={cn(
                  TYPOGRAPHY.h3.fontSize,
                  TYPOGRAPHY.h3.fontWeight
                )}
                style={{ color: COLORS.text.primary }}
              >
                나의 모습과 목표 연결
              </p>
            </div>
            <p
              className={cn(TYPOGRAPHY.bodySmall.fontSize)}
              style={{ color: COLORS.text.secondary }}
            >
              현재 나의 모습과 목표 비전이 얼마나 잘 맞는지 분석합니다
            </p>
          </div>
        </div>

        {/* 나의 모습 분석 */}
        {identityAlignment.trait_mapping &&
          identityAlignment.trait_mapping.length > 0 && (
            <ScrollAnimation>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${vividColor}20`,
                      border: `1px solid ${vividColor}40`,
                    }}
                  >
                    <span
                      className={cn(
                        TYPOGRAPHY.bodySmall.fontSize,
                        TYPOGRAPHY.bodySmall.fontWeight
                      )}
                      style={{ color: vividColor }}
                    >
                      4-1
                    </span>
                  </div>
                  <p
                    className={cn(
                      TYPOGRAPHY.h3.fontSize,
                      TYPOGRAPHY.h3.fontWeight
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    나의 모습 분석
                  </p>
                </div>
                <div className="space-y-4">
                  {identityAlignment.trait_mapping.map((mapping, idx) => (
                    <TraitMappingItem key={idx} mapping={mapping} idx={idx} vividColor={vividColor} />
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

        {/* 나의 모습 변화 */}
        {identityAlignment.trait_evolution && (
          <ScrollAnimation>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${vividColor}20`,
                    border: `1px solid ${vividColor}40`,
                  }}
                >
                  <span
                    className={cn(
                      TYPOGRAPHY.bodySmall.fontSize,
                      TYPOGRAPHY.bodySmall.fontWeight
                    )}
                    style={{ color: vividColor }}
                  >
                    4-2
                  </span>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.h3.fontSize,
                    TYPOGRAPHY.h3.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  나의 모습 변화
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 강해진 모습 */}
                {identityAlignment.trait_evolution.strengthened &&
                  identityAlignment.trait_evolution.strengthened.length >
                    0 && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "rgba(127, 143, 122, 0.08)",
                        border: "1px solid rgba(127, 143, 122, 0.25)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowUp
                          className="w-4 h-4"
                          style={{ color: "#7f8f7a" }}
                        />
                        <p
                          className={cn(
                            TYPOGRAPHY.label.fontSize,
                            TYPOGRAPHY.label.fontWeight,
                            "uppercase"
                          )}
                          style={{ color: "#7f8f7a" }}
                        >
                          강해진 모습
                        </p>
                      </div>
                      <div className="space-y-2">
                        {identityAlignment.trait_evolution.strengthened.map(
                          (trait, idx) => (
                            <div key={idx}>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  "font-semibold mb-1"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {trait.trait}
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.secondary }}
                              >
                                {trait.early_month} → {trait.late_month}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* 새로 나타난 모습 */}
                {identityAlignment.trait_evolution.emerging &&
                  identityAlignment.trait_evolution.emerging.length > 0 && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "rgba(139, 156, 186, 0.08)",
                        border: "1px solid rgba(139, 156, 186, 0.25)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles
                          className="w-4 h-4"
                          style={{ color: "#8B9CBA" }}
                        />
                        <p
                          className={cn(
                            TYPOGRAPHY.label.fontSize,
                            TYPOGRAPHY.label.fontWeight,
                            "uppercase"
                          )}
                          style={{ color: "#8B9CBA" }}
                        >
                          새로 나타난 모습
                        </p>
                      </div>
                      <div className="space-y-2">
                        {identityAlignment.trait_evolution.emerging.map(
                          (trait, idx) => (
                            <div key={idx}>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  "font-semibold mb-1"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {trait.trait}
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.secondary }}
                              >
                                {trait.first_date}부터 {trait.frequency}회
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* 사라진 모습 */}
                {identityAlignment.trait_evolution.fading &&
                  identityAlignment.trait_evolution.fading.length > 0 && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "rgba(148, 163, 184, 0.08)",
                        border: "1px solid rgba(148, 163, 184, 0.25)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowDown
                          className="w-4 h-4"
                          style={{ color: "#94A3B8" }}
                        />
                        <p
                          className={cn(
                            TYPOGRAPHY.label.fontSize,
                            TYPOGRAPHY.label.fontWeight,
                            "uppercase"
                          )}
                          style={{ color: "#94A3B8" }}
                        >
                          사라진 모습
                        </p>
                      </div>
                      <div className="space-y-2">
                        {identityAlignment.trait_evolution.fading.map(
                          (trait, idx) => (
                            <div key={idx}>
                              <p
                                className={cn(
                                  TYPOGRAPHY.body.fontSize,
                                  "font-semibold mb-1"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {trait.trait}
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  TYPOGRAPHY.body.lineHeight
                                )}
                                style={{ color: COLORS.text.secondary }}
                              >
                                마지막: {trait.last_appeared}
                              </p>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  TYPOGRAPHY.body.lineHeight,
                                  "mt-1"
                                )}
                                style={{ color: COLORS.text.tertiary }}
                              >
                                {trait.why}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </ScrollAnimation>
        )}

        {/* 집중할 모습 */}
        {identityAlignment.focus_traits &&
          identityAlignment.focus_traits.length > 0 && (
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${vividColor}20`,
                    border: `1px solid ${vividColor}40`,
                  }}
                >
                  <span
                    className={cn(
                      TYPOGRAPHY.bodySmall.fontSize,
                      TYPOGRAPHY.bodySmall.fontWeight
                    )}
                    style={{ color: vividColor }}
                  >
                    4-3
                  </span>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.h3.fontSize,
                    TYPOGRAPHY.h3.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  다음 달 집중할 모습
                </p>
              </div>
              <div className="space-y-4">
                {identityAlignment.focus_traits.map((trait, idx) => (
                  <div
                    key={idx}
                    className="relative p-5 rounded-xl transition-all duration-300 overflow-visible"
                    style={{
                      background: `linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.7) 50%, rgba(255, 255, 255, 1) 100%)`,
                      border: `1.5px solid rgba(163, 191, 217, 0.3)`,
                      boxShadow: `0 2px 8px rgba(163, 191, 217, 0.1)`,
                    }}
                  >
                    {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                    <div
                      className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${vividColor}`,
                        border: `2px solid white`,
                        boxShadow: `0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)`,
                        transform: `rotate(-3deg)`,
                      }}
                    >
                      <span
                        className={cn(
                          TYPOGRAPHY.caption.fontSize,
                          TYPOGRAPHY.caption.fontWeight
                        )}
                        style={{ color: "white" }}
                      >
                        {idx + 1}
                      </span>
                    </div>
                    {/* 제목 */}
                    <div className="mb-4">
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.fontWeight
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {trait.trait}
                      </p>
                    </div>

                    {/* 현재 vs 원하는 상태 비교 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "rgba(148, 163, 184, 0.08)",
                          border: `1px solid rgba(148, 163, 184, 0.2)`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: "rgba(148, 163, 184, 0.6)" }}
                          />
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight,
                              "uppercase"
                            )}
                            style={{ color: COLORS.text.tertiary }}
                          >
                            현재 상태
                          </p>
                        </div>
                        <p
                          className={cn(
                            TYPOGRAPHY.bodySmall.fontSize,
                            TYPOGRAPHY.body.lineHeight
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          {trait.current_state}
                        </p>
                      </div>
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: `rgba(163, 191, 217, 0.12)`,
                          border: `1px solid rgba(163, 191, 217, 0.25)`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: vividColor }}
                          />
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight,
                              "uppercase"
                            )}
                            style={{ color: COLORS.text.tertiary }}
                          >
                            원하는 상태
                          </p>
                        </div>
                        <p
                          className={cn(
                            TYPOGRAPHY.bodySmall.fontSize,
                            TYPOGRAPHY.body.lineHeight
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          {trait.desired_state}
                        </p>
                      </div>
                    </div>

                    {/* 실행 계획 */}
                    <div
                      className="pt-4 border-t"
                      style={{ borderColor: `rgba(163, 191, 217, 0.25)` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Rocket
                          className="w-4 h-4"
                          style={{ color: vividColor }}
                        />
                        <p
                          className={cn(
                            TYPOGRAPHY.bodySmall.fontSize,
                            TYPOGRAPHY.bodySmall.fontWeight
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          실행 계획
                        </p>
                      </div>
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: `rgba(163, 191, 217, 0.12)`,
                          border: `1px solid rgba(163, 191, 217, 0.25)`,
                        }}
                      >
                        <p
                          className={cn(
                            TYPOGRAPHY.bodySmall.fontSize,
                            TYPOGRAPHY.body.lineHeight
                          )}
                          style={{ color: COLORS.text.secondary }}
                        >
                          {trait.monthly_action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </GradientCard>
    </div>
  );
}
