"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Lock } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { ReportDropdown } from "@/components/reports/ReportDropdown";
import { TrendsCardSkeleton } from "@/components/reports/GrowthInsightsSkeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { COLORS } from "@/lib/design-system";

const WEEKLY_ACCENT = COLORS.weekly.primary;
import type { WeeklyTrendsResponse } from "@/hooks/useWeeklyTrends";
import { useSubscription } from "@/hooks/useSubscription";
import { PreviewDataNotice } from "./PreviewDataNotice";

/** 데이터 없을 때 미리보기용 플레이스홀더 */
const WEEKLY_PREVIEW_DATA = {
  direction: [
    "조금씩이라도 나아지려는 성장 방향으로 가고 있는 사람",
    "일상의 균형과 몸·마음 조화를 꾸준히 챙기려는 방향",
  ],
  core_value: [
    "꾸준히 실천하려 하고, 한 번 정한 일은 끝까지 해내는 편",
    "하루를 돌아보고 반성하며 다음에 살짝 다듬어 나가는 스타일",
  ],
  driving_force: [
    "내가 하는 일이 누군가에게 조금이라도 도움이 되길 바라는 마음",
    "나와 주변을 조금씩 더 나은 방향으로 바꿔나가고 싶은 욕구",
  ],
  current_self: [
    "깊이 있게 생각한 뒤 말하고 행동하는 사람",
    "현실에 맞게 움직이되, 꾸준히 실천하는 사람",
  ],
};

interface WeeklyTrendsSectionProps {
  data: WeeklyTrendsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

export function WeeklyTrendsSection({
  data,
  isLoading = false,
  error = null,
}: WeeklyTrendsSectionProps) {
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
    return hasReal ? real : WEEKLY_PREVIEW_DATA;
  }, [data, isPro]);

  const hasRealData =
    !!data &&
    ((data.direction?.length ?? 0) > 0 ||
      (data.core_value?.length ?? 0) > 0 ||
      (data.driving_force?.length ?? 0) > 0 ||
      (data.current_self?.length ?? 0) > 0);

  // 로딩 상태 - 스켈레톤 UI
  if (isLoading) {
    return (
      <>
        <ScrollAnimation>
          <div className="mb-4">
            <h2 className="text-[13px] sm:text-sm font-semibold mb-1" style={{ color: COLORS.text.primary }}>
              성장 인사이트
            </h2>
            <p className="text-[12px] sm:text-sm" style={{ color: COLORS.text.primary, lineHeight: "1.6" }}>
              주간 VIVID 기록을 바탕으로 한 내용이에요
            </p>
          </div>
        </ScrollAnimation>
        <ScrollAnimation delay={90}>
          <TrendsCardSkeleton />
        </ScrollAnimation>
      </>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="py-12">
        <ErrorDisplay
          message={
            error instanceof Error
              ? error.message
              : "주간 흐름을 불러오는 중 오류가 발생했습니다."
          }
          size="md"
        />
      </div>
    );
  }

  return (
    <>
      {/* 섹션 헤더 */}
      <ScrollAnimation>
        <div className="mb-4">
          <h2 className="text-[13px] sm:text-sm font-semibold mb-1" style={{ color: COLORS.text.primary }}>
            성장 인사이트
          </h2>
          <p className="text-[12px] sm:text-sm" style={{ color: COLORS.text.primary, lineHeight: "1.6" }}>
            주간 VIVID 기록을 바탕으로 한 내용이에요
          </p>
        </div>
      </ScrollAnimation>

      {/* 나를 설명하는 4가지 흐름 - GrowthInsightsSection 디자인 적용 */}
      <ScrollAnimation delay={90}>
        <>
          {!hasRealData && (
            <PreviewDataNotice
              subtitle="주간 VIVID가 쌓이면 나의 기록이 표시됩니다"
              accentColor={WEEKLY_ACCENT}
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
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: WEEKLY_ACCENT }} />
          <div className="pl-4 pr-4 pt-4 pb-4 relative">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 mb-4">
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${WEEKLY_ACCENT}18` }}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: WEEKLY_ACCENT }} />
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
                accentColor={WEEKLY_ACCENT}
              />
              <ReportDropdown
                label="내가 진짜 중요하게 여기는 가치"
                items={processedData.core_value}
                accentColor={WEEKLY_ACCENT}
              />
              <ReportDropdown
                label="나를 움직이는 실제 원동력"
                items={processedData.driving_force}
                accentColor={WEEKLY_ACCENT}
              />
              <ReportDropdown
                label="요즘의 나라는 사람"
                items={processedData.current_self}
                accentColor={WEEKLY_ACCENT}
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
                      background: `linear-gradient(135deg, ${COLORS.weekly.primary} 0%, ${COLORS.weekly.dark} 100%)`,
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

