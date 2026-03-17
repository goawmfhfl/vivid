"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsNativeAppWithReady } from "@/hooks/useIsNativeApp";
import Link from "next/link";
import {
  BarChart3,
  Brain,
  MessageSquareQuote,
  PieChart,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { MembershipSection } from "@/components/membership/MembershipSection";
import { MembershipWeeklyKeywordsPreview } from "@/components/membership/MembershipWeeklyKeywordsPreview";
import { MembershipMonthlyCoreVisionsPreview } from "@/components/membership/MembershipMonthlyCoreVisionsPreview";
import { MembershipTodoBalancePreview } from "@/components/membership/MembershipTodoBalancePreview";
import { MembershipReviewsSection } from "@/components/membership/MembershipReviewsSection";
import { LazyMembershipImage } from "@/components/membership/LazyMembershipImage";
import { GrowthInsightsSection } from "@/components/reports/GrowthInsightsSection";
import { ScrollAnimation } from "@/components/ui/ScrollAnimation";
import { useNotionPolicies } from "@/hooks/useNotionPolicies";
import {
  membershipGrowthInsightsPreview,
  membershipIdentityPreview,
  membershipPatternsPreview,
  membershipPreviewCopy,
  membershipTodoBalancePreview,
  membershipWeeklyKeywordsPreview,
  membershipMonthlyVisionPreview,
} from "@/lib/membership-preview-data";
import { supabase } from "@/lib/supabase";
import { COLORS, SPACING, TYPOGRAPHY, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import img0 from "@/assets/membership/0.png";

type PlanType = "annual" | "monthly";

interface PlanDetails {
  id: PlanType;
  title: string;
  price: number;
  originalPrice?: number;
  period: string;
  discount?: number;
  description: string;
}

const PLANS: Record<PlanType, PlanDetails> = {
  annual: {
    id: "annual",
    title: "연간 VIVID Pro",
    price: 25000,
    originalPrice: 30000,
    period: "년",
    discount: 20,
    description: "1년마다 결제",
  },
  monthly: {
    id: "monthly",
    title: "월간 VIVID Pro",
    price: 2500,
    period: "월",
    description: "1개월마다 결제",
  },
};

const PLAN_ACCENT_COLORS: Record<PlanType, string> = {
  annual: COLORS.brand.secondary, // 올리브 그린
  monthly: COLORS.brand.primary, // 세이지 그린 (지금 시작하기 버튼 색상)
};

function PlanSelectionCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: PlanDetails;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const displayPrice = `₩${plan.price.toLocaleString("ko-KR")}`;
  const accentColor = PLAN_ACCENT_COLORS[plan.id];
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full relative overflow-hidden text-left transition-all duration-300"
      style={{
        backgroundColor: isSelected ? accentColor : COLORS.background.card,
        border: `2px solid ${isSelected ? accentColor : COLORS.border.light}`,
        borderRadius: "16px",
        padding: "16px",
        color: isSelected ? COLORS.text.white : COLORS.text.primary,
      }}
    >
      {plan.discount && (
        <div
          className="absolute top-0 left-0 px-3 py-1 text-xs font-bold rounded-br-xl"
          style={{
            backgroundColor: isSelected ? COLORS.text.white : accentColor,
            color: isSelected ? accentColor : COLORS.text.white,
          }}
        >
          -{plan.discount}%
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
            style={{
              borderColor: isSelected ? COLORS.text.white : COLORS.border.default,
              backgroundColor: isSelected ? "transparent" : "transparent",
            }}
          >
            {isSelected && (
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS.text.white }}
              />
            )}
          </div>
          <span className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight)}>{plan.title}</span>
        </div>
        <span className={cn(TYPOGRAPHY.h4.fontSize, TYPOGRAPHY.h4.fontWeight)}>{displayPrice}</span>
      </div>

      <div className="flex items-center justify-between pl-8">
        <span
          className={cn(TYPOGRAPHY.body.fontSize)}
          style={{
            color: isSelected ? "rgba(255,255,255,0.8)" : COLORS.text.secondary,
          }}
        >
          {plan.description}
        </span>
        {plan.originalPrice && (
          <span
            className={cn(TYPOGRAPHY.body.fontSize, "line-through")}
            style={{
              color: isSelected ? "rgba(255,255,255,0.6)" : COLORS.text.tertiary,
            }}
          >
            ₩{plan.originalPrice.toLocaleString("ko-KR")}
          </span>
        )}
      </div>
    </button>
  );
}

