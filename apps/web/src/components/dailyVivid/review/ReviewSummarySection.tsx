import { Sparkles, TrendingUp } from "lucide-react";
import { COLORS } from "@/lib/design-system";
import { ScrollAnimation } from "../../ui/ScrollAnimation";
import { ContentCard } from "../../common/feedback";
import { hexToRgbTriplet } from "../colorUtils";
import type { DailyReportData } from "../types";

const executionColor = COLORS.chart.execution;
const executionGradientColor = hexToRgbTriplet(executionColor);

interface ReviewSummarySectionProps {
  view: DailyReportData;
}

export function ReviewSummarySection({ view }: ReviewSummarySectionProps) {
  if (!view.retrospective_summary && !view.retrospective_evaluation) return null;

  return (
    <ScrollAnimation delay={120}>
      <div className="mb-60">
        <div className="space-y-5">
          {view.retrospective_summary && (
            <ContentCard
              icon={Sparkles}
              iconColor={executionColor}
              label="회고 요약"
              content={view.retrospective_summary}
              gradientColor={executionGradientColor}
            />
          )}
          {view.retrospective_evaluation && (
            <ContentCard
              icon={TrendingUp}
              iconColor={executionColor}
              label="회고 AI 평가"
              content={view.retrospective_evaluation}
              gradientColor={executionGradientColor}
            />
          )}
        </div>
      </div>
    </ScrollAnimation>
  );
}
