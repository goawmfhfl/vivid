"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { COLORS, TYPOGRAPHY, SHADOWS } from "@/lib/design-system";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (선택사항)
    console.error("Error:", error);
  }, [error]);

  const router = useRouter();

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 w-full py-20"
      style={{ backgroundColor: COLORS.background.base }}
      data-error-page
    >
      {/* 애니메이션 배경 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: `radial-gradient(circle, ${COLORS.status.error} 0%, transparent 70%)`,
            animationDuration: "4s",
            top: "50%",
            left: "50%",
            transform:
              "translate(-50%, -50%) translateX(-150px) translateY(-100px)",
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            background: `radial-gradient(circle, #F87171 0%, transparent 70%)`,
            animationDuration: "5s",
            animationDelay: "1s",
            top: "50%",
            left: "50%",
            transform:
              "translate(-50%, -50%) translateX(150px) translateY(100px)",
          }}
        />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* 아이콘 컨테이너 */}
        <div className="relative mb-8">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${COLORS.status.error}20 0%, #F8717120 100%)`,
              border: `2px solid ${COLORS.status.error}40`,
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: `linear-gradient(135deg, ${COLORS.status.error}10 0%, #F8717110 100%)`,
                animationDuration: "2s",
              }}
            />
            <AlertTriangle
              className="w-16 h-16 relative z-10"
              style={{ color: COLORS.status.error }}
            />
          </div>
        </div>

        {/* 에러 코드 스타일의 제목 */}
        <div className="mb-4 text-center">
          <h1
            className="text-6xl font-bold tracking-tight mx-auto"
            style={{
              background: `linear-gradient(135deg, ${COLORS.status.error} 0%, #F87171 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ERROR
          </h1>
        </div>

        {/* 제목 */}
        <h2
          className={`${TYPOGRAPHY.h2.fontSize} ${TYPOGRAPHY.h2.fontWeight} mb-3 text-center`}
          style={{ color: COLORS.text.primary }}
        >
          오류가 발생했습니다
        </h2>

        {/* 에러 메시지 */}
        <p
          className={`${TYPOGRAPHY.body.fontSize} mb-10 text-center leading-relaxed max-w-md`}
          style={{ color: COLORS.text.secondary }}
        >
          {error.message ||
            "예상치 못한 오류가 발생했습니다. 다시 시도해주세요."}
        </p>

        {/* 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={reset}
            className="flex-1 rounded-xl transition-all duration-300 hover:scale-[1.02] h-12"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
              fontWeight: "600",
              padding: "0.875rem 1.5rem",
              boxShadow: SHADOWS.md,
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
          <Button
            onClick={() => router.push("/")}
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
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>

        {/* 에러 ID */}
        {error.digest && (
          <p
            className={`${TYPOGRAPHY.bodySmall.fontSize} mt-8 text-center`}
            style={{ color: COLORS.text.muted }}
          >
            오류 ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
