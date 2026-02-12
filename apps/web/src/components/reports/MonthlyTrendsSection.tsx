"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Lock } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { ReportDropdown } from "@/components/reports/ReportDropdown";
import { TrendsCardSkeleton } from "@/components/reports/GrowthInsightsSkeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { COLORS } from "@/lib/design-system";

const MONTHLY_ACCENT = COLORS.monthly.primary;
import type { MonthlyTrendsResponse } from "@/types/monthly-vivid";
import { useSubscription } from "@/hooks/useSubscription";
import { PreviewDataNotice } from "./PreviewDataNotice";

/** 데이터 없을 때 미리보기용 플레이스홀더 */
const MONTHLY_PREVIEW_DATA = {
  direction: [
    "한 달간의 기록을 돌아보며 성장 방향을 찾아가는 사람",
    "균형과 조화를 유지하려 노력하는 방향",
  ],
  core_value: [
    "꾸준함과 끈기를 중요하게 여기는 사람",
    "반성과 다듬어 나가는 과정을 소중히 여기는 스타일",
  ],
  driving_force: [
    "도움이 되는 일을 하고 싶은 마음",
    "내면의 평화를 유지하려는 노력",
  ],
  current_self: [
    "생각한 뒤 말하고 행동하는 사람",
    "꾸준히 실천하는 사람",
  ],
};

interface MonthlyTrendsSectionProps {
  data: MonthlyTrendsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

export function MonthlyTrendsSection({
  data,
  isLoading = false,
  error = null,
}: MonthlyTrendsSectionProps) {
  const router = useRouter();
  const { isPro } = useSubscription();

  // 실제 데이터 있으면 사용, 없으면 미리보기 데이터
  const processedData = useMemo(() => {
    if (!isPro) {
      return {
        direction: [] as string[],
        core_value: [] as string[],
        driving_force: [] as string[],
        current_self: [] as string[],
      };
    }
    const real = data
      ? {
          direction: (data.direction || []).slice(0, 4),
          core_value: (data.core_value || []).slice(0, 4),
          driving_force: (data.driving_force || []).slice(0, 4),
          current_self: (data.current_self || []).slice(0, 4),
        }
      : null;
    const hasReal =
      real &&
      (real.direction.length > 0 ||
        real.core_value.length > 0 ||
        real.driving_force.length > 0 ||
        real.current_self.length > 0);
    return hasReal ? real : MONTHLY_PREVIEW_DATA;
  }, [data, isPro]);

  const hasRealData =
    !!data &&
    ((data.direction?.length ?? 0) > 0 ||
      (data.core_value?.length ?? 0) > 0 ||
      (data.driving_force?.length ?? 0) > 0 ||
      (data.current_self?.length ?? 0) > 0);

  if (isLoading) {
    return (
      <>
        <ScrollAnimation>
          <div className="mb-4">
            <h2 className="text-[13px] sm:text-sm font-semibold mb-1" style={{ color: COLORS.text.primary }}>
              성장 인사이트
            </h2>
            <p className="text-[12px] sm:text-sm" style={{ color: COLORS.text.primary, lineHeight: "1.6" }}>
              월간 VIVID 기록을 바탕으로 한 내용이에요
            </p>
          </div>
        </ScrollAnimation>
        <ScrollAnimation delay={90}>
          <TrendsCardSkeleton />
        </ScrollAnimation>
      </>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorDisplay
          message={
            error instanceof Error
              ? error.message
              : "월간 흐름을 불러오는 중 오류가 발생했습니다."
          }
          size="md"
        />
      </div>
    );
  }

  return (
    <>
      <ScrollAnimation>
        <div className="mb-4">
          <h2 className="text-[13px] sm:text-sm font-semibold mb-1" style={{ color: COLORS.text.primary }}>
            성장 인사이트
          </h2>
          <p className="text-[12px] sm:text-sm" style={{ color: COLORS.text.primary, lineHeight: "1.6" }}>
            월간 VIVID 기록을 바탕으로 한 내용이에요
          </p>
        </div>
      </ScrollAnimation>

      <ScrollAnimation delay={90}>
        <>
          {!hasRealData && (
            <PreviewDataNotice
              subtitle="월간 VIVID가 쌓이면 나의 기록이 표시됩니다"
              accentColor={MONTHLY_ACCENT}
            />
          )}
          <div
            className="relative rounded-xl overflow-hidden min-w-0 transition-all duration-200 animate-fade-in"
            style={{
              backgroundColor: COLORS.background.cardElevated,
              border: `1px solid ${COLORS.border.light}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: MONTHLY_ACCENT }} />
          <div className="pl-4 pr-4 pt-4 pb-4 relative">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 mb-4">
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${MONTHLY_ACCENT}18` }}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: MONTHLY_ACCENT }} />
              </div>
              <h3
                className="text-xs sm:text-sm font-semibold truncate"
                style={{ color: COLORS.text.primary }}
              >
                나를 설명하는 4가지 흐름
              </h3>
            </div>
            <p className="text-xs mb-3" style={{ color: COLORS.text.secondary }}>
              필요한 항목만 펼쳐서 확인할 수 있도록 한 곳에 모아두었습니다.
            </p>
            <div className="space-y-2">
              <ReportDropdown
                label="어떤 방향으로 가고 있는 사람인가"
                items={processedData.direction}
                accentColor={MONTHLY_ACCENT}
              />
              <ReportDropdown
                label="내가 진짜 중요하게 여기는 가치"
                items={processedData.core_value}
                accentColor={MONTHLY_ACCENT}
              />
              <ReportDropdown
                label="나를 움직이는 실제 원동력"
                items={processedData.driving_force}
                accentColor={MONTHLY_ACCENT}
              />
              <ReportDropdown
                label="요즘의 나라는 사람"
                items={processedData.current_self}
                accentColor={MONTHLY_ACCENT}
              />
            </div>
          </div>
          {!isPro && (
            <>
              <div
                className="absolute inset-0 z-20 rounded-xl pointer-events-none"
                style={{
                  background: `linear-gradient(135deg,
                    rgba(255, 255, 255, 0.75) 0%,
                    rgba(250, 252, 250, 0.85) 30%,
                    rgba(248, 250, 248, 0.88) 60%,
                    rgba(255, 255, 255, 0.82) 100%
                  )`,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              />
              <div
                className="absolute inset-0 z-30 flex items-center justify-center rounded-xl cursor-pointer"
                onClick={() => router.push("/membership")}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.monthly.primary} 0%, ${COLORS.monthly.dark} 100%)`,
                    boxShadow:
                      "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Lock className="w-4 h-4" style={{ color: COLORS.text.white }} />
                  <span className="text-sm font-semibold tracking-wide" style={{ color: COLORS.text.white }}>
                    Pro
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        </>
      </ScrollAnimation>
    </>
  );
}
