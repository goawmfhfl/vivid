"use client";

import { Home as HomeIcon, BarChart3 } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { shouldShowBottomNav } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { COLORS } from "@/lib/design-system";

export function BottomNavigation() {
  const pathname = usePathname();
  const [isErrorPage, setIsErrorPage] = useState(false);

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

  const isVisible = shouldShowBottomNav(pathname ?? "") && !isErrorPage;

  if (!isVisible) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      icon: HomeIcon,
      label: "작성하기",
      isActive:
        pathname === "/" || pathname?.match(/^\/(\d{4}-\d{2}-\d{2})$/) !== null,
    },
    {
      href: "/analysis",
      icon: BarChart3,
      label: "분석 & 요약",
      isActive: pathname?.startsWith("/analysis") ?? false,
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
        backgroundColor: "#FAFAF8",
        borderColor: COLORS.border.light,
        borderTopWidth: "1.5px",
        boxShadow: `
          0 -2px 10px rgba(0,0,0,0.05),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
        overflow: "hidden",
        zIndex: 100,
        // 종이 질감 배경 패턴
        backgroundImage: `
          /* 가로 줄무늬 (프로젝트 그린 톤) */
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            rgba(107, 122, 111, 0.08) 27px,
            rgba(107, 122, 111, 0.08) 28px
          ),
          /* 종이 텍스처 노이즈 */
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(107, 122, 111, 0.01) 2px,
            rgba(107, 122, 111, 0.01) 4px
          )
        `,
        backgroundSize: "100% 28px, 8px 8px",
        backgroundPosition: "0 2px, 0 0",
        filter: "contrast(1.02) brightness(1.01)",
      }}
    >
      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />
      <div className="max-w-2xl mx-auto px-2 relative z-10">
        <div className="grid grid-cols-2 gap-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-all active:scale-95"
                style={{
                  backgroundColor: item.isActive ? "#A8BBA8" : "transparent",
                  color: item.isActive ? "white" : "#6B7A6F",
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
