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
  recurring_self: [
    "[26년1월]: 기술적 성취와 가정의 행복을 함께 키우며, 진정성 있는 1인 사업가로 나아가고 있어요",
    "[25년12월]: 꾸준히 실천하려 하고, 한 번 정한 일은 끝까지 해내는 편이에요",
  ],
  effort_to_keep: [
    "[26년1월]: 완벽함보다 진심을 담는 것, 그리고 사랑하는 가족과 함께하는 따뜻한 균형을 지키려 했어요",
    "[25년12월]: 꾸준함과 끈기를 지키기 위해 작은 것부터 시작하는 습관을 유지했어요",
  ],
  most_meaningful: [
    "[26년1월]: 건강한 습관들과 아내와 함께 나누는 저녁 시간의 편안함이 가장 의미 있었어요",
    "[25년12월]: 매일 아침 스스로를 다잡는 긍정의 힘이 원동력이 되어주었어요",
  ],
  biggest_change: [
    "[26년1월]: 개발자로서의 자신감이 쑥쑥 자라고, 완벽하고 싶은 마음과 싸우며 꾸준히 노력하는 사람으로 변했어요",
    "[25년12월]: 시작의 떨림과 걱정을 느끼면서도 묵묵히 첫 발을 떼기 시작했어요",
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
        recurring_self: [] as string[],
        effort_to_keep: [] as string[],
        most_meaningful: [] as string[],
        biggest_change: [] as string[],
      };
    }
    const real = data
      ? {
          recurring_self: (data.recurring_self || []).slice(0, 4),
          effort_to_keep: (data.effort_to_keep || []).slice(0, 4),
          most_meaningful: (data.most_meaningful || []).slice(0, 4),
          biggest_change: (data.biggest_change || []).slice(0, 4),
        }
      : null;
    const hasReal =
      real &&
      (real.recurring_self.length > 0 ||
        real.effort_to_keep.length > 0 ||
        real.most_meaningful.length > 0 ||
        real.biggest_change.length > 0);
    return hasReal ? real : MONTHLY_PREVIEW_DATA;
  }, [data, isPro]);

  const hasRealData =
    !!data &&
    ((data.recurring_self?.length ?? 0) > 0 ||
      (data.effort_to_keep?.length ?? 0) > 0 ||
      (data.most_meaningful?.length ?? 0) > 0 ||
      (data.biggest_change?.length ?? 0) > 0);

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
                label="가장 자주 드러나는 나의 모습"
                items={processedData.recurring_self}
                accentColor={MONTHLY_ACCENT}
                variant="monthly"
              />
              <ReportDropdown
                label="지키기 위해서 노력했던 것"
                items={processedData.effort_to_keep}
                accentColor={MONTHLY_ACCENT}
                variant="monthly"
              />
              <ReportDropdown
                label="내게 가장 의미가 있었던 것"
                items={processedData.most_meaningful}
                accentColor={MONTHLY_ACCENT}
                variant="monthly"
              />
              <ReportDropdown
                label="발생한 가장 큰 변화"
                items={processedData.biggest_change}
                accentColor={MONTHLY_ACCENT}
                variant="monthly"
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
