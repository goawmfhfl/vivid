"use client";

import { useMemo } from "react";
import { Heart, Target, Sparkles, Zap, Wind, Lock } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { EmotionQuadrantChart } from "./EmotionQuadrantChart";
import { FeedbackCard } from "@/components/ui/FeedbackCard";
import { COLORS, TYPOGRAPHY, SHADOWS } from "@/lib/design-system";
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

export function RecentTrendsSection({
  data,
  isLoading = false,
  error = null,
}: RecentTrendsSectionProps) {
  const { isPro } = useSubscription();

  // 임시 데이터 (프로가 아닐 경우 사용)
  const mockData = {
    emotionData: [
      { date: "2024-01-01", valence: 0.5, arousal: 0.6, quadrant: "몰입·설렘" },
      {
        date: "2024-01-02",
        valence: 0.3,
        arousal: -0.2,
        quadrant: "안도·평온",
      },
      {
        date: "2024-01-03",
        valence: -0.2,
        arousal: 0.4,
        quadrant: "불안·초조",
      },
      { date: "2024-01-04", valence: 0.4, arousal: 0.5, quadrant: "몰입·설렘" },
      {
        date: "2024-01-05",
        valence: 0.2,
        arousal: -0.1,
        quadrant: "안도·평온",
      },
    ],
    aspired_self: [
      "창의적인 문제 해결자",
      "균형잡힌 삶을 추구하는 사람",
      "성장을 지속하는 학습자",
    ],
    interests: ["독서와 학습", "자연 속에서의 휴식", "새로운 경험 탐색"],
    immersionSituations: [
      "깊이 몰입하는 작업을 할 때",
      "새로운 아이디어를 발견할 때",
      "목표를 향해 나아갈 때",
    ],
    reliefSituations: [
      "가족과 함께 시간을 보낼 때",
      "평온한 아침을 시작할 때",
      "자신만의 공간에서 휴식을 취할 때",
    ],
  };

  // 데이터 처리 로직 (useMemo로 메모이제이션)
  const processedData = useMemo(() => {
    // 프로가 아닐 경우: 모든 데이터를 mockData로 사용
    if (!isPro) {
      return {
        emotionData: mockData.emotionData,
        aspired_self: mockData.aspired_self,
        interests: mockData.interests,
        immersionSituations: mockData.immersionSituations,
        reliefSituations: mockData.reliefSituations,
      };
    }

    // 프로 멤버십: 실제 데이터 사용
    if (!data) {
      return {
        emotionData: [],
        aspired_self: [],
        interests: [],
        immersionSituations: [],
        reliefSituations: [],
      };
    }

    return {
      emotionData: data.emotionData || [],
      aspired_self: (data.aspired_self || []).slice(0, 5),
      interests: (data.interests || []).slice(0, 5),
      immersionSituations: (data.immersionSituations || []).slice(0, 5),
      reliefSituations: (data.reliefSituations || []).slice(0, 5),
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
    processedData.emotionData.length > 0 ||
    processedData.aspired_self.length > 0 ||
    processedData.interests.length > 0 ||
    processedData.immersionSituations.length > 0 ||
    processedData.reliefSituations.length > 0;

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

      {/* 1. 기분의 변화 - 감정 사분면 차트 */}
      {processedData.emotionData.length > 0 && (
        <ScrollAnimation delay={100}>
          <div className="mb-12 relative">
            <FeedbackCard
              icon={<Heart className="w-6 h-6 text-white" />}
              iconColor="#B89A7A"
              title="기분의 변화"
              gradientColor="#B89A7A"
            >
              <p
                className={TYPOGRAPHY.bodySmall.fontSize}
                style={{
                  color: COLORS.text.tertiary,
                  marginBottom: "16px",
                }}
              >
                최근 5일간의 감정 변화를 사분면으로 확인하세요
              </p>
              <EmotionQuadrantChart data={processedData.emotionData} />
            </FeedbackCard>

            {/* 카드 전체를 덮는 blur 오버레이 */}
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
                    <Lock
                      className="w-4 h-4"
                      style={{ color: COLORS.text.white }}
                    />
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
        </ScrollAnimation>
      )}

      {/* 2. 지향하는 나의 모습 */}
      <ScrollAnimation delay={200}>
        <TrendCard
          title="나를 향한 나침반"
          icon={<Target className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.aspired_self}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 3. 관심사 */}
      <ScrollAnimation delay={300}>
        <TrendCard
          title="나를 움직이는 것들"
          icon={<Sparkles className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.interests}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 4. 몰입-희망 순간 */}
      <ScrollAnimation delay={400}>
        <TrendCard
          title="몰입의 순간들"
          icon={<Zap className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.immersionSituations}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>

      {/* 5. 안도-편안 순간 */}
      <ScrollAnimation delay={500}>
        <TrendCard
          title="편안함의 순간들"
          icon={<Wind className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.reliefSituations}
          emptyMessage="아직 데이터가 없습니다"
          isLocked={!isPro}
        />
      </ScrollAnimation>
    </>
  );
}
