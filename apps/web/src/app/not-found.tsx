"use client";

import { Home, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLORS, TYPOGRAPHY, SHADOWS } from "@/lib/design-system";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 w-full py-20"
      style={{ backgroundColor: COLORS.background.base }}
      data-not-found-page
    >
      {/* 애니메이션 배경 요소 */}

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* 아이콘 컨테이너 */}
        <div className="relative mb-8">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand.light}20 0%, ${COLORS.brand.secondary}20 100%)`,
              border: `2px solid ${COLORS.brand.light}40`,
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: `linear-gradient(135deg, ${COLORS.brand.light}10 0%, ${COLORS.brand.secondary}10 100%)`,
                animationDuration: "2s",
              }}
            />
            <SearchX
              className="w-16 h-16 relative z-10"
              style={{ color: COLORS.brand.primary }}
            />
          </div>
        </div>

        {/* 404 숫자 */}
        <div className="mb-4 text-center">
          <h1
            className="text-7xl font-bold tracking-tight mx-auto"
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand.primary} 0%, ${COLORS.brand.secondary} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </h1>
        </div>

        {/* 제목 */}
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight} mb-3 text-center`}
          style={{ color: COLORS.text.primary }}
        >
          페이지를 찾을 수 없습니다
        </h2>

        {/* 설명 */}
        <p
          className={`${TYPOGRAPHY.body.fontSize} mb-10 text-center leading-relaxed`}
          style={{ color: COLORS.text.secondary }}
        >
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있습니다.
        </p>

        {/* 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/" className="flex-1">
            <Button
              className="w-full rounded-xl transition-all duration-300 hover:scale-[1.02] h-12"
              style={{
                backgroundColor: COLORS.brand.primary,
                color: COLORS.text.white,
                fontWeight: "600",
                padding: "0.875rem 1.5rem",
                boxShadow: SHADOWS.md,
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 이동
            </Button>
          </Link>
          <Button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            variant="outline"
            className="flex-1 rounded-xl transition-all duration-300 hover:scale-[1.02] h-12"
            style={{
              color: COLORS.text.secondary,
              borderColor: COLORS.border.input,
              backgroundColor: COLORS.background.card,
              fontWeight: "500",
              padding: "0.875rem 1.5rem",
              boxShadow: SHADOWS.sm,
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지
          </Button>
        </div>
      </div>
    </div>
  );
}
