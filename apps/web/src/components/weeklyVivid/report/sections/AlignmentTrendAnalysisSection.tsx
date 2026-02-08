import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  HelpCircle,
} from "lucide-react";
import type { WeeklyReport } from "@/types/weekly-vivid";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { GradientCard } from "@/components/common/feedback";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AlignmentTrendAnalysisSectionProps = {
  alignmentTrendAnalysis: WeeklyReport["alignment_trend_analysis"];
  vividColor: string;
};

// 일치도 점수 설명 팝업 컴포넌트
function AlignmentScoreInfoDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            color: COLORS.text.tertiary,
          }}
          aria-label="일치도 점수 평가 기준 보기"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-64px)] max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle
            className={cn(
              TYPOGRAPHY.h3.fontSize,
              TYPOGRAPHY.h3.fontWeight
            )}
            style={{ color: COLORS.text.primary }}
          >
            일치도 점수란?
          </DialogTitle>
          <DialogDescription
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "mt-4"
            )}
            style={{ color: COLORS.text.secondary }}
          >
            일치도 점수는 오늘의 계획이 미래 목표와 얼마나 잘 정렬되어 있는지를 평가한 점수입니다 (0-100점).
            <br />
            <span
              className={cn(TYPOGRAPHY.bodySmall.fontSize, "mt-2 block")}
              style={{ color: COLORS.text.tertiary }}
            >
              * AI 평가에 따라 5~10점 정도의 차이가 있을 수 있습니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <p
              className={cn(
                TYPOGRAPHY.bodySmall.fontSize,
                TYPOGRAPHY.bodySmall.fontWeight,
                "mb-2"
              )}
              style={{ color: COLORS.text.primary }}
            >
              평가 기준
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                오늘 계획한 활동/방향이 미래 목표 달성에 도움이 되는가?
              </li>
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                오늘의 우선순위가 미래 비전과 정렬되어 있는가?
              </li>
              <li
                className={cn(
                  TYPOGRAPHY.bodySmall.fontSize,
                  TYPOGRAPHY.body.lineHeight
                )}
                style={{ color: COLORS.text.secondary }}
              >
                구체적인 행동 계획이 미래 목표로 이어지는가?
              </li>
            </ul>
          </div>
          <div
            className="pt-4 border-t"
            style={{ borderColor: COLORS.border.light }}
          >
            <p
              className={cn(
                TYPOGRAPHY.bodySmall.fontSize,
                TYPOGRAPHY.bodySmall.fontWeight,
                "mb-2"
              )}
              style={{ color: COLORS.text.primary }}
            >
              점수 구간
            </p>
            <div className="space-y-2">
              <div>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    TYPOGRAPHY.bodySmall.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  높은 점수 (80점 이상):
                </span>
                <span
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "ml-2")}
                  style={{ color: COLORS.text.secondary }}
                >
                  오늘의 계획이 미래 목표와 잘 정렬되어 있음
                </span>
              </div>
              <div>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    TYPOGRAPHY.bodySmall.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  중간 점수 (50-79점):
                </span>
                <span
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "ml-2")}
                  style={{ color: COLORS.text.secondary }}
                >
                  부분적으로 정렬되어 있으나 개선 여지 있음
                </span>
              </div>
              <div>
                <span
                  className={cn(
                    TYPOGRAPHY.bodySmall.fontSize,
                    TYPOGRAPHY.bodySmall.fontWeight
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  낮은 점수 (50점 미만):
                </span>
                <span
                  className={cn(TYPOGRAPHY.bodySmall.fontSize, "ml-2")}
                  style={{ color: COLORS.text.secondary }}
                >
                  오늘의 계획과 미래 목표 사이에 큰 격차가 있음
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AlignmentTrendAnalysisSection({
  alignmentTrendAnalysis,
  vividColor,
}: AlignmentTrendAnalysisSectionProps) {
  if (!alignmentTrendAnalysis) return null;

  return (
    <ScrollAnimation delay={400}>
      <GradientCard gradientColor="163, 191, 217">
        {/* 섹션 번호 배지 */}
        <div className="flex items-center gap-3 mb-6">
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
                4
              </span>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%)`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <p
              className={cn(
                TYPOGRAPHY.label.fontSize,
                TYPOGRAPHY.label.fontWeight,
                TYPOGRAPHY.label.letterSpacing,
                "uppercase"
              )}
              style={{ color: COLORS.text.secondary }}
            >
              일치도 트렌드 분석
            </p>
            <AlignmentScoreInfoDialog />
          </div>
        </div>
      <div className="mb-4">
        <p
          className={cn(TYPOGRAPHY.bodySmall.fontSize, "mb-3 font-medium")}
          style={{ color: COLORS.text.secondary }}
        >
          추세:{" "}
          <span style={{ color: COLORS.text.primary }}>
            {alignmentTrendAnalysis.trend === "improving"
              ? "개선 중"
              : alignmentTrendAnalysis.trend === "declining"
              ? "개선 중"
              : "안정"}
          </span>
        </p>
        {alignmentTrendAnalysis.daily_alignment_scores &&
          alignmentTrendAnalysis.daily_alignment_scores.length > 0 && (
            <div style={{ height: "200px", marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={alignmentTrendAnalysis.daily_alignment_scores.map(
                    (item) => ({
                      date: item.date.split("-").slice(1).join("/"),
                      score: item.score,
                    })
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: COLORS.text.secondary }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: COLORS.text.secondary }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={vividColor}
                    strokeWidth={2}
                    dot={{ fill: vividColor, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alignmentTrendAnalysis.highest_alignment_day && (
          <div
            className="p-4 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: COLORS.background.cardElevated,
              border: `1px solid ${COLORS.border.light}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#4CAF50";
              e.currentTarget.style.backgroundColor =
                COLORS.background.hoverLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border.light;
              e.currentTarget.style.backgroundColor =
                COLORS.background.cardElevated;
            }}
          >
            <div className="flex items-start gap-3">
              <ArrowUp
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "#4CAF50" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    가장 높았던 날
                  </p>
                  <span
                    className={cn(
                      TYPOGRAPHY.h4.fontSize,
                      TYPOGRAPHY.h4.fontWeight
                    )}
                    style={{ color: "#4CAF50" }}
                  >
                    {alignmentTrendAnalysis.highest_alignment_day.score}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar
                    className="w-3 h-3"
                    style={{ color: COLORS.text.tertiary }}
                  />
                  <p
                    className={cn(
                      TYPOGRAPHY.bodySmall.fontSize,
                      "font-medium"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    {alignmentTrendAnalysis.highest_alignment_day.date}
                  </p>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.body.fontSize,
                    TYPOGRAPHY.body.lineHeight
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  {alignmentTrendAnalysis.highest_alignment_day.pattern}
                </p>
              </div>
            </div>
          </div>
        )}
        {alignmentTrendAnalysis.lowest_alignment_day && (
          <div
            className="p-4 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: COLORS.background.cardElevated,
              border: `1px solid ${COLORS.border.light}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FF9800";
              e.currentTarget.style.backgroundColor =
                COLORS.background.hoverLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border.light;
              e.currentTarget.style.backgroundColor =
                COLORS.background.cardElevated;
            }}
          >
            <div className="flex items-start gap-3">
              <ArrowDown
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "#FF9800" }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.text.secondary }}
                  >
                    가장 낮았던 날
                  </p>
                  <span
                    className={cn(
                      TYPOGRAPHY.h4.fontSize,
                      TYPOGRAPHY.h4.fontWeight
                    )}
                    style={{ color: "#FF9800" }}
                  >
                    {alignmentTrendAnalysis.lowest_alignment_day.score}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar
                    className="w-3 h-3"
                    style={{ color: COLORS.text.tertiary }}
                  />
                  <p
                    className={cn(
                      TYPOGRAPHY.bodySmall.fontSize,
                      "font-medium"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    {alignmentTrendAnalysis.lowest_alignment_day.date}
                  </p>
                </div>
                <p
                  className={cn(
                    TYPOGRAPHY.body.fontSize,
                    TYPOGRAPHY.body.lineHeight
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  {alignmentTrendAnalysis.lowest_alignment_day.pattern}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </GradientCard>
    </ScrollAnimation>
  );
}
