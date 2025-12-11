"use client";

import { useMemo } from "react";
import { Heart, Target, Sparkles, Zap, Wind } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { EmotionQuadrantChart } from "./EmotionQuadrantChart";
import { Card } from "@/components/ui/card";
import { COLORS, SPACING } from "@/lib/design-system";
import type { RecentTrendsResponse } from "@/hooks/useRecentTrends";

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
}

function TrendCard({
  title,
  icon,
  iconColor,
  items,
  emptyMessage,
}: TrendCardProps) {
  if (items.length === 0) {
    if (emptyMessage) {
      return (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: iconColor }}
            >
              {icon}
            </div>
            <h2
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: "#333333" }}
            >
              {title}
            </h2>
          </div>
          <Card
            className="p-6"
            style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
          >
            <p className="text-sm" style={{ color: COLORS.text.muted }}>
              {emptyMessage}
            </p>
          </Card>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconColor }}
        >
          {icon}
        </div>
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "#333333" }}
        >
          {title}
        </h2>
      </div>
      <Card
        className="p-6"
        style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
      >
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: iconColor }}
              />
              <p
                className="text-sm"
                style={{
                  color: "#333333",
                  lineHeight: "1.6",
                }}
              >
                {item}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function RecentTrendsSection({
  data,
  isLoading = false,
  error = null,
}: RecentTrendsSectionProps) {
  // 데이터 처리 로직 (useMemo로 메모이제이션)
  const processedData = useMemo(() => {
    if (!data) {
      return {
        emotionData: [],
        aspiredSelf: [],
        interests: [],
        immersionSituations: [],
        reliefSituations: [],
      };
    }

    return {
      emotionData: data.emotionData || [],
      aspiredSelf: (data.aspiredSelf || []).slice(0, 5),
      interests: (data.interests || []).slice(0, 5),
      immersionSituations: (data.immersionSituations || []).slice(0, 5),
      reliefSituations: (data.reliefSituations || []).slice(0, 5),
    };
  }, [data]);

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
    processedData.aspiredSelf.length > 0 ||
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
            className="text-xl sm:text-2xl font-semibold"
            style={{ color: "#333333", marginBottom: "8px" }}
          >
            나의 최근 흐름
          </h2>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
            최근 5일간의 데이터를 기반으로 한 인사이트입니다
          </p>
        </div>
      </ScrollAnimation>

      {/* 1. 기분의 변화 - 감정 사분면 차트 */}
      {processedData.emotionData.length > 0 && (
        <ScrollAnimation delay={100}>
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#B89A7A" }}
              >
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ color: "#333333" }}
              >
                기분의 변화
              </h2>
            </div>
            <Card
              className="p-6"
              style={{ backgroundColor: "white", border: "1px solid #E6E4DE" }}
            >
              <p
                className="text-xs mb-4"
                style={{
                  color: "#6B7A6F",
                }}
              >
                최근 5일간의 감정 변화를 사분면으로 확인하세요
              </p>
              <EmotionQuadrantChart data={processedData.emotionData} />
            </Card>
          </div>
        </ScrollAnimation>
      )}

      {/* 2. 지향하는 나의 모습 */}
      <ScrollAnimation delay={200}>
        <TrendCard
          title="지향하는 나의 모습"
          icon={<Target className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.aspiredSelf}
          emptyMessage="아직 데이터가 없습니다"
        />
      </ScrollAnimation>

      {/* 3. 관심사 */}
      <ScrollAnimation delay={300}>
        <TrendCard
          title="관심사"
          icon={<Sparkles className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.interests}
          emptyMessage="아직 데이터가 없습니다"
        />
      </ScrollAnimation>

      {/* 4. 몰입-희망 순간 */}
      <ScrollAnimation delay={400}>
        <TrendCard
          title="몰입 그리고 희망을 느끼는 순간"
          icon={<Zap className="w-4 h-4 text-white" />}
          iconColor="#A8BBA8"
          items={processedData.immersionSituations}
          emptyMessage="아직 데이터가 없습니다"
        />
      </ScrollAnimation>

      {/* 5. 안도-편안 순간 */}
      <ScrollAnimation delay={500}>
        <TrendCard
          title="편함, 안도를 느끼는 순간"
          icon={<Wind className="w-4 h-4 text-white" />}
          iconColor="#E5B96B"
          items={processedData.reliefSituations}
          emptyMessage="아직 데이터가 없습니다"
        />
      </ScrollAnimation>
    </>
  );
}
