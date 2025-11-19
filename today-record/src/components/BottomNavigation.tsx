"use client";

import { Home as HomeIcon, Clock, BarChart3 } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { shouldShowBottomNav } from "@/lib/navigation";

export function BottomNavigation() {
  const pathname = usePathname();
  const isVisible = shouldShowBottomNav(pathname ?? "");

  if (!isVisible) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      icon: HomeIcon,
      label: "작성하기",
      isActive: pathname === "/",
    },
    {
      href: "/logs",
      icon: Clock,
      label: "지난 기록",
      isActive: pathname === "/logs",
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
      className="fixed bottom-0 left-0 right-0 border-t safe-area-bottom"
      style={{
        backgroundColor: "#FAFAF8",
        borderColor: "#EFE9E3",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div className="max-w-2xl mx-auto px-2">
        <div className="grid grid-cols-3 gap-1 py-2">
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
