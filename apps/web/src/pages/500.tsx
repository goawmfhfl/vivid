/**
 * Pages Router 500 페이지.
 * App Router 사용 중이지만 Next.js가 _error.js prerender 시
 * useContext null 버그가 발생하므로, 명시적 500 페이지를 제공하여 우회합니다.
 */
export default function Custom500() {
  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h1>500</h1>
      <p>서버 오류가 발생했습니다.</p>
    </div>
  );
}
