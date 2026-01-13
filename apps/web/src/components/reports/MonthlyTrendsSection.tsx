"use client";

import { useMemo } from "react";
import { AlertTriangle, Heart, Zap, Target, Hash, Lock } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { FeedbackCard } from "@/components/ui/FeedbackCard";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import type { MonthlyTrendsResponse } from "@/types/monthly-feedback-new";
import { useMonthlyTrends } from "@/hooks/useMonthlyTrends";
import { useSubscription } from "@/hooks/useSubscription";

interface MonthlyTrendsSectionProps {
  data: MonthlyTrendsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

interface TrendCardProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  trends: MonthlyTrendsResponse["breakdown_moments"];
  emptyMessage?: string;
  isLocked?: boolean;
}

function TrendCard({
  title,
  icon,
  iconColor,
  trends,
  emptyMessage,
  isLocked = false,
}: TrendCardProps) {
  if (trends.length === 0) {
    if (emptyMessage) {
      return (
        <div className="mb-12">
          <FeedbackCard
            icon={icon}
            iconColor={iconColor}
            title={title}
            gradientColor={iconColor}
          >
            <p
              className={TYPOGRAPHY.body.fontSize}
              style={{ color: COLORS.text.muted }}
            >
              {emptyMessage}
            </p>
          </FeedbackCard>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mb-12 relative">
      <FeedbackCard
        icon={icon}
        iconColor={iconColor}
        title={title}
        gradientColor={iconColor}
      >
        <div className="space-y-3">
          {trends.map((trend, trendIdx) => (
            <div key={trendIdx} className="space-y-2">
              <p
                className={cn(
                  TYPOGRAPHY.body.fontSize,
                  "font-semibold"
                )}
                style={{ color: COLORS.text.primary }}
              >
                {trend.insight}
              </p>
              <ul className="space-y-2">
                {trend.answers.map((answer, answerIdx) => (
                  <li key={answerIdx} className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: iconColor }}
                    />
                    <div className="flex-1">
                      <span
                        className={cn(
                          TYPOGRAPHY.bodySmall.fontSize,
                          "font-semibold mr-2"
                        )}
                        style={{ color: iconColor }}
                      >
                        [{answer.month}]
                      </span>
                      <p
                        className={cn(
                          TYPOGRAPHY.body.fontSize,
                          "inline"
                        )}
                        style={{
                          color: COLORS.text.primary,
                          lineHeight: "1.6",
                        }}
                      >
                        {answer.answer}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </FeedbackCard>

      {/* 카드 전체를 덮는 blur 오버레이 */}
      {isLocked && (
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
          {/* 중앙 잠금 배지 */}
          <div className="absolute inset-0 z-30 flex items-center justify-center rounded-xl pointer-events-none">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.secondary} 100%)`,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow:
                  "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Lock className="w-4 h-4" style={{ color: COLORS.text.white }} />
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: COLORS.text.white }}
              >
                Pro
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function MonthlyTrendsSection({
  data,
  isLoading = false,
  error = null,
}: MonthlyTrendsSectionProps) {
  const { isPro } = useSubscription();

  // 데이터 처리 로직 (useMemo로 메모이제이션)
  const processedData = useMemo(() => {
    // 프로가 아닐 경우: 빈 데이터 반환
    if (!isPro) {
      return {
        breakdown_moments: [],
        recovery_moments: [],
        energy_sources: [],
        missing_future_elements: [],
        top_keywords: [],
      };
    }

    // 프로 멤버십: 실제 데이터 사용
    if (!data) {
      return {
        breakdown_moments: [],
        recovery_moments: [],
        energy_sources: [],
        missing_future_elements: [],
        top_keywords: [],
      };
    }

    return {
      breakdown_moments: data.breakdown_moments || [],
      recovery_moments: data.recovery_moments || [],
      energy_sources: data.energy_sources || [],
      missing_future_elements: data.missing_future_elements || [],
      top_keywords: data.top_keywords || [],
    };
  }, [data, isPro]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner
          message="월간 흐름을 불러오는 중..."
          size="md"
          showMessage={true}
        />
      </div>
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
              : "월간 흐름을 불러오는 중 오류가 발생했습니다."
          }
          size="md"
        />
      </div>
    );
  }

  // 빈 데이터 상태
  const hasAnyData =
    processedData.breakdown_moments.length > 0 ||
    processedData.recovery_moments.length > 0 ||
    processedData.energy_sources.length > 0 ||
    processedData.missing_future_elements.length > 0 ||
    processedData.top_keywords.length > 0;

  if (!hasAnyData) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: COLORS.text.muted }}>
          아직 데이터가 없습니다. 월간 VIVID를 생성하면 월간 흐름을 확인할 수
          있습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 섹션 헤더 */}
      <ScrollAnimation>
        <div className="mb-6">
          <h2
            className={TYPOGRAPHY.h2.fontSize}
            style={{ ...TYPOGRAPHY.h2, marginBottom: "8px" }}
          >
            나의 월간 흐름
          </h2>
          <p
            className={TYPOGRAPHY.body.fontSize}
            style={{ color: COLORS.text.secondary }}
          >
            최근 4달간의 데이터를 기반으로 한 인사이트입니다
          </p>
        </div>
      </ScrollAnimation>

      {/* 1. 나는 어떤 순간에서 가장 무너지는가 */}
      {processedData.breakdown_moments.length > 0 && (
        <ScrollAnimation delay={100}>
          <TrendCard
            title="나는 어떤 순간에서 가장 무너지는가"
            icon={<AlertTriangle className="w-4 h-4 text-white" />}
            iconColor="#E5B96B"
            trends={processedData.breakdown_moments}
            emptyMessage="아직 데이터가 없습니다"
            isLocked={!isPro}
          />
        </ScrollAnimation>
      )}

      {/* 2. 나는 어떤 순간에서 가장 회복되는가 */}
      {processedData.recovery_moments.length > 0 && (
        <ScrollAnimation delay={200}>
          <TrendCard
            title="나는 어떤 순간에서 가장 회복되는가"
            icon={<Heart className="w-4 h-4 text-white" />}
            iconColor="#A8BBA8"
            trends={processedData.recovery_moments}
            emptyMessage="아직 데이터가 없습니다"
            isLocked={!isPro}
          />
        </ScrollAnimation>
      )}

      {/* 3. 내가 실제로 에너지를 얻는 방향 */}
      {processedData.energy_sources.length > 0 && (
        <ScrollAnimation delay={300}>
          <TrendCard
            title="내가 실제로 에너지를 얻는 방향"
            icon={<Zap className="w-4 h-4 text-white" />}
            iconColor="#A8BBA8"
            trends={processedData.energy_sources}
            emptyMessage="아직 데이터가 없습니다"
            isLocked={!isPro}
          />
        </ScrollAnimation>
      )}

      {/* 4. 내가 미래를 그릴 때 빠뜨리는 요소 */}
      {processedData.missing_future_elements.length > 0 && (
        <ScrollAnimation delay={400}>
          <TrendCard
            title="내가 미래를 그릴 때 빠뜨리는 요소"
            icon={<Target className="w-4 h-4 text-white" />}
            iconColor="#E5B96B"
            trends={processedData.missing_future_elements}
            emptyMessage="아직 데이터가 없습니다"
            isLocked={!isPro}
          />
        </ScrollAnimation>
      )}

      {/* 5. 이 달에서 가장 자주 등장하는 키워드 5가지 */}
      {processedData.top_keywords.length > 0 && (
        <ScrollAnimation delay={500}>
          <TrendCard
            title="이 달에서 가장 자주 등장하는 키워드 5가지"
            icon={<Hash className="w-4 h-4 text-white" />}
            iconColor="#E5B96B"
            trends={processedData.top_keywords}
            emptyMessage="아직 데이터가 없습니다"
            isLocked={!isPro}
          />
        </ScrollAnimation>
      )}
    </>
  );
}
