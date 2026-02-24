"use client";

import type { LucideIcon } from "lucide-react";
import { User, LogOut, Settings, Crown, ChevronDown, ArrowLeft, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoginFullUrl } from "@/lib/navigation";
import { COLORS, TYPOGRAPHY, TRANSITIONS } from "@/lib/design-system";
import { queryClient } from "@/app/providers";
import { clearAllCache } from "@/lib/cache-utils";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DatePickerBottomSheet } from "./DatePickerBottomSheet";
import { getKSTDate } from "@/lib/date-utils";

interface AppHeaderProps {
  title: string;
  titleIcon?: LucideIcon;
  subtitle?: string;
  showDatePicker?: boolean;
  selectedDate?: string; // YYYY-MM-DD
  onDateSelect?: (date: string) => void;
  currentMonth?: { year: number; month: number }; // 현재 표시 중인 월
  recordDates?: string[]; // 기록이 있는 날짜 목록
  aiFeedbackDates?: string[]; // AI 피드백이 생성된 날짜 목록
  vividFeedbackDates?: string[]; // 비비드 AI 피드백이 생성된 날짜 목록
  reviewFeedbackDates?: string[]; // 회고 AI 피드백이 생성된 날짜 목록
  showBackButton?: boolean; // 뒤로 가기 버튼 표시 여부
  onBack?: () => void; // 뒤로 가기 버튼 클릭 핸들러
}

export function AppHeader({
  title,
  titleIcon: TitleIcon,
  subtitle,
  showDatePicker = false,
  selectedDate,
  onDateSelect,
  currentMonth,
  recordDates = [],
  aiFeedbackDates = [],
  vividFeedbackDates,
  reviewFeedbackDates = [],
  showBackButton = false,
  onBack,
}: AppHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDatePickerSheet, setShowDatePickerSheet] = useState(false);
  const { isPro } = useSubscription();
  const { data: user } = useCurrentUser();
  const isAdmin = user?.user_metadata?.role === "admin";

  // currentMonth가 제공되면 사용, 없으면 selectedDate 또는 오늘 날짜 사용
  const displayDate = currentMonth
    ? new Date(currentMonth.year, currentMonth.month - 1, 1)
    : selectedDate
    ? getKSTDate(new Date(selectedDate))
    : getKSTDate();
  const monthLabel = `${displayDate.getFullYear()}년 ${
    displayDate.getMonth() + 1
  }월`;

  const handleLogout = async () => {
    try {
      // 로그아웃 전에 모든 캐시 클리어
      clearAllCache(queryClient);
      await supabase.auth.signOut();
      // 현재 오리진으로 이동해 Expo Go에서 프로덕션으로 튕기지 않도록 함
      window.location.href = getLoginFullUrl(searchParams);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const effectiveVividFeedbackDates =
    vividFeedbackDates !== undefined ? vividFeedbackDates : aiFeedbackDates;

  return (
    <>
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2 relative">
          {/* 왼쪽: 어드민 버튼(관리자만) / 뒤로 가기 버튼 */}
          <div className="flex-shrink-0 flex items-center gap-1.5" style={{ width: isAdmin || showBackButton ? "auto" : "0px" }}>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all relative overflow-hidden group"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1.5px solid ${COLORS.border.light}`,
                  color: COLORS.text.primary,
                  boxShadow: `
                    0 1px 3px rgba(0,0,0,0.08),
                    0 1px 2px rgba(0,0,0,0.04),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.background.hover;
                  e.currentTarget.style.transform = "translateX(-2px)";
                  e.currentTarget.style.boxShadow = `
                    0 2px 6px rgba(0,0,0,0.12),
                    0 1px 3px rgba(0,0,0,0.06),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.background.base;
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = `
                    0 1px 3px rgba(0,0,0,0.08),
                    0 1px 2px rgba(0,0,0,0.04),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `;
                }}
                title="어드민 페이지로 이동"
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${COLORS.brand.light}15 0%, ${COLORS.brand.primary}15 100%)` }} />
                <Shield className="w-5 h-5 relative z-10 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-10 h-10 rounded-xl transition-all relative overflow-hidden group"
                style={{
                  backgroundColor: COLORS.background.base,
                  border: `1.5px solid ${COLORS.border.light}`,
                  color: COLORS.text.primary,
                  boxShadow: `
                    0 1px 3px rgba(0,0,0,0.08),
                    0 1px 2px rgba(0,0,0,0.04),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.background.hover;
                  e.currentTarget.style.transform = "translateX(-2px)";
                  e.currentTarget.style.boxShadow = `
                    0 2px 6px rgba(0,0,0,0.12),
                    0 1px 3px rgba(0,0,0,0.06),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.background.base;
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = `
                    0 1px 3px rgba(0,0,0,0.08),
                    0 1px 2px rgba(0,0,0,0.04),
                    inset 0 1px 0 rgba(255,255,255,0.6)
                  `;
                }}
              >
                {/* 배경 그라데이션 효과 */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.brand.light}15 0%, ${COLORS.brand.primary}15 100%)`,
                  }}
                />
                <ArrowLeft className="w-5 h-5 relative z-10 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}
          </div>

          {/* 중앙: 제목 */}
          <div className="flex-1 flex flex-col items-center justify-center text-center absolute left-0 right-0 pointer-events-none">
            {showDatePicker ? (
              <button
                onClick={() => setShowDatePickerSheet(true)}
                className="flex items-center gap-1.5 mb-2 pointer-events-auto"
                style={{ color: COLORS.text.primary }}
              >
                <span className="text-lg font-semibold">{monthLabel}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : (
              <h1
                className={`mb-1 flex items-center justify-center gap-1.5 ${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight}`}
                style={{ color: COLORS.text.primary }}
              >
                {TitleIcon && <TitleIcon className="w-5 h-5 flex-shrink-0" />}
                {title}
              </h1>
            )}
            {/* subtitle은 showDatePicker가 true일 때 표시하지 않음 */}
            {subtitle && !showDatePicker && (
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

          {/* 오른쪽: 프로필 버튼 */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2">
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
        </div>
      </header>

      {/* 날짜 선택 바텀 시트 */}
      {showDatePicker && (
        <DatePickerBottomSheet
          isOpen={showDatePickerSheet}
          onClose={() => setShowDatePickerSheet(false)}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          recordDates={recordDates}
          aiFeedbackDates={effectiveVividFeedbackDates}
          reviewFeedbackDates={reviewFeedbackDates}
        />
      )}
    </>
  );
}
