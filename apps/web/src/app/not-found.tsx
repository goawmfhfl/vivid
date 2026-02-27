import dynamic from "next/dynamic";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";

const NotFoundClient = dynamic(
  () =>
    import("./not-found-client").then((mod) => mod.NotFoundClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex flex-col items-center justify-center min-h-screen px-4 py-20"
        style={{ backgroundColor: COLORS.background.base }}
        data-not-found-page
      >
        <div className="flex flex-col items-center max-w-md w-full text-center">
          <h1
            className="text-7xl font-bold mb-4"
            style={{ color: COLORS.brand.primary }}
          >
            404
          </h1>
          <h2
            className={TYPOGRAPHY.h2.fontSize}
            style={{ color: COLORS.text.primary }}
          >
            페이지를 찾을 수 없습니다
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

/** 404 페이지 - prerender 시 useContext null 버그 회피 (Context 의존 컴포넌트는 ssr:false로 클라이언트 전용) */
export default function NotFound() {
  return <NotFoundClient />;
}
