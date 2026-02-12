"use client";

/**
 * Root layout 실패 시 사용되는 에러 핸들러.
 * Next.js 규칙: global-error는 root layout을 완전히 대체하므로
 * 반드시 <html>, <body> 태그를 포함해야 합니다.
 */
export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", backgroundColor: "#f5f5f5" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>오류가 발생했습니다</h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
