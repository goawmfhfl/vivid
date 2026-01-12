"use client";

import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { MonthlyFeedbackNew } from "@/types/monthly-feedback-new";
import { COLORS, SPACING, TYPOGRAPHY } from "@/lib/design-system";
import { TestPanel } from "./TestPanel";
import { VividSection } from "./report/VividSection";
import { cn } from "@/lib/utils";

type MonthlyFeedbackReportProps = {
  data: MonthlyFeedbackNew;
  onBack: () => void;
  isPro?: boolean;
  onTogglePro?: (isPro: boolean) => void;
};

export function MonthlyFeedbackReport({
  data,
  onBack,
  isPro = false,
  onTogglePro = () => {},
}: MonthlyFeedbackReportProps) {
  const router = useRouter();

  // 각 영역별 데이터 존재 여부 체크

  const handleGoToAnalysis = () => {
    router.push("/reports/monthly");
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <div
        className={`${SPACING.page.maxWidth} mx-auto ${SPACING.page.padding}`}
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 -ml-2 text-sm sm:text-base"
          style={{ color: COLORS.brand.primary }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        {/* Title Section */}
        {data.title && (
          <section className="mb-8 sm:mb-12">
            <ScrollAnimation>
              <div className="text-center">
                <h1
                  className={cn(
                    TYPOGRAPHY.h1.fontSize,
                    TYPOGRAPHY.h1.fontWeight,
                    "mb-2"
                  )}
                  style={{ color: COLORS.text.primary }}
                >
                  {data.title}
                </h1>
                <p
                  className={cn(
                    TYPOGRAPHY.body.fontSize,
                    TYPOGRAPHY.body.lineHeight
                  )}
                  style={{ color: COLORS.text.secondary }}
                >
                  {data.month_label} ({data.recorded_days}일 기록)
                </p>
              </div>
            </ScrollAnimation>
          </section>
        )}

        {/* Vivid Section */}
        <section className="mb-16 sm:mb-20">
          <ScrollAnimation>
            <VividSection
              vividReport={data.vivid_report}
              isPro={isPro}
            />
          </ScrollAnimation>
        </section>

        {/* Bottom Action */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleGoToAnalysis}
            className="rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base flex items-center gap-2"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: "white",
            }}
          >
            <BarChart3 className="w-4 h-4" />
            분석 페이지로 이동
          </Button>
        </div>
      </div>

      {/* TestPanel 추가 */}
      <TestPanel view={data} isPro={isPro} onTogglePro={onTogglePro} />
    </div>
  );
}
