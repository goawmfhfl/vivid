import { NotFoundDynamic } from "./not-found-dynamic";

/** 404 페이지 - prerender 시 useContext null 버그 회피 (Context 의존 컴포넌트는 ssr:false로 클라이언트 전용) */
export default function NotFound() {
  return <NotFoundDynamic />;
}
