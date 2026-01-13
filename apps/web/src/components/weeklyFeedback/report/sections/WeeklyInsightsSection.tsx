import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, Sparkles, Link2 } from "lucide-react";
import type { VividReport } from "@/types/weekly-feedback";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";

type WeeklyInsightsSectionProps = {
  weeklyInsights: VividReport["weekly_insights"];
  vividColor: string;
};

/**
 * 기록 패턴 드롭다운 컴포넌트
 */
function EvidencePatternDropdown({
  evidence,
  color,
}: {
  evidence: string[];
  color: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (evidence.length === 0) return null;

  // 날짜 형식 (YYYY-MM-DD) 감지 및 변환
  const datePattern = /(\d{4}-\d{2}-\d{2})/g;
  const formattedEvidence = evidence.map((ev) =>
    ev.replace(datePattern, (match) => `${match}일의 기록`)
  );

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: `rgba(${color}, 0.15)` }}>
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
          기록 패턴 보기 ({evidence.length}개)
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
            {formattedEvidence.map((ev, idx) => (
              <p
                key={idx}
                className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                style={{ color: COLORS.text.tertiary }}
              >
                {ev}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function WeeklyInsightsSection({
  weeklyInsights,
  vividColor,
}: WeeklyInsightsSectionProps) {
  if (!weeklyInsights) return null;

  return (
    <ScrollAnimation delay={700}>
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
                7
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
            주간 인사이트
          </p>
        </div>
      {weeklyInsights.patterns && weeklyInsights.patterns.length > 0 && (
        <GradientCard gradientColor="163, 191, 217">
          <p
            className={cn(
              TYPOGRAPHY.label.fontSize,
              TYPOGRAPHY.label.fontWeight,
              TYPOGRAPHY.label.letterSpacing,
              "mb-4 uppercase"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            발견한 패턴
          </p>
          <div className="space-y-3">
            {weeklyInsights.patterns.map((pattern, idx) => (
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
                    TYPOGRAPHY.body.fontSize,
                    "font-semibold mb-1.5"
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
                  style={{
                    color: COLORS.text.secondary,
                  }}
                >
                  {pattern.description}
                </p>
                {pattern.evidence && pattern.evidence.length > 0 && (
                  <EvidencePatternDropdown
                    evidence={pattern.evidence}
                    color="163, 191, 217"
                  />
                )}
              </div>
            ))}
          </div>
        </GradientCard>
      )}
      {weeklyInsights.unexpected_connections &&
        weeklyInsights.unexpected_connections.length > 0 && (
          <GradientCard gradientColor="183, 148, 246">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #B794F6, #A78BFA)",
                  boxShadow: "0 4px 12px rgba(183, 148, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                }}
              >
                <Sparkles className="w-5 h-5" style={{ color: "white" }} />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%)",
                  }}
                />
              </div>
              <div>
                <p
                  className={cn(
                    TYPOGRAPHY.label.fontSize,
                    TYPOGRAPHY.label.fontWeight,
                    TYPOGRAPHY.label.letterSpacing,
                    "uppercase mb-1"
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  예상치 못한 연결점
                </p>
                <p
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    TYPOGRAPHY.body.lineHeight
                  )}
                  style={{ color: COLORS.text.tertiary }}
                >
                  숨겨진 인사이트를 발견했습니다
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {weeklyInsights.unexpected_connections.map((connection, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1.5px solid rgba(183, 148, 246, 0.18)",
                    boxShadow: "0 2px 8px rgba(183, 148, 246, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  {/* 배경 장식 - 더 부드러운 그라디언트 */}
                  <div
                    className="absolute top-0 right-0 w-40 h-40 opacity-4 group-hover:opacity-8 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 80% 20%, rgba(183, 148, 246, 0.2) 0%, transparent 65%)",
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-32 h-32 opacity-3 group-hover:opacity-6 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 20% 80%, rgba(183, 148, 246, 0.15) 0%, transparent 55%)",
                    }}
                  />
                  
                  <div className="relative z-10">
                    {/* 연결점 헤더 */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 group-hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, rgba(183, 148, 246, 0.12), rgba(183, 148, 246, 0.08))",
                          border: "1.5px solid rgba(183, 148, 246, 0.2)",
                        }}
                      >
                        <Link2 className="w-4 h-4" style={{ color: "#B794F6" }} />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            TYPOGRAPHY.body.fontSize,
                            "font-semibold mb-2",
                            TYPOGRAPHY.body.lineHeight
                          )}
                          style={{ color: COLORS.text.primary }}
                        >
                          {connection.connection}
                        </p>
                      </div>
                    </div>

                    {/* 설명 */}
                    <div
                      className="mb-4 pb-4 border-b"
                      style={{
                        borderColor: "rgba(183, 148, 246, 0.08)",
                      }}
                    >
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.lineHeight
                        )}
                        style={{
                          color: COLORS.text.secondary,
                        }}
                      >
                        {connection.description}
                      </p>
                    </div>

                    {/* 의미 */}
                    <div
                      className="p-4 rounded-lg transition-all duration-200 group-hover:shadow-sm"
                      style={{
                        backgroundColor: "rgba(183, 148, 246, 0.04)",
                        border: "1px solid rgba(183, 148, 246, 0.12)",
                      }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: "#B794F6" }}
                        />
                        <p
                          className={cn(
                            TYPOGRAPHY.label.fontSize,
                            TYPOGRAPHY.label.fontWeight,
                            TYPOGRAPHY.label.letterSpacing,
                            "uppercase"
                          )}
                          style={{ color: "#B794F6" }}
                        >
                          의미
                        </p>
                      </div>
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          TYPOGRAPHY.body.lineHeight
                        )}
                        style={{
                          color: COLORS.text.primary,
                        }}
                      >
                        {connection.significance}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GradientCard>
        )}
      </div>
    </ScrollAnimation>
  );
}
