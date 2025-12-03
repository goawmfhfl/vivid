"use client";

import { User, LogOut, Settings, Cog, Crown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { COLORS, TYPOGRAPHY, TRANSITIONS } from "@/lib/design-system";
import { queryClient } from "@/app/providers";
import { clearAllCache } from "@/lib/cache-utils";
import { useState } from "react";
import { SystemSettingsModal } from "./SystemSettingsModal";
import { useSubscription } from "@/hooks/useSubscription";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const { isPro } = useSubscription();

  const handleLogout = async () => {
    try {
      // 로그아웃 전에 모든 캐시 클리어
      clearAllCache(queryClient);
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <>
      <header className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1
              className={`mb-1 ${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
              style={{ color: COLORS.text.primary }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={TYPOGRAPHY.body.fontSize}
                style={{
                  color: COLORS.text.secondary,
                  opacity: 0.7,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 시스템 설정 버튼 */}
            <button
              onClick={() => setShowSystemSettings(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TRANSITIONS.colors} focus:outline-none focus:ring-0 relative overflow-hidden`}
              style={{
                backgroundColor: COLORS.background.base,
                border: `1px solid ${COLORS.border.light}`,
                boxShadow: `
                  0 1px 3px rgba(0,0,0,0.08),
                  0 1px 2px rgba(0,0,0,0.04),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                // 종이 질감 배경 패턴
                backgroundImage: `
                  /* 가로 줄무늬 */
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
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `
                  0 2px 6px rgba(0,0,0,0.12),
                  0 1px 3px rgba(0,0,0,0.06),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `
                  0 1px 3px rgba(0,0,0,0.08),
                  0 1px 2px rgba(0,0,0,0.04),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* 종이 질감 오버레이 */}
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  background: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                    radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
                  `,
                  mixBlendMode: "overlay",
                  opacity: 0.5,
                }}
              />
              <Cog
                className="w-3.5 h-3.5 relative z-10"
                style={{ color: COLORS.brand.primary }}
              />
            </button>

            {/* 프로필 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TRANSITIONS.colors} focus:outline-none focus:ring-0 relative overflow-hidden`}
                  style={{
                    backgroundColor: COLORS.background.base,
                    border: `1px solid ${COLORS.border.light}`,
                    boxShadow: `
                      0 1px 3px rgba(0,0,0,0.08),
                      0 1px 2px rgba(0,0,0,0.04),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `,
                    // 종이 질감 배경 패턴
                    backgroundImage: `
                      /* 가로 줄무늬 */
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `
                      0 2px 6px rgba(0,0,0,0.12),
                      0 1px 3px rgba(0,0,0,0.06),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `
                      0 1px 3px rgba(0,0,0,0.08),
                      0 1px 2px rgba(0,0,0,0.04),
                      inset 0 1px 0 rgba(255,255,255,0.6)
                    `;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* 종이 질감 오버레이 */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-full"
                    style={{
                      background: `
                        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                        radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
                      `,
                      mixBlendMode: "overlay",
                      opacity: 0.5,
                    }}
                  />
                  <div className="flex items-center gap-1.5 relative z-10">
                    <div className="relative">
                      <User
                        className="w-3.5 h-3.5"
                        style={{ color: COLORS.brand.primary }}
                      />
                      {isPro && (
                        <Crown
                          className="absolute"
                          style={{
                            top: "-6px",
                            right: "-6px",
                            width: "12px",
                            height: "12px",
                            color: "#FBBF24",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                            zIndex: 20,
                            strokeWidth: 2.5,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[160px] relative overflow-hidden"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1px solid ${COLORS.border.light}`,
                  boxShadow: `
                    0 4px 16px rgba(0,0,0,0.12),
                    0 2px 8px rgba(0,0,0,0.08),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                  // 종이 질감 배경 패턴
                  backgroundImage: `
                    /* 가로 줄무늬 */
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
                  className="absolute inset-0 pointer-events-none rounded-lg"
                  style={{
                    background: `
                      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
                      radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
                    `,
                    mixBlendMode: "overlay",
                    opacity: 0.5,
                  }}
                />
                <div className="relative z-10">
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className={`focus:outline-none cursor-pointer ${TRANSITIONS.colors} relative z-10`}
                    style={{
                      color: "#333333",
                      padding: "0.625rem 1rem",
                      fontSize: TYPOGRAPHY.body.fontSize.replace("text-", ""),
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        COLORS.background.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Settings
                      className="w-4 h-4 mr-2"
                      style={{ color: "#6B7A6F" }}
                    />
                    프로필 설정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className={`focus:outline-none cursor-pointer ${TRANSITIONS.colors} relative z-10`}
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
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <LogOut
                      className="w-4 h-4 mr-2"
                      style={{ color: COLORS.status.error }}
                    />
                    로그아웃
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* 시스템 설정 모달 */}
      <SystemSettingsModal
        isOpen={showSystemSettings}
        onClose={() => setShowSystemSettings(false)}
      />
    </>
  );
}
