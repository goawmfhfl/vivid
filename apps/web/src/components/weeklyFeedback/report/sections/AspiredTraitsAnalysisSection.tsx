import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import type { VividReport } from "@/types/weekly-feedback";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";

type AspiredTraitsAnalysisSectionProps = {
  aspiredTraitsAnalysis: VividReport["aspired_traits_analysis"];
  vividColor: string;
};

/**
 * 날짜 목록 드롭다운 컴포넌트
 */
function DateListDropdown({
  dates,
  color,
}: {
  dates: string[];
  color: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (dates.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between transition-all duration-200 hover:opacity-80"
      >
        <p
          className={cn(
            TYPOGRAPHY.caption.fontSize,
            TYPOGRAPHY.caption.fontWeight
          )}
          style={{ color: COLORS.text.tertiary }}
        >
          기록 일자 보기 ({dates.length}개)
        </p>
        <div className="flex items-center gap-1">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" style={{ color: color }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: color }} />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1.5">
          <div className="flex flex-col gap-1.5">
            {dates.map((date, idx) => (
              <p
                key={idx}
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.tertiary }}
              >
                {date}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AspiredTraitsAnalysisSection({
  aspiredTraitsAnalysis,
  vividColor,
}: AspiredTraitsAnalysisSectionProps) {
  if (!aspiredTraitsAnalysis) return null;

  return (
    <ScrollAnimation delay={600}>
      <div className="space-y-5">
        {/* 섹션 번호 배지 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${vividColor}, ${vividColor}cc)`,
                boxShadow: `0 2px 8px ${vividColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
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
                6
              </span>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%)`,
                }}
              />
            </div>
          </div>
          <p
            className={cn(
              TYPOGRAPHY.label.fontSize,
              TYPOGRAPHY.label.fontWeight,
              TYPOGRAPHY.label.letterSpacing,
              "uppercase"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            지향하는 모습 심화 분석
          </p>
        </div>
      <GradientCard gradientColor="163, 191, 217">
        <p
          className={cn(
            TYPOGRAPHY.body.fontSize,
            TYPOGRAPHY.body.lineHeight,
            "mb-4"
          )}
          style={{ color: COLORS.text.primary }}
        >
          {aspiredTraitsAnalysis.consistency_summary}
        </p>
      </GradientCard>
      {aspiredTraitsAnalysis.top_5_aspired_traits &&
        aspiredTraitsAnalysis.top_5_aspired_traits.length > 0 && (
          <GradientCard gradientColor="163, 191, 217">
            <p
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight,
                TYPOGRAPHY.label.letterSpacing,
                "mb-3 uppercase"
              )}
              style={{ color: COLORS.text.secondary }}
            >
              Top 5 지향 모습
            </p>
            <div className="space-y-3">
              {[...aspiredTraitsAnalysis.top_5_aspired_traits]
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 5)
                .map((trait, idx) => (
                  <div
                    key={idx}
                    className="relative p-4 rounded-lg transition-all duration-200 hover:shadow-sm overflow-visible"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(163, 191, 217, 0.25)",
                    }}
                  >
                    {/* 번호 표시 - 포스트잇 스타일 (왼쪽 위, 작게) */}
                    <div
                      className="absolute -left-2 -top-2 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: vividColor,
                        border: "2px solid white",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)",
                        transform: "rotate(-3deg)",
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1 flex-wrap sm:flex-nowrap">
                        <span
                          className={cn(
                            TYPOGRAPHY.body.fontSize,
                            "font-semibold flex-1 min-w-0 break-words",
                            TYPOGRAPHY.body.lineHeight
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          {trait.trait}
                        </span>
                        <span
                          className={cn(
                            TYPOGRAPHY.bodySmall.fontSize,
                            "px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap"
                          )}
                          style={{
                            backgroundColor: "#E8F0F8",
                            color: "#5A7A9A",
                          }}
                        >
                          {trait.frequency}회
                        </span>
                      </div>
                      {trait.dates && trait.dates.length > 0 && (
                        <DateListDropdown dates={trait.dates} color={vividColor} />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </GradientCard>
        )}
      {aspiredTraitsAnalysis.evolution_process && (
        <GradientCard gradientColor="163, 191, 217">
          <p
            className={cn(
              TYPOGRAPHY.label.fontSize,
              TYPOGRAPHY.label.fontWeight,
              TYPOGRAPHY.label.letterSpacing,
              "mb-3 uppercase"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            진화 과정
          </p>
          <p
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "mb-3"
            )}
            style={{
              color: COLORS.text.secondary,
            }}
          >
            {aspiredTraitsAnalysis.evolution_process.summary}
          </p>
          {aspiredTraitsAnalysis.evolution_process.stages &&
            aspiredTraitsAnalysis.evolution_process.stages.length > 0 && (
              <div className="space-y-3">
                {aspiredTraitsAnalysis.evolution_process.stages.map(
                  (stage, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg transition-all duration-200 hover:shadow-sm"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        border: "1px solid rgba(163, 191, 217, 0.25)",
                      }}
                    >
                      <p
                        className={cn(
                          TYPOGRAPHY.bodySmall.fontSize,
                          "font-semibold mb-1"
                        )}
                        style={{ color: COLORS.text.secondary }}
                      >
                        {stage.period}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {stage.traits.map((trait, tIdx) => (
                          <span
                            key={tIdx}
                            className={cn(
                              TYPOGRAPHY.bodySmall.fontSize,
                              "px-2 py-0.5 rounded"
                            )}
                            style={{
                              backgroundColor: "#E8F0F8",
                              color: "#5A7A9A",
                            }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.lineHeight
                        )}
                        style={{ color: COLORS.text.primary }}
                      >
                        {stage.description}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
        </GradientCard>
      )}
      </div>
    </ScrollAnimation>
  );
}
