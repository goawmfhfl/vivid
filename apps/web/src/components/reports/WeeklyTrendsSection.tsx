"use client";

import { useMemo } from "react";
import { Compass, Heart, Zap, User, Lock } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { FeedbackCard } from "@/components/ui/FeedbackCard";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import type { WeeklyTrendsResponse } from "@/hooks/useWeeklyTrends";
import { useSubscription } from "@/hooks/useSubscription";

interface WeeklyTrendsSectionProps {
  data: WeeklyTrendsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

interface TrendCardProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  items: string[];
  emptyMessage?: string;
  isLocked?: boolean;
}

function TrendCard({
  title,
  icon,
  iconColor,
  items,
  emptyMessage,
  isLocked = false,
}: TrendCardProps) {
  if (items.length === 0) {
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
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: iconColor }}
              />
              <p
                className={TYPOGRAPHY.body.fontSize}
                style={{
                  color: COLORS.text.primary,
                  lineHeight: "1.6",
                }}
              >
                {item}
              </p>
            </li>
          ))}
        </ul>
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

// 임시 데이터 (프로가 아닐 경우 사용)
const mockData = {
  direction: [
    "자기계발과 성장에 집중하는 방향으로 나아가고 있는 사람",
    "균형 잡힌 삶을 추구하는 방향으로 변화하고 있는 사람",
  ],
  core_value: [
    "균형 잡힌 삶과 지속 가능한 성장을 추구하는 가치",
    "자기 이해와 타인과의 깊은 연결을 중시하는 가치",
  ],
  driving_force: [
    "새로운 목표를 향한 호기심과 실행력",
    "내면의 성장에 대한 열망과 일관성",
  ],
  current_self: [
    "변화를 두려워하지 않고 꾸준히 나아가는 사람",
    "자기 성찰을 통해 지속적으로 성장하는 사람",
  ],
};

export function WeeklyTrendsSection({
  data,
  isLoading = false,
  error = null,
}: WeeklyTrendsSectionProps) {
  const { isPro } = useSubscription();

  // 데이터 처리 로직 (useMemo로 메모이제이션)
  const processedData = useMemo(() => {
    // 프로가 아닐 경우: 모든 데이터를 mockData로 사용
    if (!isPro) {
      return {
        direction: mockData.direction,
        core_value: mockData.core_value,
        driving_force: mockData.driving_force,
        current_self: mockData.current_self,
      };
    }

    // 프로 멤버십: 실제 데이터 사용
    if (!data) {
      return {
        direction: [],
        core_value: [],
        driving_force: [],
        current_self: [],
      };
    }

    return {
      direction: (data.direction || []).slice(0, 4),
      core_value: (data.core_value || []).slice(0, 4),
      driving_force: (data.driving_force || []).slice(0, 4),
      current_self: (data.current_self || []).slice(0, 4),
    };
  }, [data, isPro]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner
          message="주간 흐름을 불러오는 중..."
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
              : "주간 흐름을 불러오는 중 오류가 발생했습니다."
          }
          size="md"
        />
      </div>
    );
  }

  // 빈 데이터 상태
  const hasAnyData =
    processedData.direction.length > 0 ||
    processedData.core_value.length > 0 ||
    processedData.driving_force.length > 0 ||
    processedData.current_self.length > 0;

  if (!hasAnyData) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: COLORS.text.muted }}>
          아직 데이터가 없습니다. 주간 피드백을 생성하면 주간 흐름을 확인할 수
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
            나의 주간 흐름
          </h2>
          <p
            className={TYPOGRAPHY.body.fontSize}
            style={{ color: COLORS.text.secondary }}
          >
            최근 4주간의 데이터를 기반으로 한 인사이트입니다
          </p>
        </div>
      </ScrollAnimation>

      {/* 1. 어떤 방향으로 가고 있는 사람인가 */}
      <ScrollAnimation delay={100}>
        <TrendCard
          title="어떤 방향으로 가고 있는 사람인가"
          icon={<Compass className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.direction}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 2. 내가 진짜 중요하게 여기는 가치 */}
      <ScrollAnimation delay={200}>
        <TrendCard
          title="내가 진짜 중요하게 여기는 가치"
          icon={<Heart className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.core_value}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 3. 나를 움직이는 실제 원동력 */}
      <ScrollAnimation delay={300}>
        <TrendCard
          title="나를 움직이는 실제 원동력"
          icon={<Zap className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.driving_force}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 4. 요즘의 나라는 사람 */}
      <ScrollAnimation delay={400}>
        <TrendCard
          title="요즘의 나라는 사람"
          icon={<User className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.current_self}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>
    </>
  );
}
