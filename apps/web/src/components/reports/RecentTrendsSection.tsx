"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  if (items.length === 0) {
    if (emptyMessage) {
      return (
        <div className="mb-12">
          <FeedbackCard
            icon={icon}
            iconColor={iconColor}
            title={title}
            gradientColor={iconColor}
            isLocked={isLocked}
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
        isLocked={isLocked}
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
          {/* 중앙 잠금 배지 - 클릭 가능 */}
          <div 
            className="absolute inset-0 z-30 flex items-center justify-center rounded-xl cursor-pointer"
            onClick={() => router.push("/membership")}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
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
    "서두르지 않고 깊이 있게 사고하며, 실용적인 솔루션을 통해 사람들에게 가치를 전달하는 사람",
    "일상의 기록과 꾸준한 반성을 통해 내면의 평화를 찾고, 이를 바탕으로 타인에게 따뜻한 인사이트를 나누는 사람",
    "성급함을 자제하고 여유를 갖추며, 진솔한 커뮤니케이션으로 사람들에게 긍정적인 변화를 이끌어내는 사람",
    "완벽주의를 버리고 지속 가능한 성장을 추구하며, 작은 실천으로 큰 변화를 만들어내는 사람",
    "계획을 세우는 것에 그치지 않고, 실제로 행동으로 옮겨 사람들에게 실질적인 도움을 주는 사람",
  ],
  interests: [
    "제품 개발과 콘텐츠 기획을 통해 사용자 경험을 개선하고, 지속 가능한 성장 전략을 수립하는 일",
    "일기와 감정 기록을 통해 내면을 탐구하고, 이를 바탕으로 정서적 안정을 찾아가는 과정",
    "커뮤니티 운영과 온라인 강의를 통해 지식을 공유하고, 사람들과 의미 있는 연결을 만드는 일",
    "운동과 명상을 통해 몸과 마음을 단련하며, 건강한 라이프스타일을 만들어가는 실천",
    "독서와 학습을 통해 새로운 관점을 얻고, 이를 실제 프로젝트에 적용해 성과를 만들어내는 일",
  ],
  immersion_moments: [
    "코드 리뷰와 디버깅을 통해 문제의 근본 원인을 찾아내고, 깔끔한 해결책을 구현해내는 순간",
    "아침 운동과 명상 후 하루의 우선순위를 명확히 정하고, 집중력이 최고조에 달한 작업 시간",
    "일기 작성으로 하루를 정리한 뒤, 복잡했던 문제들이 하나씩 해결되며 흐름이 생기는 순간",
    "팀 미팅 후 피드백을 정리하고, 제품의 핵심 기능을 설계하며 전체 시스템이 연결되는 작업 시간",
    "주간 회고와 다음 주 계획을 세우며, 장기 목표와 단기 실행 사이의 균형을 잡아가는 순간",
  ],
  personality_traits: [
    "불안과 긴장감을 인지하면서도 포기하지 않고, 체계적인 계획을 세워 꾸준히 실행해나가는 성향",
    "결정에 대한 책임을 지고 끝까지 밀어붙이며, 서두르지 않고 단계적으로 쌓아가려는 신중한 성향",
    "목표 의식이 뚜렷하면서도 자신의 감정 상태를 관찰하고, 더 나은 습관으로 조절하려는 자기 관리형 성향",
    "성장 욕구가 강하고 사람들에게 진정성을 전하려 하며, 속도보다는 방향성을 중시하는 성향",
    "자신에 대한 믿음이 높고, 반복적인 실행과 피드백을 통해 지속적으로 개선해나가는 학습형 성향",
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
          아직 데이터가 없습니다. 일일 VIVID를 생성하면 최근 동향을 확인할 수
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
