"use client";

import { useMemo } from "react";
import { Target, Sparkles, Zap, User } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { ProNoticeBox } from "@/components/reports/ProNoticeBox";
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

/** 비Pro 미리보기용 — 일반인 컨셉의 샘플 데이터 */
const mockData = {
  aspired_self: [
    "(예시) 하고 싶은 일을 꾸준히 실천하며, 몸과 마음의 균형을 챙기는 사람",
  ],
  interests: [
    "(예시) 취미나 운동으로 몸과 마음을 리프레시하는 시간",
  ],
  immersion_moments: [
    "(예시) 아침에 여유 있게 일어나 하루를 정리한 뒤 맞이한 오전",
  ],
  personality_traits: [
    "(예시) 일상의 작은 즐거움을 찾고, 기록으로 남기는 습관이 있는 사람",
  ],
};

export function RecentTrendsSection({
  data,
  isLoading = false,
  error = null,
}: RecentTrendsSectionProps) {
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
    <section className="mb-10 w-full max-w-2xl min-w-0">
      <h2
        className="text-lg font-semibold tracking-tight mb-1"
        style={{ color: COLORS.text.primary }}
      >
        한눈에 보기
      </h2>
      <p className="text-sm mb-4" style={{ color: COLORS.text.secondary }}>
        최근 7일 데이터 기반 인사이트
      </p>

      {!isPro && (
        <ProNoticeBox
          message="Pro 멤버가 되면 최근 7일 기록을 바탕으로 한 ‘한눈에 보기’ 인사이트를 확인할 수 있어요. 지향하는 모습, 원동력, 몰입의 순간, 나에 대한 이해를 한눈에 살펴보세요."
          className="mb-4"
        />
      )}

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
        {SECTION_CONFIG.map(({ key, title, Icon }, index) => {
          const items = processedData[key];
          const isEmpty = !items?.length;

          return (
            <div
              key={key}
              className="relative rounded-xl overflow-hidden min-h-[100px] min-w-0 transition-all duration-200 animate-fade-in"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                animationDelay: `${index * 80}ms`,
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
