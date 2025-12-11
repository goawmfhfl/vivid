"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-system";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: "대시보드",
    href: "/admin",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    title: "유저 관리",
    href: "/admin/users",
    icon: Users,
    enabled: true,
  },
  {
    title: "AI 사용량",
    href: "/admin/ai-usage",
    icon: BarChart3,
    enabled: true,
  },
  {
    title: "구독 관리",
    href: "/admin/subscriptions",
    icon: CreditCard,
    enabled: true,
  },
  {
    title: "콘텐츠 통계",
    href: "/admin/content",
    icon: FileText,
    enabled: true,
  },
  {
    title: "시스템 설정",
    href: "/admin/settings",
    icon: Settings,
    enabled: false, // 비활성화
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* 로고/제목 */}
      <div
        className="px-6 py-5 border-b"
        style={{
          borderColor: COLORS.border.light,
          background: `linear-gradient(135deg, ${COLORS.background.card} 0%, ${COLORS.background.hoverLight} 100%)`,
        }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: COLORS.brand.primary }}
        >
          관리자 페이지
        </h1>
        <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
          Grit Admin
        </p>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg cursor-not-allowed opacity-50"
                )}
                style={{
                  color: COLORS.text.muted,
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
                <span
                  className="ml-auto text-xs"
                  style={{ color: COLORS.text.tertiary }}
                >
                  준비중
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive ? "font-semibold" : "hover:bg-opacity-50"
              )}
              style={{
                backgroundColor: isActive
                  ? COLORS.brand.light + "30"
                  : "transparent",
                color: isActive ? COLORS.brand.primary : COLORS.text.secondary,
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{
          backgroundColor: COLORS.background.card,
          border: `1px solid ${COLORS.border.light}`,
        }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" style={{ color: COLORS.text.primary }} />
        ) : (
          <Menu className="w-6 h-6" style={{ color: COLORS.text.primary }} />
        )}
      </button>

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex-shrink-0 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        style={{
          backgroundColor: COLORS.background.card,
          borderRight: `1px solid ${COLORS.border.light}`,
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