function MembershipHeader() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (currentScrollY <= 24) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(scrollDelta) < 8) {
        return;
      }

      setIsVisible(scrollDelta < 0);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-4 h-[56px] flex items-center bg-transparent transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-10px)",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <button
        onClick={() => router.back()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-black/5"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>
    </header>
  );
}

function MembershipPageContent() {
  const router = useRouter();
  const { isNative: isNativeApp, isReady } = useIsNativeAppWithReady();
  const { data: policies } = useNotionPolicies();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const [isCtaVisible, setIsCtaVisible] = useState(true);

  // embed=1은 라우팅 시 사라지므로, WebView 내 여부는 ReactNativeWebView 존재로 판단
  const isInApp =
    typeof window !== "undefined" &&
    !!(window as { ReactNativeWebView?: { postMessage?: unknown } })
      .ReactNativeWebView;

  const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

  // 프로 멤버십 소개 페이지는 네이티브 환경에서만 노출 (웹에서는 홈으로 리다이렉트, 개발 환경은 예외)
  useEffect(() => {
    if (!isReady || isNativeApp || isDev) return;
    router.replace("/");
  }, [isReady, isNativeApp, isDev, router]);

  useEffect(() => {
    if (!isInApp || typeof window === "undefined") return;
    console.log("[Membership] MEMBERSHIP_LOADED 전송 (네이티브에 가격 요청)");
    (window as any).ReactNativeWebView?.postMessage?.(
      JSON.stringify({ type: "MEMBERSHIP_LOADED" })
    );
  }, [isInApp]);

  // WebView: 세션 있으면 RevenueCat app_user_id 연동을 위해 userId 전달
  useEffect(() => {
    if (!isInApp || typeof window === "undefined") return;
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted || !session?.user?.id) return;
      (window as any).ReactNativeWebView?.postMessage?.(
        JSON.stringify({ type: "SUPABASE_SESSION_READY", userId: session.user.id })
      );
    });
    return () => { mounted = false; };
  }, [isInApp]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      const viewportBottom = currentScrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight;
      const isNearBottom = viewportBottom >= pageBottom - 24;

      if (isNearBottom) {
        setIsCtaVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY <= 80) {
        setIsCtaVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(scrollDelta) < 8) {
        return;
      }

      setIsCtaVisible(scrollDelta < 0);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 웹 환경에서는 리다이렉트 중 로딩 표시 (개발 환경은 페이지 노출)
  if (isReady && !isNativeApp && !isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background.base }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: COLORS.brand.primary }} />
      </div>
    );
  }

  const handleStartNow = () => {
    const planInfo = PLANS[selectedPlan];
    const payload = { type: "PURCHASE", plan: planInfo.id };
    
    console.log("[Membership] 지금 시작하기 클릭", {
      planInfo,
      isInApp,
      hasReactNativeWebView: typeof window !== "undefined" && !!(window as any).ReactNativeWebView,
      hasPostMessage: typeof window !== "undefined" && !!(window as any).ReactNativeWebView?.postMessage,
    });
    
    if (isInApp) {
      if (
        typeof window !== "undefined" &&
        (window as any).ReactNativeWebView?.postMessage
      ) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify(payload));
        console.log("[Membership] postMessage 전송:", payload);
      } else {
        console.warn("[Membership] ReactNativeWebView.postMessage 없음 – WebView 내 앱이 아닐 수 있음");
      }
    } else {
      console.log("[Membership] 웹 브라우저 모드 – 결제는 앱 내에서만 가능");
    }
  };

  const handleSelectPlan = (plan: PlanType) => () => {
    setSelectedPlan(plan);
    setIsCtaVisible(true);
  };

  const handleRestorePurchases = () => {
    if (isInApp && typeof window !== "undefined" && (window as any).ReactNativeWebView?.postMessage) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: "RESTORE" }));
    } else {
      // 웹 브라우저: 구입 내역 복원은 앱 내에서만 가능
      console.log("[Membership] 구입 내역 복원은 앱 내에서만 가능합니다.");
    }
  };

  const privacyPolicy = policies?.find(
    (p) =>
      p.name?.includes("개인정보") ||
      p.title?.includes("개인정보처리방침") ||
      p.type === "privacy"
  );
  const termsPolicy = policies?.find(
    (p) =>
      p.name?.includes("이용약관") ||
      p.title?.includes("이용약관") ||
      p.type === "terms"
  );
  const selectedPlanInfo = PLANS[selectedPlan];
  const subscriptionPeriodLabel =
    selectedPlan === "annual"
      ? "1년 · 주간/월간 리포트, 인사이트, 균형 분석"
      : "1개월 · 주간/월간 리포트, 인사이트, 균형 분석";
  const subscriptionPriceLabel = `₩${selectedPlanInfo.price.toLocaleString("ko-KR")} / ${selectedPlanInfo.period}`;

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-72 pt-14`}
    >
      <MembershipHeader />

      <div className="-mx-4 sm:-mx-6 mb-8">
        <LazyMembershipImage src={img0} alt="VIVID 프로 멤버십" priority />
      </div>

      <div className="flex flex-col gap-3 mb-12">
        <PlanSelectionCard
          plan={PLANS.annual}
          isSelected={selectedPlan === "annual"}
          onSelect={handleSelectPlan("annual")}
        />
        <PlanSelectionCard
          plan={PLANS.monthly}
          isSelected={selectedPlan === "monthly"}
          onSelect={handleSelectPlan("monthly")}
        />
      </div>

      <div className="space-y-12">
        <section
          className="relative overflow-visible rounded-2xl p-5 sm:p-6"
          style={{
            background: `linear-gradient(180deg, ${COLORS.background.cardElevated} 0%, ${COLORS.primary[50]} 100%)`,
            border: `1px solid ${COLORS.primary[200]}`,
            boxShadow: "0 1px 3px rgba(43, 43, 43, 0.04)",
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ backgroundColor: COLORS.brand.primary }}
          />
          <div className="pl-4 sm:pl-5">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-6">
              <div className="flex flex-col gap-3">
                <div
                  className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: COLORS.primary[100],
                    color: COLORS.brand.primary,
                    border: `1px solid ${COLORS.primary[200]}`,
                  }}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p
                    className={cn(
                      TYPOGRAPHY.label.fontSize,
                      TYPOGRAPHY.label.fontWeight,
                      TYPOGRAPHY.label.letterSpacing,
                      "uppercase"
                    )}
                    style={{ color: COLORS.brand.primary }}
                  >
                    3가지 인사이트 영역
                  </p>
                  <h2
                    className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
                    style={{ color: COLORS.text.primary }}
                  >
                    {membershipPreviewCopy.heroTitle}
                  </h2>
                </div>
              </div>
              <div className="sm:pt-0 min-w-0">
                <p
                  className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                  style={{ color: COLORS.text.secondary }}
                >
                  {membershipPreviewCopy.heroDescription}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 pt-5 pl-1">
              {[
                {
                  label: "주간/월간 VIVID 종합 리포트",
                  icon: BarChart3,
                },
                {
                  label: "한눈에 보는 성장 인사이트",
                  icon: Brain,
                },
                {
                  label: "삶의 균형 분석",
                  icon: PieChart,
                },
              ].map(({ label, icon: Icon }, index) => (
                <div
                  key={label}
                  className="relative flex items-center gap-4 rounded-xl p-4 overflow-visible"
                  style={{
                    backgroundColor: COLORS.background.cardElevated,
                    border: `1px solid ${COLORS.border.light}`,
                    boxShadow: `0 1px 2px rgba(0,0,0,0.04)`,
                  }}
                >
                  <span
                    className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full font-semibold tabular-nums text-xs shadow-sm"
                    style={{
                      backgroundColor: COLORS.brand.primary,
                      color: COLORS.text.white,
                      boxShadow: "0 1px 3px rgba(43, 43, 43, 0.15)",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: COLORS.primary[100],
                      color: COLORS.brand.primary,
                      border: `1px solid ${COLORS.primary[200]}`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p
                    className={cn(
                      TYPOGRAPHY.body.fontSize,
                      TYPOGRAPHY.body.fontWeight,
                      "leading-snug"
                    )}
                    style={{ color: COLORS.text.primary }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MembershipSection
          icon={BarChart3}
          iconColor={COLORS.brand.primary}
          eyebrow="Benefit 01"
          title={membershipPreviewCopy.weeklyMonthlyTitle}
          description={membershipPreviewCopy.weeklyMonthlyDescription}
          accentColor={COLORS.brand.primary}
          accentLight={COLORS.primary[50]}
          accentBorder={COLORS.primary[200]}
        >
          <div className="grid gap-8 xl:grid-cols-2">
            <MembershipWeeklyKeywordsPreview
              weeklyKeywordsAnalysis={membershipWeeklyKeywordsPreview}
            />
            <MembershipMonthlyCoreVisionsPreview
              visionEvolution={membershipMonthlyVisionPreview}
            />
          </div>
        </MembershipSection>

        <MembershipSection
          icon={Brain}
          iconColor={COLORS.brand.primary}
          eyebrow="Benefit 02"
          title={membershipPreviewCopy.growthTitle}
          description={membershipPreviewCopy.growthDescription}
          accentColor={COLORS.brand.primary}
          accentLight={COLORS.primary[50]}
          accentBorder={COLORS.primary[200]}
        >
          <GrowthInsightsSection
            growth_insights={membershipGrowthInsightsPreview}
            identity={membershipIdentityPreview}
            patterns={membershipPatternsPreview}
            isLocked={false}
            hasRealData={true}
            scrollAnimated
          />
        </MembershipSection>

        <MembershipSection
          icon={PieChart}
          iconColor={COLORS.brand.primary}
          eyebrow="Benefit 03"
          title={membershipPreviewCopy.balanceTitle}
          description={membershipPreviewCopy.balanceDescription}
          accentColor={COLORS.brand.primary}
          accentLight={COLORS.primary[50]}
          accentBorder={COLORS.primary[200]}
        >
          <MembershipTodoBalancePreview
            completedTodosInsights={membershipTodoBalancePreview}
          />
        </MembershipSection>

        <ScrollAnimation delay={150}>
          <section
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6 space-y-5"
            style={{
              background: `linear-gradient(180deg, ${COLORS.background.cardElevated} 0%, ${COLORS.primary[50]} 100%)`,
              border: `1px solid ${COLORS.primary[200]}`,
              boxShadow: "0 1px 3px rgba(67, 45, 45, 0.04)",
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ backgroundColor: COLORS.brand.primary }}
            />
            <div className="pl-4 sm:pl-5">
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-6">
                <div className="flex flex-col gap-3">
                  <div
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: COLORS.primary[100],
                      color: COLORS.brand.primary,
                      border: `1px solid ${COLORS.primary[200]}`,
                    }}
                  >
                    <MessageSquareQuote className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        TYPOGRAPHY.label.fontSize,
                        TYPOGRAPHY.label.fontWeight,
                        TYPOGRAPHY.label.letterSpacing,
                        "uppercase"
                      )}
                      style={{ color: COLORS.brand.primary }}
                    >
                      실제 사용자 후기
                    </p>
                    <h2
                      className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)}
                      style={{ color: COLORS.text.primary }}
                    >
                      {membershipPreviewCopy.reviewsTitle}
                    </h2>
                  </div>
                </div>
                <div className="sm:pt-0 min-w-0">
                  <p
                    className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                    style={{ color: COLORS.text.secondary }}
                  >
                    {membershipPreviewCopy.reviewsDescription}
                  </p>
                </div>
              </div>
            </div>
            <div className="pl-4 sm:pl-5 pt-1">
              <MembershipReviewsSection />
            </div>
          </section>
        </ScrollAnimation>
      </div>

      <div className="mt-12 flex flex-col gap-3">
        <PlanSelectionCard
          plan={PLANS.annual}
          isSelected={selectedPlan === "annual"}
          onSelect={handleSelectPlan("annual")}
        />
        <PlanSelectionCard
          plan={PLANS.monthly}
          isSelected={selectedPlan === "monthly"}
          onSelect={handleSelectPlan("monthly")}
        />
      </div>

      

      {/* 플로팅 CTA - 바텀 네비 위 */}
      <div
        className="fixed left-0 right-0 z-[99] px-4 pb-2 transition-all duration-300"
        style={{
          bottom: "12px",
          opacity: isCtaVisible ? 1 : 0,
          transform: isCtaVisible ? "translateY(0)" : "translateY(16px)",
          pointerEvents: isCtaVisible ? "auto" : "none",
        }}
      >
        <div
          className={`${SPACING.page.maxWidthNarrow} mx-auto rounded-2xl p-4 space-y-3`}
          style={{
            backgroundColor: hexToRgba(COLORS.background.base, 0.95),
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${COLORS.border.light}`,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <button
            type="button"
            onClick={handleStartNow}
            className="w-full py-4 rounded-2xl font-semibold text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              backgroundColor: PLAN_ACCENT_COLORS[selectedPlan],
              color: COLORS.text.white,
              boxShadow: `0 8px 24px ${hexToRgba(PLAN_ACCENT_COLORS[selectedPlan], 0.4)}`,
            }}
          >
            <span>지금 시작하기</span>
            <span className="text-sm font-normal opacity-90">
              ({selectedPlanInfo.title}{" "}
              {selectedPlanInfo.discount ? `-${selectedPlanInfo.discount}%` : ""})
            </span>
          </button>

          <div
            className="rounded-2xl px-4 py-3.5"
            style={{
              backgroundColor: hexToRgba(COLORS.background.cardElevated, 0.92),
              backdropFilter: "blur(12px)",
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            <div
              className={cn("flex flex-col gap-2.5", TYPOGRAPHY.caption.fontSize)}
              style={{ color: COLORS.text.secondary }}
            >
              <div className="flex justify-between items-start gap-3">
                <span className="shrink-0" style={{ color: COLORS.text.tertiary }}>서비스</span>
                <span className="text-right min-w-0" style={{ color: COLORS.text.primary }}>{selectedPlanInfo.title}</span>
              </div>
              <div className="flex justify-between items-start gap-3">
                <span className="shrink-0" style={{ color: COLORS.text.tertiary }}>구독 기간</span>
                <span className="text-right min-w-0" style={{ color: COLORS.text.primary }}>{subscriptionPeriodLabel}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="shrink-0" style={{ color: COLORS.text.tertiary }}>가격</span>
                <span className="text-right" style={{ color: COLORS.text.primary }}>{subscriptionPriceLabel}</span>
              </div>
              <div
                className="flex items-center justify-between gap-3 pt-1 mt-1"
                style={{ borderTop: `1px solid ${COLORS.border.light}` }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {termsPolicy ? (
                    <Link
                      href={`/policy/${termsPolicy.id}`}
                      className="transition-opacity hover:opacity-70 shrink-0"
                      style={{ color: COLORS.brand.primary }}
                    >
                      이용약관
                    </Link>
                  ) : (
                    <span>이용약관</span>
                  )}
                  <span style={{ color: COLORS.border.light }}>·</span>
                  {privacyPolicy ? (
                    <Link
                      href={`/policy/${privacyPolicy.id}`}
                      className="transition-opacity hover:opacity-70 shrink-0"
                      style={{ color: COLORS.brand.primary }}
                    >
                      개인정보 처리방침
                    </Link>
                  ) : (
                    <span>개인정보 처리방침</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRestorePurchases}
                  className={cn("flex items-center gap-1 py-1 px-2 rounded-md transition-all hover:opacity-80 shrink-0", TYPOGRAPHY.caption.fontSize)}
                  style={{ color: COLORS.text.tertiary }}
                >
                  <RotateCcw className="w-3 h-3" style={{ color: COLORS.text.tertiary }} />
                  <span>구입 내역 복원</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">로딩 중...</div>}>
      <MembershipPageContent />
    </Suspense>
  );
}
