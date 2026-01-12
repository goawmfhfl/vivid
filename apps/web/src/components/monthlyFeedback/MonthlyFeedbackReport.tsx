"use client";

import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { MonthlyFeedbackNew } from "@/types/monthly-feedback-new";
import { COLORS, SPACING, TYPOGRAPHY } from "@/lib/design-system";
import { VividSection } from "./report/VividSection";
import { cn } from "@/lib/utils";

type MonthlyFeedbackReportProps = {
  data: MonthlyFeedbackNew;
  onBack: () => void;
  isPro?: boolean;
};

export function MonthlyFeedbackReport({
  data,
  onBack,
  isPro = false,
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
          <section className="mb-8 sm:mb-10">
            <ScrollAnimation>
              <div className="relative">
                <div
                  className="rounded-2xl p-6 sm:p-8 border"
                  style={{
                    background: `linear-gradient(135deg, rgba(163, 191, 217, 0.12) 0%, rgba(163, 191, 217, 0.06) 50%, rgba(255, 255, 255, 1) 100%)`,
                    borderColor: "rgba(163, 191, 217, 0.3)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(163, 191, 217, 0.12)",
                  }}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "rgba(163, 191, 217, 0.15)" }}>
                      <span
                        className={cn(
                          TYPOGRAPHY.caption.fontSize,
                          TYPOGRAPHY.caption.fontWeight,
                          "uppercase tracking-wide"
                        )}
                        style={{ color: COLORS.brand.primary }}
                      >
                        {data.month_label}
                      </span>
                    </div>
                    <h1
                      className={cn(
                        TYPOGRAPHY.h2.fontSize,
                        TYPOGRAPHY.h2.fontWeight,
                        "mb-3 leading-tight"
                      )}
                      style={{ color: COLORS.text.primary }}
                    >
                      {data.title}
                    </h1>
                    <p
                      className={cn(
                        TYPOGRAPHY.body.fontSize
                      )}
                      style={{ color: COLORS.text.secondary }}
                    >
                      {data.recorded_days}일간의 기록을 바탕으로 분석했습니다
                    </p>
                  </div>
                </div>
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
    </div>
  );
}
