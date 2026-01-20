import { useState } from "react";
import type { WeeklyReport } from "@/types/weekly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";

type WeeklyKeywordsAnalysisSectionProps = {
  weeklyKeywordsAnalysis: WeeklyReport["weekly_keywords_analysis"];
  vividColor: string;
};

/**
 * 키워드 텍스트와 툴팁을 함께 표시하는 컴포넌트
 */
function KeywordWithTooltip({ keyword }: { keyword: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={cn(
        TYPOGRAPHY.body.fontSize,
        "font-semibold flex-1 min-w-0 cursor-help relative line-clamp-2"
      )}
      style={{
        color: COLORS.text.primary,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        wordBreak: "break-word",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {keyword}
      {isHovered && (
        <div
          className="absolute left-0 bottom-full mb-2 z-50 px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{
            backgroundColor: COLORS.text.primary,
            color: COLORS.text.white || "#FFFFFF",
            maxWidth: "300px",
            whiteSpace: "normal",
            wordBreak: "break-word",
            minWidth: "150px",
          }}
        >
          <div className={cn(TYPOGRAPHY.body.fontSize, "font-medium")}>
            {keyword}
          </div>
          <div
            className="absolute left-4 bottom-0 transform translate-y-full"
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `6px solid ${COLORS.text.primary}`,
            }}
          />
        </div>
      )}
    </span>
  );
}

export function WeeklyKeywordsAnalysisSection({
  weeklyKeywordsAnalysis,
  vividColor,
}: WeeklyKeywordsAnalysisSectionProps) {
  if (!weeklyKeywordsAnalysis) return null;

  return (
    <ScrollAnimation delay={200}>
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
                2
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
            주간 키워드 분석
          </p>
        </div>
      {weeklyKeywordsAnalysis.vision_keywords_trend &&
        weeklyKeywordsAnalysis.vision_keywords_trend.length > 0 && (
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
              비전 키워드 트렌드
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...weeklyKeywordsAnalysis.vision_keywords_trend]
                .sort((a, b) => b.days - a.days)
                .map((keyword, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(163, 191, 217, 0.25)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 relative">
                      <KeywordWithTooltip keyword={keyword.keyword} />
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
                        {keyword.days}일
                      </span>
                    </div>
                    {keyword.context && (
                      <p
                        className={cn(
                          TYPOGRAPHY.bodySmall.fontSize,
                          "mb-2 line-clamp-2"
                        )}
                        style={{
                          color: COLORS.text.secondary,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                        title={keyword.context}
                      >
                        {keyword.context}
                      </p>
                    )}
                    {keyword.related_keywords &&
                      keyword.related_keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {keyword.related_keywords.map((related, rIdx) => (
                            <span
                              key={rIdx}
                              className={cn(
                                TYPOGRAPHY.bodySmall.fontSize,
                                "px-2 py-0.5 rounded"
                              )}
                              style={{
                                backgroundColor: "#E8F0F8",
                                color: "#5A7A9A",
                              }}
                            >
                              {related}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </GradientCard>
        )}
      </div>
    </ScrollAnimation>
  );
}
