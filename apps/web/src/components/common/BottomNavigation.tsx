"use client";

import { Home as HomeIcon, BarChart3, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { shouldShowBottomNav } from "@/lib/navigation";
import { useEffect, useState, useRef } from "react";
import { COLORS, GRADIENT_UTILS, SHADOWS } from "@/lib/design-system";

export function BottomNavigation() {
  const pathname = usePathname();
  const [isErrorPage, setIsErrorPage] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // 에러 페이지나 404 페이지 감지
    const checkErrorPage = () => {
      // document에 에러나 404 관련 요소가 있는지 확인
      const hasErrorContent =
        document.querySelector("[data-error-page]") !== null;
      const hasNotFoundContent =
        document.querySelector("[data-not-found-page]") !== null;
      setIsErrorPage(hasErrorContent || hasNotFoundContent);
    };

    checkErrorPage();
    // DOM 변경 감지를 위한 MutationObserver
    const observer = new MutationObserver(checkErrorPage);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // 스크롤 이벤트 핸들러 (모든 페이지에서 동작)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10; // 최상단 판단 임계값
      const scrollDelta = 5; // 스크롤 방향 감지를 위한 최소 변화량

      // 최상단 여부 확인
      setIsAtTop(currentScrollY < scrollThreshold);

      // 스크롤 방향 확인 (최소 변화량 이상일 때만)
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      if (scrollDifference > scrollDelta && currentScrollY > scrollThreshold) {
        // 아래로 스크롤 중 (임계값 이상)
        setIsScrolledDown(true);
      } else if (scrollDifference < -scrollDelta) {
        // 위로 스크롤 중
        setIsScrolledDown(false);
      }

      lastScrollY.current = currentScrollY;
    };

    // 초기 스크롤 위치 설정
    lastScrollY.current = window.scrollY;
    setIsAtTop(window.scrollY < 10);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isVisible = shouldShowBottomNav(pathname ?? "") && !isErrorPage;

  if (!isVisible) {
    return null;
  }

  // 스크롤 애니메이션 적용
  const shouldHide = isScrolledDown && !isAtTop;

  // 내정보 관련 페이지 경로 목록
  const myInfoRelatedPaths = [
    "/my-info",
    "/coupon/register",
    "/faq",
    "/membership",
    "/improvement",
  ];

  const navItems = [
    {
      href: "/",
      icon: HomeIcon,
      label: "작성하기",
      isActive:
        pathname === "/" || pathname?.match(/^\/(\d{4}-\d{2}-\d{2})$/) !== null,
    },
    {
      href: "/reports",
      icon: BarChart3,
      label: "리포트",
      isActive: pathname?.startsWith("/reports") ?? false,
    },
    {
      href: "/my-info",
      icon: User,
      label: "내정보",
      isActive:
        myInfoRelatedPaths.some((path) => pathname?.startsWith(path)) ?? false,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(250, 250, 248, 0.96)",
        borderColor: GRADIENT_UTILS.borderColor(COLORS.brand.light, "35"),
        borderTopWidth: "1.5px",
        boxShadow: SHADOWS.lg,
        overflow: "hidden",
        zIndex: 100,
        transform: shouldHide ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: GRADIENT_UTILS.cardBackground(COLORS.brand.primary, 0.14, "rgba(250, 250, 248, 0.98)"),
        backgroundImage: `
          linear-gradient(135deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.2) 100%),
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 25px,
            rgba(127, 143, 122, 0.05) 25px,
            rgba(127, 143, 122, 0.05) 26px
          ),
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(127, 143, 122, 0.018) 2px,
            rgba(127, 143, 122, 0.018) 4px
          )
        `,
        backgroundSize: "100% 100%, 100% 26px, 8px 8px",
        backgroundPosition: "0 0, 0 2px, 0 0",
        filter: "contrast(1.01) brightness(1.01)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18) 0%, transparent 42%),
            radial-gradient(circle at 75% 75%, rgba(127, 143, 122, 0.12) 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.65,
        }}
      />
      <div className="max-w-2xl mx-auto px-2 relative z-10">
        <div className="grid grid-cols-3 gap-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-all active:scale-95"
                style={{
                  background: item.isActive
                    ? GRADIENT_UTILS.cardBackground(COLORS.brand.primary, 0.88, COLORS.brand.primary)
                    : "transparent",
                  color: item.isActive ? COLORS.text.white : COLORS.brand.secondary,
                  border: item.isActive
                    ? `1px solid ${GRADIENT_UTILS.borderColor(COLORS.brand.primary, "55")}`
                    : "1px solid transparent",
                  boxShadow: item.isActive ? SHADOWS.default : "none",
                }}
              >
                <Icon className="w-5 h-5" />
                <span style={{ fontSize: "0.7rem" }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
