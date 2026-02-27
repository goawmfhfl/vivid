"use client";

/**
 * 루트 레이아웃 오류 시 전체 문서를 대체하는 에러 페이지.
 * Context/Provider 의존 없이 완전 독립 렌더링.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#e4e2dd", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ fontSize: "2.5rem", color: "#dc2626", marginBottom: 16 }}>
            오류가 발생했습니다
          </h1>
          <p style={{ color: "#666", marginBottom: 24 }}>
            예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              backgroundColor: "#5f6b3a",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            다시 시도
          </button>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#999", marginTop: 24 }}>
              오류 ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
