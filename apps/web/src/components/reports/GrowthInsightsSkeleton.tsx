"use client";

import { COLORS } from "@/lib/design-system";

const CARD_BG = COLORS.background.cardElevated;
const CARD_BORDER = COLORS.border.light;

/**
 * 성장 인사이트 섹션용 스켈레톤 (GrowthInsightsSection - 2개 카드)
 */
export function GrowthInsightsSectionSkeleton() {
  return (
    <section className="space-y-6 w-full max-w-2xl relative min-w-0">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="relative rounded-xl overflow-hidden animate-pulse"
          style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: COLORS.brand.primary }}
          />
          <div className="pl-4 pr-4 pt-4 pb-4 relative">
            <div className="flex items-center justify-between gap-2 sm:gap-4 flex-nowrap mb-4 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: COLORS.background.hover }}
                />
                <div
                  className="h-3.5 w-28 sm:w-36 rounded"
                  style={{ backgroundColor: COLORS.background.hover }}
                />
              </div>
              <div
                className="w-12 h-8 rounded-lg"
                style={{ backgroundColor: COLORS.background.hover }}
              />
            </div>
            <div className="space-y-2 mt-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center justify-between py-1">
                  <div
                    className="h-3 w-24 rounded"
                    style={{ backgroundColor: COLORS.border.light }}
                  />
                  <div
                    className="h-3 w-4 rounded"
                    style={{ backgroundColor: COLORS.border.light }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div
                className="h-3 w-full rounded"
                style={{ backgroundColor: COLORS.border.light }}
              />
              <div
                className="h-3 w-4/5 rounded"
                style={{ backgroundColor: COLORS.border.light }}
              />
              <div
                className="h-3 w-3/4 rounded"
                style={{ backgroundColor: COLORS.border.light }}
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

/**
 * 나를 설명하는 4가지 흐름 카드용 스켈레톤 (MonthlyTrendsSection, WeeklyTrendsSection)
 */
export function TrendsCardSkeleton() {
  return (
    <div
      className="relative rounded-xl overflow-hidden min-w-0 animate-pulse"
      style={{
        backgroundColor: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: COLORS.brand.primary }}
      />
      <div className="pl-4 pr-4 pt-4 pb-4 relative">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 mb-4">
          <div
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex-shrink-0"
            style={{ backgroundColor: COLORS.background.hover }}
          />
          <div
            className="h-3.5 w-36 rounded"
            style={{ backgroundColor: COLORS.background.hover }}
          />
        </div>
        <div
          className="h-3 w-64 rounded mb-3"
          style={{ backgroundColor: COLORS.border.light }}
        />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div
                className="h-3 w-40 rounded"
                style={{ backgroundColor: COLORS.border.light }}
              />
              <div
                className="h-3 w-4 rounded"
                style={{ backgroundColor: COLORS.border.light }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 리포트 페이지 전체 로딩용 스켈레톤 (AppHeader 제외)
 */
export function ReportsPageSkeleton() {
  return (
    <div className="flex flex-col animate-fade-in">
      {/* 주간/월간 카드 그리드 */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 min-w-0 animate-pulse">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[20px] p-3 sm:p-5 min-h-[100px]"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg"
                style={{ backgroundColor: COLORS.background.hover }}
              />
              <div
                className="h-4 w-24 rounded"
                style={{ backgroundColor: COLORS.background.hover }}
              />
            </div>
            <div
              className="h-3 w-32 rounded"
              style={{ backgroundColor: COLORS.border.light }}
            />
          </div>
        ))}
      </div>

      {/* 한눈에 보기 섹션 */}
      <div className="mt-12 pt-12 border-t" style={{ borderColor: COLORS.border.light }}>
        <div className="mb-4">
          <div
            className="h-4 w-24 rounded mb-1 animate-pulse"
            style={{ backgroundColor: COLORS.background.hover }}
          />
          <div
            className="h-3 w-48 rounded animate-pulse"
            style={{ backgroundColor: COLORS.border.light }}
          />
        </div>
        <OneViewCardSkeleton />
      </div>
    </div>
  );
}

/**
 * 아직 생성되지 않은 주간/월간 vivid 알림 섹션용 스켈레톤
 * 드롭다운이 닫힌 상태(Notice 박스만)로 표시
 */
export function CandidatesSectionSkeleton() {
  return (
    <div className="mb-8">
      {/* Notice 박스 스켈레톤 (드롭다운 닫힌 상태) */}
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{
          backgroundColor: CARD_BG,
          border: `1px solid ${CARD_BORDER}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0"
            style={{ backgroundColor: COLORS.background.hover }}
          />
          <div className="flex-1 min-w-0 space-y-2">
            <div
              className="h-4 w-48 rounded"
              style={{ backgroundColor: COLORS.background.hover }}
            />
            <div
              className="h-3 w-36 rounded"
              style={{ backgroundColor: COLORS.border.light }}
            />
          </div>
          <div
            className="w-5 h-5 rounded flex-shrink-0"
            style={{ backgroundColor: COLORS.border.light }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 월간 VIVID 리스트 페이지용 스켈레톤
 */
export function MonthlyListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="mb-4">
        <div
          className="h-5 w-36 rounded mb-2"
          style={{ backgroundColor: COLORS.background.hover }}
        />
        <div
          className="h-4 w-52 rounded"
          style={{ backgroundColor: COLORS.border.light }}
        />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative flex items-center p-4 rounded-xl"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ backgroundColor: COLORS.monthly.primary }}
            />
            <div className="flex items-center gap-3 flex-1 min-w-0 pl-4">
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0"
                style={{ backgroundColor: COLORS.background.hover }}
              />
              <div className="flex-1 min-w-0 space-y-2">
                <div
                  className="h-4 w-32 rounded"
                  style={{ backgroundColor: COLORS.background.hover }}
                />
                <div
                  className="h-3 w-24 rounded"
                  style={{ backgroundColor: COLORS.border.light }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 주간 VIVID 리스트 페이지용 스켈레톤
 */
export function WeeklyListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="mb-4">
        <div
          className="h-5 w-36 rounded mb-2"
          style={{ backgroundColor: COLORS.background.hover }}
        />
        <div
          className="h-4 w-48 rounded"
          style={{ backgroundColor: COLORS.border.light }}
        />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative flex items-center p-4 rounded-xl"
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ backgroundColor: COLORS.weekly.primary }}
            />
            <div className="flex items-center gap-3 flex-1 min-w-0 pl-4">
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0"
                style={{ backgroundColor: COLORS.background.hover }}
              />
              <div className="flex-1 min-w-0 space-y-2">
                <div
                  className="h-4 w-32 rounded"
                  style={{ backgroundColor: COLORS.background.hover }}
                />
                <div
                  className="h-3 w-24 rounded"
                  style={{ backgroundColor: COLORS.border.light }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 한눈에 보기 카드용 스켈레톤 (FourWeek, FourMonth, Recent trends)
 */
export function OneViewCardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden min-w-0 animate-pulse"
      style={{
        backgroundColor: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="pl-4 pr-4 pt-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center">
          <div className="flex justify-center">
            <div
              className="w-[132px] h-[132px] rounded-full"
              style={{
                backgroundColor: COLORS.background.base,
                border: `1px solid ${CARD_BORDER}`,
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[0, 1].map((idx) => (
              <div
                key={`skeleton-${idx}`}
                className="rounded-lg p-3"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1px solid ${CARD_BORDER}`,
                }}
              >
                <div
                  className="h-3 w-20 rounded mb-2"
                  style={{ backgroundColor: COLORS.border.light }}
                />
                <div
                  className="h-6 w-12 rounded"
                  style={{ backgroundColor: COLORS.border.default }}
                />
              </div>
            ))}
          </div>
        </div>
        <div
          className="mt-4 pt-3 border-t"
          style={{ borderColor: COLORS.border.light }}
        >
          <div
            className="h-3 w-48 rounded mb-2.5"
            style={{ backgroundColor: COLORS.border.light }}
          />
          <div
            className="h-16 rounded"
            style={{ backgroundColor: COLORS.border.light }}
          />
        </div>
      </div>
    </div>
  );
}
