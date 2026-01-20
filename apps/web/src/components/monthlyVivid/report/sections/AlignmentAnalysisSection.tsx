"use client";

import {
  Rocket,
} from "lucide-react";
import type { MonthlyReport } from "@/types/monthly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  GradientCard,
} from "@/components/common/feedback";

type AlignmentAnalysisSectionProps = {
  alignmentAnalysis: MonthlyReport["alignment_analysis"];
  vividColor: string;
};


export function AlignmentAnalysisSection({
  alignmentAnalysis,
  vividColor,
}: AlignmentAnalysisSectionProps) {
  if (!alignmentAnalysis) return null;

  return (
    <div className="space-y-5">
      <GradientCard gradientColor="163, 191, 217">
        <div className="relative mb-8 pb-6 border-b" style={{ borderColor: `rgba(163, 191, 217, 0.2)` }}>
          <div className="flex items-start gap-4">
            {/* 번호 배지 - 더 세련된 스타일 */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${vividColor}, ${vividColor}cc)`,
                  boxShadow: `0 4px 12px ${vividColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                }}
              >
                <span
                  className={cn(
                    TYPOGRAPHY.h3.fontSize,
                    TYPOGRAPHY.h3.fontWeight,
                    "relative z-10"
                  )}
                  style={{ color: "white" }}
                >
                  2
                </span>
                {/* 미묘한 그라데이션 오버레이 */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%)`,
                  }}
                />
              </div>
            </div>
            
            {/* 텍스트 영역 */}
            <div className="flex-1 pt-1">
              <h2
                className={cn(
                  TYPOGRAPHY.h2.fontSize,
                  TYPOGRAPHY.h2.fontWeight,
                  "mb-2"
                )}
                style={{ color: COLORS.text.primary }}
              >
                현재-미래 일치도 분석
              </h2>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  "leading-relaxed"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                현재 상태와 미래 목표 간의 일치도를 분석합니다
              </p>
            </div>
          </div>
        </div>

        {/* 격차 분석 */}
        {alignmentAnalysis.gap_analysis?.biggest_gaps &&
          alignmentAnalysis.gap_analysis.biggest_gaps.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b" style={{ borderColor: `rgba(163, 191, 217, 0.15)` }}>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${vividColor}dd, ${vividColor}bb)`,
                      boxShadow: `0 2px 8px ${vividColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                    }}
                  >
                    <span
                      className={cn(
                        TYPOGRAPHY.bodySmall.fontSize,
                        TYPOGRAPHY.bodySmall.fontWeight,
                        "relative z-10"
                      )}
                      style={{ color: "white" }}
                    >
                      2-2
                    </span>
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 70%)`,
                      }}
                    />
                  </div>
                  <h3
                    className={cn(
                      TYPOGRAPHY.h3.fontSize,
                      TYPOGRAPHY.h3.fontWeight
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    주요 격차
                  </h3>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.caption.fontSize,
                    TYPOGRAPHY.body.lineHeight,
                    "ml-11"
                  )}
                  style={{ color: COLORS.text.tertiary }}
                >
                  현재 상태와 원하는 상태 사이의 가장 큰 차이점을 분석합니다
                </p>
              </div>
              <div className="space-y-4">
                {alignmentAnalysis.gap_analysis.biggest_gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))`,
                      border: `1.5px solid rgba(163, 191, 217, 0.3)`,
                      boxShadow: `0 2px 8px rgba(163, 191, 217, 0.1)`,
                    }}
                  >
                    {/* 격차 제목/인사이트 */}
                    <div className="mb-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `${vividColor}25`,
                            border: `1px solid ${vividColor}45`,
                          }}
                        >
                          <span
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight
                            )}
                            style={{ color: vividColor }}
                          >
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight,
                              "mb-1"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            핵심 인사이트
                          </p>
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight
                            )}
                            style={{ color: COLORS.text.secondary }}
                          >
                            {gap.gap_description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 현재 vs 원하는 상태 비교 */}
                    <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `rgba(163, 191, 217, 0.12)` }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `${vividColor}80` }}
                            />
                            <p
                              className={cn(
                                TYPOGRAPHY.caption.fontSize,
                                TYPOGRAPHY.caption.fontWeight,
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
                              TYPOGRAPHY.body.lineHeight,
                              "pl-4"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {gap.current_state}
                          </p>
                        </div>
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: vividColor }}
                            />
                            <p
                              className={cn(
                                TYPOGRAPHY.caption.fontSize,
                                TYPOGRAPHY.caption.fontWeight,
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
                              TYPOGRAPHY.body.lineHeight,
                              "pl-4"
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            {gap.desired_state}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 실행 가능한 단계 */}
                    {gap.actionable_steps && gap.actionable_steps.length > 0 && (
                      <div className="pt-4 border-t" style={{ borderColor: `rgba(163, 191, 217, 0.25)` }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Rocket className="w-4 h-4" style={{ color: vividColor }} />
                          <p
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              TYPOGRAPHY.bodySmall.fontWeight
                            )}
                            style={{ color: COLORS.text.primary }}
                          >
                            다음 단계
                          </p>
                        </div>
                        <ul className="space-y-2.5">
                          {gap.actionable_steps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-3">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: `rgba(163, 191, 217, 0.12)`,
                                  border: `1px solid rgba(163, 191, 217, 0.25)`,
                                }}
                              >
                                <span
                                  className={cn(
                                    TYPOGRAPHY.caption.fontSize,
                                    TYPOGRAPHY.caption.fontWeight
                                  )}
                                  style={{ color: vividColor }}
                                >
                                  {sIdx + 1}
                                </span>
                              </div>
                              <p
                                className={cn(
                                  TYPOGRAPHY.bodySmall.fontSize,
                                  TYPOGRAPHY.body.lineHeight,
                                  "flex-1 pt-0.5"
                                )}
                                style={{ color: COLORS.text.primary }}
                              >
                                {step}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </GradientCard>
    </div>
  );
}
