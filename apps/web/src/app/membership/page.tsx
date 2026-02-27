"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LazyMembershipImage } from "@/components/membership/LazyMembershipImage";
import { useNotionPolicies } from "@/hooks/useNotionPolicies";
import { supabase } from "@/lib/supabase";
import { COLORS, SPACING } from "@/lib/design-system";
import { RotateCcw, ArrowLeft } from "lucide-react";

import img0 from "@/assets/membership/0.png";
import img1 from "@/assets/membership/1.png";
import img2 from "@/assets/membership/2.png";
import img3 from "@/assets/membership/3.png";
import img4 from "@/assets/membership/4.png";
import img5 from "@/assets/membership/5.png";
import img6 from "@/assets/membership/6.png";
import img7 from "@/assets/membership/7.png";
import img8 from "@/assets/membership/8.png";

const MEMBERSHIP_IMAGES = [
  { src: img1, alt: "프로 멤버십 1" },
  { src: img2, alt: "프로 멤버십 2" },
  { src: img3, alt: "프로 멤버십 3" },
  { src: img4, alt: "프로 멤버십 4" },
  { src: img5, alt: "프로 멤버십 5" },
  { src: img6, alt: "프로 멤버십 6" },
  { src: img7, alt: "프로 멤버십 7" },
  { src: img8, alt: "프로 멤버십 8" },
];

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
    title: "연간",
    price: 25000,
    originalPrice: 30000,
    period: "년",
    discount: 20,
    description: "연마다 결제",
  },
  monthly: {
    id: "monthly",
    title: "월간",
    price: 2500,
    period: "월",
    description: "월마다 결제",
  },
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full relative overflow-hidden text-left transition-all duration-300"
      style={{
        backgroundColor: isSelected
          ? COLORS.brand.primary
          : COLORS.background.card,
        border: `2px solid ${
          isSelected ? COLORS.brand.primary : COLORS.border.light
        }`,
        borderRadius: "16px",
        padding: "20px",
        color: isSelected ? COLORS.text.white : COLORS.text.primary,
      }}
    >
      {plan.discount && (
        <div
          className="absolute top-0 left-0 px-3 py-1 text-xs font-bold rounded-br-xl"
          style={{
            backgroundColor: isSelected ? "#FFFFFF" : COLORS.brand.primary,
            color: isSelected ? COLORS.brand.primary : COLORS.text.white,
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
          <span className="text-lg font-bold">{plan.title}</span>
        </div>
        <span className="text-lg font-bold">{displayPrice}</span>
      </div>

      <div className="flex items-center justify-between pl-8">
        <span
          className="text-sm"
          style={{
            color: isSelected ? "rgba(255,255,255,0.8)" : COLORS.text.secondary,
          }}
        >
          {plan.description}
        </span>
        {plan.originalPrice && (
          <span
            className="text-sm line-through"
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 h-[56px] flex items-center bg-transparent">
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
  const { data: policies } = useNotionPolicies();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");

  // embed=1은 라우팅 시 사라지므로, WebView 내 여부는 ReactNativeWebView 존재로 판단
  const isInApp =
    typeof window !== "undefined" &&
    !!(window as { ReactNativeWebView?: { postMessage?: unknown } })
      .ReactNativeWebView;

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

  const handleRestorePurchases = () => {
    // TODO: Apple 구입 내역 복원 API 연결
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

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-32 pt-14`}
    >
      <MembershipHeader />

      {/* 최상단 이미지 (img0) */}
      <div className="mb-4">
        <LazyMembershipImage
          src={img0}
          alt="프로 멤버십 소개"
          priority={true}
        />
      </div>

      <div className="flex flex-col gap-3">
        <PlanSelectionCard
          plan={PLANS.annual}
          isSelected={selectedPlan === "annual"}
          onSelect={() => setSelectedPlan("annual")}
        />
        <PlanSelectionCard
          plan={PLANS.monthly}
          isSelected={selectedPlan === "monthly"}
          onSelect={() => setSelectedPlan("monthly")}
        />
      </div>

      {/* 이미지 목록 (lazy loading) */}
      <div className="flex flex-col mt-4" style={{ gap: 120 }}>
        {MEMBERSHIP_IMAGES.map((img, idx) => (
          <LazyMembershipImage
            key={idx}
            src={img.src}
            alt={img.alt}
            priority={false}
          />
        ))}
      </div>

      {/* 하단 플랜 선택 */}
      <div className="mt-12 flex flex-col gap-3">
        <PlanSelectionCard
          plan={PLANS.annual}
          isSelected={selectedPlan === "annual"}
          onSelect={() => setSelectedPlan("annual")}
        />
        <PlanSelectionCard
          plan={PLANS.monthly}
          isSelected={selectedPlan === "monthly"}
          onSelect={() => setSelectedPlan("monthly")}
        />
      </div>

      {/* Apple 정책 영역 */}
      <div className="mt-6 pb-8 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          {privacyPolicy ? (
            <Link
              href={`/policy/${privacyPolicy.id}`}
              className="hover:text-gray-600 transition-colors"
            >
              개인정보 처리방침
            </Link>
          ) : (
            <span>개인정보 처리방침</span>
          )}
          <span className="text-gray-300 text-[9px]">|</span>
          {termsPolicy ? (
            <Link
              href={`/policy/${termsPolicy.id}`}
              className="hover:text-gray-600 transition-colors"
            >
              이용 약관
            </Link>
          ) : (
            <span>이용 약관</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleRestorePurchases}
          className="flex items-center gap-1 py-1 px-2 rounded-md text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>구입 내역 복원</span>
        </button>
      </div>

      {/* 플로팅 CTA - 바텀 네비 위 */}
      <div
        className="fixed left-0 right-0 z-[99] px-4 pb-2"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        }}
      >
        <div className={`${SPACING.page.maxWidthNarrow} mx-auto`}>
          <button
            type="button"
            onClick={handleStartNow}
            className="w-full py-4 rounded-2xl font-semibold text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
              boxShadow: "0 8px 24px rgba(127, 143, 122, 0.4)",
            }}
          >
            <span>지금 시작하기</span>
            <span className="text-sm font-normal opacity-90">
              ({PLANS[selectedPlan].title} {PLANS[selectedPlan].discount ? `-${PLANS[selectedPlan].discount}%` : ""})
            </span>
          </button>
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
