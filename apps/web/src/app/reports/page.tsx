"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/common/AppHeader";
import { COLORS, SPACING, CARD_STYLES, TYPOGRAPHY } from "@/lib/design-system";
import { withAuth } from "@/components/auth";
import { Calendar, TrendingUp } from "lucide-react";

function ReportsPage() {
  const router = useRouter();

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader
        title="리포트"
        subtitle="주간 및 월간 기록을 분석하고 인사이트를 확인하세요"
      />

      <div className="space-y-4 mt-8">
        {/* 주간 리포트 버튼 */}
        <button
          onClick={() => router.push("/reports/weekly")}
          className="w-full relative overflow-hidden transition-all duration-300 active:scale-[0.98]"
          style={{
            ...CARD_STYLES.default,
            padding: "24px",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `
              0 4px 16px rgba(107, 122, 111, 0.12),
              0 2px 6px rgba(0,0,0,0.04),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
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
          <div className="relative z-10 flex items-start gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.brand.light}20` }}
            >
              <Calendar
                className="w-6 h-6"
                style={{ color: COLORS.brand.light }}
              />
            </div>
            <div className="flex-1">
              <h3
                className={TYPOGRAPHY.h3.fontSize}
                style={{
                  ...TYPOGRAPHY.h3,
                  marginBottom: "4px",
                }}
              >
                주간 리포트
              </h3>
              <p
                className={TYPOGRAPHY.body.fontSize}
                style={{
                  color: COLORS.text.secondary,
                  opacity: 0.8,
                }}
              >
                일주일간의 기록을 분석하여 패턴과 인사이트를 확인하세요
              </p>
            </div>
          </div>
        </button>

        {/* 월간 리포트 버튼 */}
        <button
          onClick={() => router.push("/reports/monthly")}
          className="w-full relative overflow-hidden transition-all duration-300 active:scale-[0.98]"
          style={{
            ...CARD_STYLES.default,
            padding: "24px",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `
              0 4px 16px rgba(107, 122, 111, 0.12),
              0 2px 6px rgba(0,0,0,0.04),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
          }}
        >
          {/* 종이 질감 오버레이 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, ${COLORS.brand.primary}15 0%, transparent 40%)
              `,
              mixBlendMode: "overlay",
              opacity: 0.5,
            }}
          />
          <div className="relative z-10 flex items-start gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.brand.primary}20` }}
            >
              <TrendingUp
                className="w-6 h-6"
                style={{ color: COLORS.brand.primary }}
              />
            </div>
            <div className="flex-1">
              <h3
                className={TYPOGRAPHY.h3.fontSize}
                style={{
                  ...TYPOGRAPHY.h3,
                  marginBottom: "4px",
                }}
              >
                월간 리포트
              </h3>
              <p
                className={TYPOGRAPHY.body.fontSize}
                style={{
                  color: COLORS.text.secondary,
                  opacity: 0.8,
                }}
              >
                한 달간의 기록을 종합 분석하여 성장과 변화를 확인하세요
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default withAuth(ReportsPage);
