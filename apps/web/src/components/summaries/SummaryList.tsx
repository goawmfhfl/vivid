import { Calendar } from "lucide-react";
import type { PeriodSummary } from "@/types/Entry";
import { COLORS, SPACING } from "@/lib/design-system";

interface SummaryListProps {
  summaries: PeriodSummary[];
  color: string;
  onSummaryClick: (summary: PeriodSummary) => void;
}

export function SummaryList({
  summaries,
  color,
  onSummaryClick,
}: SummaryListProps) {
  if (summaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {summaries.map((summary) => (
        <div
          key={summary.id}
          className={`${SPACING.card.paddingSmall} cursor-pointer transition-all relative active:scale-[0.99]`}
          onClick={() => onSummaryClick(summary)}
          style={{
            backgroundColor: "#FAFAF8",
            border: `1.5px solid ${COLORS.border.light}`,
            borderRadius: "12px",
            boxShadow: `
              0 2px 8px rgba(0,0,0,0.04),
              0 1px 3px rgba(0,0,0,0.02),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
            position: "relative",
            overflow: "hidden",
            // 종이 질감 배경 패턴
            backgroundImage: `
              /* 가로 줄무늬 (프로젝트 그린 톤) */
              repeating-linear-gradient(
                to bottom,
                transparent 0px,
                transparent 27px,
                rgba(107, 122, 111, 0.08) 27px,
                rgba(107, 122, 111, 0.08) 28px
              ),
              /* 종이 텍스처 노이즈 */
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(107, 122, 111, 0.01) 2px,
                rgba(107, 122, 111, 0.01) 4px
              )
            `,
            backgroundSize: "100% 28px, 8px 8px",
            backgroundPosition: "0 2px, 0 0",
            filter: "contrast(1.02) brightness(1.01)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `
              0 4px 16px rgba(107, 122, 111, 0.08),
              0 2px 6px rgba(0,0,0,0.04),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `
              0 2px 8px rgba(0,0,0,0.04),
              0 1px 3px rgba(0,0,0,0.02),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `;
          }}
        >
          {/* 종이 질감 오버레이 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
              `,
              mixBlendMode: "overlay",
              opacity: 0.5,
            }}
          />

          {/* 내용 영역 */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <Calendar className="w-4 h-4" style={{ color: "white" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="truncate"
                    style={{ color: "#333333", fontSize: "1rem" }}
                  >
                    {summary.title}
                  </h3>
                  <p
                    className="truncate"
                    style={{
                      color: "#4E4B46",
                      opacity: 0.7,
                      fontSize: "0.8rem",
                    }}
                  >
                    {summary.period}{" "}
                    {summary.type === "weekly" ? "주간" : "월간"} 인사이트 &
                    피드백
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
