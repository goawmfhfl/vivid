"use client";

import { useMemo } from "react";
import { Target, Sparkles, Zap, User, Lock } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { FeedbackCard } from "@/components/ui/FeedbackCard";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import type { RecentTrendsResponse } from "@/hooks/useRecentTrends";
import { useSubscription } from "@/hooks/useSubscription";

interface RecentTrendsSectionProps {
  data: RecentTrendsResponse | null;
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
  aspired_self: [
    "창의적인 문제 해결자",
    "균형잡힌 삶을 추구하는 사람",
    "성장을 지속하는 학습자",
  ],
  interests: ["독서와 학습", "자연 속에서의 휴식", "새로운 경험 탐색"],
  immersion_moments: [
    "깊이 몰입하는 작업을 할 때",
    "새로운 아이디어를 발견할 때",
    "목표를 향해 나아갈 때",
  ],
  personality_traits: [
    "자기 성찰을 중시하는 사람",
    "미래 지향적인 사람",
    "감정 표현이 풍부한 사람",
  ],
};

export function RecentTrendsSection({
  data,
  isLoading = false,
  error = null,
}: RecentTrendsSectionProps) {
  const { isPro } = useSubscription();

  // 데이터 처리 로직 (useMemo로 메모이제이션)
  const processedData = useMemo(() => {
    // 프로가 아닐 경우: 모든 데이터를 mockData로 사용
    if (!isPro) {
      return {
        aspired_self: mockData.aspired_self,
        interests: mockData.interests,
        immersion_moments: mockData.immersion_moments,
        personality_traits: mockData.personality_traits,
      };
    }

    // 프로 멤버십: 실제 데이터 사용
    if (!data) {
      return {
        aspired_self: [],
        interests: [],
        immersion_moments: [],
        personality_traits: [],
      };
    }

    return {
      aspired_self: (data.aspired_self || []).slice(0, 5),
      interests: (data.interests || []).slice(0, 5),
      immersion_moments: (data.immersion_moments || []).slice(0, 5),
      personality_traits: (data.personality_traits || []).slice(0, 5),
    };
  }, [data, isPro]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner
          message="최근 동향을 불러오는 중..."
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
              : "최근 동향을 불러오는 중 오류가 발생했습니다."
          }
          size="md"
        />
      </div>
    );
  }

  // 빈 데이터 상태
  const hasAnyData =
    processedData.aspired_self.length > 0 ||
    processedData.interests.length > 0 ||
    processedData.immersion_moments.length > 0 ||
    processedData.personality_traits.length > 0;

  if (!hasAnyData) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: COLORS.text.muted }}>
          아직 데이터가 없습니다. 일일 피드백을 생성하면 최근 동향을 확인할 수
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
            나의 최근 흐름
          </h2>
          <p
            className={TYPOGRAPHY.body.fontSize}
            style={{ color: COLORS.text.secondary }}
          >
            최근 5일간의 데이터를 기반으로 한 인사이트입니다
          </p>
        </div>
      </ScrollAnimation>

      {/* 1. 지향하는 나의 모습 */}
      <ScrollAnimation delay={100}>
        <TrendCard
          title="내가 지향하는 나의 모습"
          icon={<Target className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.aspired_self}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 2. 관심사 */}
      <ScrollAnimation delay={200}>
        <TrendCard
          title="나를 움직이는 원동력"
          icon={<Sparkles className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.interests}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 3. 몰입 희망 순간 */}
      <ScrollAnimation delay={300}>
        <TrendCard
          title="몰입의 순간들"
          icon={<Zap className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.immersion_moments}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 4. 나라는 사람의 성향 */}
      <ScrollAnimation delay={400}>
        <TrendCard
          title="나라는 사람"
          icon={<User className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.personality_traits}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>
    </>
  );
}
