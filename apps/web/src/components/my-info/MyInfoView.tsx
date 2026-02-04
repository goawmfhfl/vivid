"use client";

import type { MouseEvent } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { useEnvironment } from "@/hooks/useEnvironment";
import {
  COLORS,
  TYPOGRAPHY,
  GRADIENT_UTILS,
  SHADOWS,
} from "@/lib/design-system";
import {
  User,
  Settings,
  ChevronRight,
  Crown,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MyInfoView() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { isPro } = useSubscription();
  const { isDevelopment } = useEnvironment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: COLORS.brand.primary }}
          ></div>
          <p style={{ color: COLORS.text.secondary }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p style={{ color: COLORS.status.error }}>
          사용자 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  const metadata = currentUser.user_metadata || {};
  const userName = (metadata.name as string) || "사용자";
  const userEmail = currentUser.email || "";

  const menuItems = [
    ...(isDevelopment
      ? [
          {
            title: "프로 멤버십",
            href: "/membership",
            enabled: true,
          },
        ]
      : []),
    {
      title: "쿠폰 등록",
      href: "/coupon/register",
      enabled: true,
    },
    {
      title: "자주 묻는 질문",
      href: "/faq",
      enabled: true,
    },
    {
      title: "문의사항 남기기",
      href: "/improvement",
      enabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 유저 정보 섹션 */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: GRADIENT_UTILS.cardBackground(COLORS.brand.light, 0.12),
          border: `1.5px solid ${GRADIENT_UTILS.borderColor(
            COLORS.brand.light,
            "25"
          )}`,
          boxShadow: SHADOWS.default,
        }}
      >
        {/* 배경 장식 */}
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none"
          style={{
            background: GRADIENT_UTILS.decoration(COLORS.brand.light, 0.8),
            borderRadius: "50%",
            transform: "translate(20%, -20%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: GRADIENT_UTILS.iconBadge(COLORS.brand.light, 0.2),
                boxShadow: `0 4px 12px ${COLORS.brand.light}40`,
              }}
            >
              <User
                className="w-8 h-8 sm:w-10 sm:h-10"
                style={{ color: COLORS.brand.primary }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className={cn(
                  TYPOGRAPHY.h2.fontSize,
                  TYPOGRAPHY.h2.fontWeight,
                  "mb-1 truncate"
                )}
                style={{ color: COLORS.text.primary }}
              >
                {userName}
              </h2>
              <p
                className="text-sm truncate"
                style={{ color: COLORS.text.secondary }}
              >
                {userEmail}
              </p>
            </div>
          </div>

          <Link href="/user">
            <button
              className="w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.primary}DD 100%)`,
                color: COLORS.text.white,
                boxShadow: `0 2px 8px ${COLORS.brand.primary}30`,
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                <span>프로필 수정</span>
              </div>
            </button>
          </Link>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: GRADIENT_UTILS.cardBackground(COLORS.background.card, 1),
          border: `1.5px solid ${COLORS.border.light}`,
          boxShadow: SHADOWS.default,
        }}
      >
        <div className="divide-y" style={{ borderColor: COLORS.border.light }}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;
            const isProMembership = item.title === "프로 멤버십";

            if (!item.enabled) {
              return (
                <button
                  key={item.href}
                  disabled
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{
                    borderBottom: !isLast
                      ? `1px solid ${COLORS.border.light}`
                      : "none",
                  }}
                >
                  <span
                    className="text-base font-medium"
                    style={{ color: COLORS.text.muted }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: COLORS.background.hover,
                      color: COLORS.text.tertiary,
                    }}
                  >
                    준비중
                  </span>
                </button>
              );
            }

            // 프로 멤버십 버튼은 특별한 스타일 적용
            if (isProMembership) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block relative overflow-hidden group"
                  style={{
                    borderBottom: !isLast
                      ? `1px solid ${COLORS.border.light}`
                      : "none",
                  }}
                >
                  {/* 그라디언트 배경 */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.brand.primary}15 0%, ${COLORS.brand.light}10 100%)`,
                    }}
                  />
                  
                  {/* 메인 컨텐츠 */}
                  <div className="relative z-10 px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Crown 아이콘 */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.secondary || COLORS.brand.primary} 100%)`,
                          boxShadow: `0 4px 12px ${COLORS.brand.primary}40`,
                        }}
                      >
                        <Crown
                          className="w-5 h-5"
                          style={{ color: COLORS.text.white }}
                        />
                      </div>
                      
                      {/* 텍스트 영역 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-base font-semibold"
                            style={{ color: COLORS.text.primary }}
                          >
                            {item.title}
                          </span>
                          {isPro && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.secondary || COLORS.brand.primary} 100%)`,
                                color: COLORS.text.white,
                                boxShadow: `0 2px 4px ${COLORS.brand.primary}30`,
                              }}
                            >
                              활성화됨
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: COLORS.text.secondary }}
                        >
                          {isPro
                            ? "주간 및 월간 VIVID 이용 중"
                            : "주간 및 월간 VIVID로 업그레이드"}
                        </p>
                      </div>
                    </div>
                    
                    {/* 오른쪽 아이콘 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isPro && (
                        <Sparkles
                          className="w-4 h-4"
                          style={{ color: COLORS.brand.primary }}
                        />
                      )}
                      <ChevronRight
                        className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                        style={{ color: COLORS.brand.primary }}
                      />
                    </div>
                  </div>
                  
                  {/* 장식 요소 */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: GRADIENT_UTILS.decoration(
                        COLORS.brand.primary,
                        0.8
                      ),
                      borderRadius: "50%",
                      transform: "translate(30%, -30%)",
                    }}
                  />
                </Link>
              );
            }

            // 일반 메뉴 아이템
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between transition-all duration-200 hover:bg-opacity-50 active:scale-[0.98]"
                style={{
                  backgroundColor: "transparent",
                  borderBottom: !isLast
                    ? `1px solid ${COLORS.border.light}`
                    : "none",
                }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor =
                    COLORS.background.hover;
                }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  className="text-base font-medium"
                  style={{ color: COLORS.text.primary }}
                >
                  {item.title}
                </span>
                <ChevronRight
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: COLORS.text.tertiary }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
