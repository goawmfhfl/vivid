import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { VividReport } from "@/types/weekly-feedback";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ContentCard, GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";

type UserCharacteristicsAnalysisSectionProps = {
  userCharacteristicsAnalysis: VividReport["user_characteristics_analysis"];
  vividColor: string;
  userName?: string;
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

export function UserCharacteristicsAnalysisSection({
  userCharacteristicsAnalysis,
  vividColor,
  userName,
}: UserCharacteristicsAnalysisSectionProps) {
  if (!userCharacteristicsAnalysis) return null;

  return (
    <ScrollAnimation delay={500}>
      <div className="space-y-5">
      <ContentCard
        label="사용자 특징 심화 분석"
        content={
          userName
            ? `${userName}${userCharacteristicsAnalysis.consistency_summary}`
            : userCharacteristicsAnalysis.consistency_summary
        }
        gradientColor="163, 191, 217"
        sectionNumber={5}
        sectionNumberColor="#A3BFD9"
      />
      {userCharacteristicsAnalysis.top_5_characteristics &&
        userCharacteristicsAnalysis.top_5_characteristics.length > 0 && (
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
              {userName ? `${userName}의 ` : ""}Top 5 특징
            </p>
            <div className="space-y-3">
              {[...userCharacteristicsAnalysis.top_5_characteristics]
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 5)
                .map((char, idx) => (
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
                          {char.characteristic}
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
                          {char.frequency}회
                        </span>
                      </div>
                      {char.dates && char.dates.length > 0 && (
                        <DateListDropdown dates={char.dates} color={vividColor} />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </GradientCard>
        )}
      {userCharacteristicsAnalysis.change_patterns && (
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
            변화 패턴
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCharacteristicsAnalysis.change_patterns.new_characteristics &&
              userCharacteristicsAnalysis.change_patterns.new_characteristics
                .length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(163, 191, 217, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "#4CAF50" }}
                    />
                    <p
                      className={cn(
                        TYPOGRAPHY.label.fontSize,
                        TYPOGRAPHY.label.fontWeight,
                        TYPOGRAPHY.label.letterSpacing,
                        "uppercase"
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      새로 나타난 특징
                    </p>
                  </div>
                  <div className="space-y-3">
                    {userCharacteristicsAnalysis.change_patterns.new_characteristics.map(
                      (char, idx) => (
                        <div
                          key={idx}
                          className="pb-3 border-b last:border-b-0 last:pb-0"
                          style={{
                            borderColor: "rgba(163, 191, 217, 0.15)",
                          }}
                        >
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-1.5"
                            )}
                            style={{
                              color: COLORS.text.primary,
                            }}
                          >
                            {char.characteristic}
                          </p>
                          <p
                            className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                            style={{
                              color: COLORS.text.tertiary || "#9CA3AF",
                            }}
                          >
                            {char.first_appeared}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            {userCharacteristicsAnalysis.change_patterns
              .disappeared_characteristics &&
              userCharacteristicsAnalysis.change_patterns
                .disappeared_characteristics.length > 0 && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(163, 191, 217, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "#FF9800" }}
                    />
                    <p
                      className={cn(
                        TYPOGRAPHY.label.fontSize,
                        TYPOGRAPHY.label.fontWeight,
                        TYPOGRAPHY.label.letterSpacing,
                        "uppercase"
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      사라진 특징
                    </p>
                  </div>
                  <div className="space-y-3">
                    {userCharacteristicsAnalysis.change_patterns.disappeared_characteristics.map(
                      (char, idx) => (
                        <div
                          key={idx}
                          className="pb-3 border-b last:border-b-0 last:pb-0"
                          style={{
                            borderColor: "rgba(163, 191, 217, 0.15)",
                          }}
                        >
                          <p
                            className={cn(
                              TYPOGRAPHY.body.fontSize,
                              TYPOGRAPHY.body.lineHeight,
                              "mb-1.5"
                            )}
                            style={{
                              color: COLORS.text.primary,
                            }}
                          >
                            {char.characteristic}
                          </p>
                          <p
                            className={cn(TYPOGRAPHY.bodySmall.fontSize)}
                            style={{
                              color: COLORS.text.tertiary || "#9CA3AF",
                            }}
                          >
                            {char.last_appeared}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </GradientCard>
      )}
      </div>
    </ScrollAnimation>
  );
}
