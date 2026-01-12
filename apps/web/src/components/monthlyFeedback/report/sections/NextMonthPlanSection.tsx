"use client";

import {
  Rocket,
  Repeat,
  FlaskConical,
} from "lucide-react";
import type { VividReport } from "@/types/monthly-feedback-new";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  GradientCard,
} from "@/components/common/feedback";

type NextMonthPlanSectionProps = {
  nextMonthPlan: VividReport["next_month_plan"];
  vividColor: string;
};

export function NextMonthPlanSection({
  nextMonthPlan,
  vividColor,
}: NextMonthPlanSectionProps) {
  if (!nextMonthPlan) return null;

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
              5
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-5 h-5" style={{ color: vividColor }} />
              <p
                className={cn(
                  TYPOGRAPHY.h3.fontSize,
                  TYPOGRAPHY.h3.fontWeight
                )}
                style={{ color: COLORS.text.primary }}
              >
                실행 가능한 다음 달 플랜
              </p>
            </div>
            <p
              className={cn(TYPOGRAPHY.bodySmall.fontSize)}
              style={{ color: COLORS.text.secondary }}
            >
              다음 달을 위한 구체적이고 실행 가능한 계획을 제시합니다
            </p>
          </div>
        </div>

        {/* 집중 영역 */}
        {nextMonthPlan.focus_areas &&
          nextMonthPlan.focus_areas.length > 0 && (
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
                    5-1
                  </span>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.h3.fontSize,
                    TYPOGRAPHY.h3.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  집중 영역
                </p>
              </div>
              <div className="space-y-4">
                {nextMonthPlan.focus_areas.map((area, idx) => (
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
                          TYPOGRAPHY.body.fontWeight,
                          "mb-2"
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {area.area}
                      </p>
                      <p
                        className={cn(
                          TYPOGRAPHY.bodySmall.fontSize,
                          TYPOGRAPHY.body.lineHeight
                        )}
                        style={{ color: COLORS.text.secondary }}
                      >
                        {area.why}
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
                          {area.current_state}
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
                          {area.desired_state}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 유지할 패턴 */}
        {nextMonthPlan.maintain_patterns &&
          nextMonthPlan.maintain_patterns.length > 0 && (
            <div className="mb-6">
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
                    5-2
                  </span>
                </div>
                <Repeat
                  className="w-5 h-5"
                  style={{ color: "#4CAF50" }}
                />
                <p
                  className={cn(
                    TYPOGRAPHY.h3.fontSize,
                    TYPOGRAPHY.h3.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  유지할 패턴
                </p>
              </div>
              <div className="space-y-3">
                {nextMonthPlan.maintain_patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="relative p-4 rounded-lg overflow-visible"
                    style={{
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                      border: "1px solid rgba(76, 175, 80, 0.3)",
                    }}
                  >
                    {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                    <div
                      className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `#4CAF50`,
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
                    <p
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        "font-semibold mb-2"
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      {pattern.pattern}
                    </p>
                    <p
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        TYPOGRAPHY.body.lineHeight,
                        "mb-2"
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {pattern.why_important}
                    </p>
                    <p
                      className={cn(
                        TYPOGRAPHY.bodySmall.fontSize,
                        TYPOGRAPHY.body.lineHeight,
                        "font-medium"
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      {pattern.how_to_maintain}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 실험할 패턴 */}
        {nextMonthPlan.experiment_patterns &&
          nextMonthPlan.experiment_patterns.length > 0 && (
            <div>
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
                    5-3
                  </span>
                </div>
                <FlaskConical
                  className="w-5 h-5"
                  style={{ color: vividColor }}
                />
                <p
                  className={cn(
                    TYPOGRAPHY.h3.fontSize,
                    TYPOGRAPHY.h3.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  실험할 패턴
                </p>
              </div>
              <div className="space-y-3">
                {nextMonthPlan.experiment_patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="relative p-4 rounded-lg overflow-visible"
                    style={{
                      backgroundColor: "rgba(163, 191, 217, 0.1)",
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
                    <p
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        "font-semibold mb-2"
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      {pattern.pattern}
                    </p>
                    <p
                      className={cn(
                        TYPOGRAPHY.body.fontSize,
                        TYPOGRAPHY.body.lineHeight,
                        "mb-2"
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {pattern.why_suggested}
                    </p>
                    <p
                      className={cn(
                        TYPOGRAPHY.bodySmall.fontSize,
                        TYPOGRAPHY.body.lineHeight,
                        "font-medium"
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      {pattern.how_to_start}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </GradientCard>
    </div>
  );
}
