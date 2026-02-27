"use client";

import dynamic from "next/dynamic";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";

const ErrorContent = dynamic(
  () => import("./error-client").then((mod) => mod.ErrorContent),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-4 py-20"
        style={{ backgroundColor: COLORS.background.base }}
        data-error-page
      >
        <div className="flex flex-col items-center max-w-md w-full text-center">
          <h1
            className="text-6xl font-bold mb-4"
            style={{ color: COLORS.status.error }}
          >
            ERROR
          </h1>
          <h2
            className={TYPOGRAPHY.h2.fontSize}
            style={{ color: COLORS.text.primary }}
          >
            오류가 발생했습니다
          </h2>
          <p
            className={`${TYPOGRAPHY.body.fontSize} mt-3`}
            style={{ color: COLORS.text.secondary }}
          >
            로딩 중...
          </p>
        </div>
      </div>
    ),
  }
);

/** 에러 바운더리 - prerender 시 useContext null 버그 회피 (Context 의존 컴포넌트는 ssr:false로 클라이언트 전용) */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent error={error} reset={reset} />;
}
