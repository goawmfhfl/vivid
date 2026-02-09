"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Target, Sparkles, Zap, User, Lock } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { COLORS } from "@/lib/design-system";
import type { RecentTrendsResponse } from "@/hooks/useRecentTrends";
import { useSubscription } from "@/hooks/useSubscription";

interface RecentTrendsSectionProps {
  data: RecentTrendsResponse | null;
  isLoading?: boolean;
  error?: Error | null;
}

const SECTION_CONFIG = [
  {
    key: "aspired_self",
    title: "내가 지향하는 나의 모습",
    Icon: Target,
  },
  {
    key: "interests",
    title: "나를 움직이는 원동력",
    Icon: Sparkles,
  },
  {
    key: "immersion_moments",
    title: "몰입의 순간들",
    Icon: Zap,
  },
  {
    key: "personality_traits",
    title: "나라는 사람",
    Icon: User,
  },
] as const;

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
  const router = useRouter();
  const { isPro } = useSubscription();

  const processedData = useMemo(() => {
    if (!isPro) {
      return {
        aspired_self: mockData.aspired_self,
        interests: mockData.interests,
        immersion_moments: mockData.immersion_moments,
        personality_traits: mockData.personality_traits,
      };
    }
    if (!data) {
      return {
        aspired_self: [] as string[],
        interests: [] as string[],
        immersion_moments: [] as string[],
        personality_traits: [] as string[],
      };
    }
    return {
      aspired_self: (data.aspired_self || []).slice(0, 5),
      interests: (data.interests || []).slice(0, 5),
      immersion_moments: (data.immersion_moments || []).slice(0, 5),
      personality_traits: (data.personality_traits || []).slice(0, 5),
    };
  }, [data, isPro]);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner message="최근 동향을 불러오는 중..." size="md" showMessage />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorDisplay
          message={error instanceof Error ? error.message : "최근 동향을 불러오는 중 오류가 발생했습니다."}
          size="md"
        />
      </div>
    );
  }

  const hasAnyData =
    processedData.aspired_self.length > 0 ||
    processedData.interests.length > 0 ||
    processedData.immersion_moments.length > 0 ||
    processedData.personality_traits.length > 0;

  if (!hasAnyData) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: COLORS.text.muted, fontSize: "0.875rem" }}>
          아직 데이터가 없습니다. 일일 VIVID를 생성하면 최근 동향을 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  const accent = COLORS.brand.primary;
  const cardBg = COLORS.background.cardElevated;
  const cardBorder = COLORS.border.light;

  return (
    <section className="mb-10 w-full max-w-2xl">
      <h2
        className="text-lg font-semibold tracking-tight mb-1"
        style={{ color: COLORS.text.primary }}
      >
        한눈에 보기
      </h2>
      <p className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
        최근 5일 데이터 기반 인사이트
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTION_CONFIG.map(({ key, title, Icon }) => {
          const items = processedData[key];
          const isEmpty = !items?.length;

          return (
            <div
              key={key}
              className="relative rounded-xl overflow-hidden min-h-[100px] transition-all duration-200"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: accent }}
              />
              <div className="pl-4 pr-4 pt-3.5 pb-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accent}18` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                  </div>
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: COLORS.text.primary }}
                  >
                    {title}
                  </span>
                </div>
                {isEmpty ? (
                  <p className="text-xs" style={{ color: COLORS.text.muted }}>
                    아직 데이터가 없습니다
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {items.slice(0, 5).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: accent }}
                        />
                        <span
                          className="text-sm leading-relaxed"
                          style={{ color: COLORS.text.primary }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!isPro && (
                <>
                  <div
                    className="absolute inset-0 z-10 rounded-xl pointer-events-none"
                    style={{
                      background: "rgba(255,255,255,0.82)",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => router.push("/membership")}
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl cursor-pointer"
                  >
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{
                        color: COLORS.text.white,
                        backgroundColor: accent,
                      }}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Pro
                    </span>
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
