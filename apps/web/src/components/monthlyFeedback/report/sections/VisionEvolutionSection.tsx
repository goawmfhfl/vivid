"use client";

import {
  Target,
  Calendar,
  TrendingUp,
} from "lucide-react";
import type { VividReport } from "@/types/monthly-feedback-new";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
  GradientCard,
} from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";

// 핵심 비전 아이템 컴포넌트
function CoreVisionItem({
  vision,
  idx,
  vividColor,
}: {
  vision: VividReport["vision_evolution"]["core_visions"][number];
  idx: number;
  vividColor: string;
}) {
  const consistencyPercent = Math.round(vision.consistency * 100);
  const animatedPercent = useCountUp(consistencyPercent, 1200);
  const animatedWidth = useCountUp(consistencyPercent, 1200);

  return (
    <div
      className="relative p-5 rounded-xl transition-all duration-300 hover:shadow-lg overflow-visible"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))`,
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
      {/* 1. 일관성 프로그래스 바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: vividColor }} />
            <span
              className={cn(
                TYPOGRAPHY.bodySmall.fontSize,
                TYPOGRAPHY.bodySmall.fontWeight
              )}
              style={{ color: COLORS.text.secondary }}
            >
              일관성
            </span>
          </div>
          <span
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              TYPOGRAPHY.bodySmall.fontWeight
            )}
            style={{ color: vividColor }}
          >
            {animatedPercent}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{
            backgroundColor: `${vividColor}15`,
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${animatedWidth}%`,
              background: `linear-gradient(90deg, ${vividColor}, ${vividColor}dd)`,
            }}
          />
        </div>
      </div>

      {/* 2. 제목 */}
      <p
        className={cn(
          TYPOGRAPHY.body.fontSize,
          TYPOGRAPHY.body.fontWeight,
          "mb-3"
        )}
        style={{ color: COLORS.text.primary }}
      >
        {vision.vision}
      </p>

      {/* 3. 날짜 */}
      <div className="flex items-center gap-1.5 mb-4">
        <Calendar className="w-4 h-4" style={{ color: vividColor }} />
        <p
          className={cn(TYPOGRAPHY.bodySmall.fontSize)}
          style={{ color: COLORS.text.secondary }}
        >
          {vision.first_date} ~ {vision.last_date}
        </p>
      </div>

      {/* 4. 설명 */}
      <div
        className="pt-4 border-t"
        style={{ borderColor: `${vividColor}20` }}
      >
        <p
          className={cn(
            TYPOGRAPHY.body.fontSize,
            TYPOGRAPHY.body.lineHeight,
            "leading-relaxed"
          )}
          style={{ color: COLORS.text.secondary }}
        >
          {vision.evolution_story}
        </p>
      </div>
    </div>
  );
}

// 우선순위 변화 아이템 컴포넌트
function PriorityShiftItem({
  shift,
  idx,
  vividColor,
}: {
  shift: VividReport["vision_evolution"]["priority_shifts"][number];
  idx: number;
  vividColor: string;
}) {
  return (
    <div
      className="group relative overflow-visible rounded-xl transition-all duration-300 hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))`,
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
      {/* 헤더: 변화 방향 */}
      <div
        className="p-4 pb-4 border-b"
        style={{ borderColor: `${vividColor}20` }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 이전 우선순위 */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `rgba(148, 163, 184, 0.06)`,
              border: `1px solid rgba(148, 163, 184, 0.15)`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: `rgba(148, 163, 184, 0.5)` }}
              />
              <p
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.bodySmall.fontWeight,
                  "uppercase"
                )}
                style={{ color: COLORS.text.tertiary }}
              >
                이전
              </p>
            </div>
            <p
              className={cn(
                TYPOGRAPHY.body.fontSize,
                TYPOGRAPHY.body.fontWeight,
                "leading-snug"
              )}
              style={{ color: COLORS.text.primary }}
            >
              {shift.from}
            </p>
          </div>

          {/* 새로운 우선순위 */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${vividColor}20`,
              border: `1.5px solid ${vividColor}45`,
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
                이후
              </p>
            </div>
            <p
              className={cn(
                TYPOGRAPHY.body.fontSize,
                TYPOGRAPHY.body.fontWeight,
                "leading-snug"
              )}
              style={{ color: COLORS.text.primary }}
            >
              {shift.to}
            </p>
          </div>
        </div>
      </div>

      {/* 바디: 시간과 이유 */}
      <div className="p-4 pt-3">
        {/* 시간 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${vividColor}15`,
              border: `1px solid ${vividColor}30`,
            }}
          >
            <Calendar className="w-3 h-3" style={{ color: vividColor }} />
          </div>
          <p
            className={cn(
              TYPOGRAPHY.bodySmall.fontSize,
              TYPOGRAPHY.bodySmall.fontWeight
            )}
            style={{ color: COLORS.text.secondary }}
          >
            {shift.when}
          </p>
        </div>

        {/* 이유 */}
        <div
          className="pt-3 border-t"
          style={{ borderColor: `${vividColor}15` }}
        >
          <p
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "leading-relaxed"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            {shift.why}
          </p>
        </div>
      </div>
    </div>
  );
}

type VisionEvolutionSectionProps = {
  visionEvolution: VividReport["vision_evolution"];
  vividColor: string;
};

export function VisionEvolutionSection({
  visionEvolution,
  vividColor,
}: VisionEvolutionSectionProps) {
  if (!visionEvolution) return null;

  return (
    <div className="space-y-6">
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
                  1
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
                한 달간의 목표 변화
              </h2>
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  "leading-relaxed"
                )}
                style={{ color: COLORS.text.secondary }}
              >
                이번 달에 목표가 어떻게 변화했는지 시간순으로 확인합니다
              </p>
            </div>
          </div>
        </div>

        {/* 핵심 비전들 */}
        {visionEvolution.core_visions &&
          visionEvolution.core_visions.length > 0 && (
            <ScrollAnimation>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: `rgba(163, 191, 217, 0.15)` }}>
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
                      1-1
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
                    핵심 비전들
                  </h3>
                </div>
                <div className="space-y-6">
                  {visionEvolution.core_visions.map((vision, idx) => (
                    <CoreVisionItem key={idx} vision={vision} idx={idx} vividColor={vividColor} />
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          )}

        {/* 우선순위 변화 - 모던한 디자인 */}
        {visionEvolution.priority_shifts &&
          visionEvolution.priority_shifts.length > 0 && (
            <ScrollAnimation>
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: `rgba(163, 191, 217, 0.15)` }}>
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
                      1-2
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
                    우선순위 변화
                  </h3>
                </div>
                <div className="mb-6">
                  <div className="space-y-4">
                    {visionEvolution.priority_shifts.map((shift, idx) => (
                      <PriorityShiftItem key={idx} shift={shift} idx={idx} vividColor={vividColor} />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          )}
      </GradientCard>
    </div>
  );
}
