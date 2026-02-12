/**
 * Pages Router 404 페이지.
 * _error.js prerender 시 useContext null 버그 우회를 위해 제공합니다.
 */
export default function Custom404() {
  return (
    <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
    </div>
  );
}
