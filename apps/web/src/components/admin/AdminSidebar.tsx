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
  },
  {
    title: "유저 관리",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "AI 사용량",
    href: "/admin/ai-usage",
    icon: BarChart3,
  },
  {
    title: "구독 관리",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    title: "콘텐츠 통계",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "시스템 설정",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* 로고/제목 */}
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: COLORS.border.light }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: COLORS.brand.primary }}
        >
          관리자 페이지
        </h1>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive ? "font-semibold" : "hover:bg-opacity-50"
              )}
              style={{
                backgroundColor: isActive ? COLORS.brand.light : "transparent",
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
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 transition-transform duration-300",
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
