"use client";

import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { COLORS, TYPOGRAPHY, SHADOWS, TRANSITIONS } from "@/lib/design-system";

export function HomeHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1
            className={`mb-1 ${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
            style={{ color: COLORS.text.primary }}
          >
            오늘의 기록
          </h1>
          <p
            className={TYPOGRAPHY.body.fontSize}
            style={{
              color: COLORS.text.secondary,
              opacity: 0.7,
            }}
          >
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TRANSITIONS.colors} focus:outline-none focus:ring-0`}
                style={{
                  backgroundColor: COLORS.background.hover,
                  border: `1px solid ${COLORS.border.light}`,
                }}
              >
                <User
                  className="w-3.5 h-3.5"
                  style={{ color: COLORS.brand.primary }}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[160px]"
              style={{
                backgroundColor: COLORS.background.card,
                border: `1px solid ${COLORS.border.input}`,
                boxShadow: SHADOWS.md,
              }}
            >
              {/* <DropdownMenuItem
                className="focus:outline-none cursor-pointer transition-colors"
                style={{
                  color: "#333333",
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <Settings
                  className="w-4 h-4 mr-2"
                  style={{ color: "#6B7A6F" }}
                />
                설정
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={handleLogout}
                className={`focus:outline-none cursor-pointer ${TRANSITIONS.colors}`}
                style={{
                  color: COLORS.status.error,
                  padding: "0.625rem 1rem",
                  fontSize: TYPOGRAPHY.body.fontSize.replace("text-", ""),
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    COLORS.background.card;
                }}
              >
                <LogOut
                  className="w-4 h-4 mr-2"
                  style={{ color: COLORS.status.error }}
                />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
