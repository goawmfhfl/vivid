"use client";

import { ArrowLeft, List } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollAnimation } from "../ui/ScrollAnimation";
import { useRouter } from "next/navigation";
import type { MonthlyVivid } from "@/types/monthly-vivid";
import { COLORS, SPACING, TYPOGRAPHY } from "@/lib/design-system";
import { VividSection } from "../monthlyVivid/report/VividSection";
import { cn } from "@/lib/utils";
import { VividFeedbackSection } from "../feedback/VividFeedbackSection";

type MonthlyVividReportProps = {
  data: MonthlyVivid;
  onBack: () => void;
  isPro?: boolean;
};

export function MonthlyVividReport({
  data,
  onBack,
  isPro = false,
}: MonthlyVividReportProps) {
  const router = useRouter();

  // 각 영역별 데이터 존재 여부 체크

  const handleGoToList = () => {
    router.push("/reports/monthly/list");
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
                      {typeof data.title === "string" ? data.title : (data.title as { title?: string })?.title || data.month_label}
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
              vividReport={data.report}
              isPro={isPro}
            />
          </ScrollAnimation>
        </section>

        {/* 피드백 섹션 */}
        <ScrollAnimation delay={300}>
          <VividFeedbackSection pageType="monthly" />
        </ScrollAnimation>

        {/* Bottom Action */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleGoToList}
            className="w-full sm:w-auto relative overflow-hidden group"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: "white",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              boxShadow: `
                0 2px 8px rgba(107, 122, 111, 0.2),
                0 1px 3px rgba(107, 122, 111, 0.1),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
              transition: "all 0.2s ease",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `
                0 4px 12px rgba(107, 122, 111, 0.3),
                0 2px 6px rgba(107, 122, 111, 0.15),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `
                0 2px 8px rgba(107, 122, 111, 0.2),
                0 1px 3px rgba(107, 122, 111, 0.1),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `;
            }}
          >
            {/* 배경 그라데이션 오버레이 */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.light} 100%)`,
              }}
            />
            <div className="relative z-10 flex items-center justify-center gap-2">
              <List className="w-5 h-5" />
              <span>월간 VIVID 리스트 보러가기</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
