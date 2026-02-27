/**
 * 404 페이지 - Pure Component (Context 의존성 0%)
 * 훅, withAuth, AppHeader, design-system 등 어떤 의존도 없음.
 * 표준 HTML + 인라인 CSS만 사용.
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 1rem",
        backgroundColor: "#e4e2dd",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      data-not-found-page
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "28rem",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "4.5rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "#5f6b3a",
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
            color: "#333",
          }}
        >
          페이지를 찾을 수 없습니다
        </h2>
        <p
          style={{
            fontSize: "1rem",
            marginBottom: "2.5rem",
            color: "#666",
            lineHeight: 1.6,
          }}
        >
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있습니다.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            width: "100%",
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.875rem 1.5rem",
              backgroundColor: "#5f6b3a",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "0.75rem",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            홈으로 이동
          </a>
          <a
            href="javascript:history.back()"
            style={{
              display: "block",
              padding: "0.875rem 1.5rem",
              backgroundColor: "#fff",
              color: "#666",
              fontWeight: 500,
              borderRadius: "0.75rem",
              border: "1px solid #ddd",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              textDecoration: "none",
            }}
          >
            이전 페이지
          </a>
        </div>
      </div>
    </div>
  );
}
