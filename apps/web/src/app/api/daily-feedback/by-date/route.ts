/**
 * 하위 호환용: /api/daily-feedback/by-date → daily_vivid 테이블 사용
 * 클라이언트가 구 API 경로로 호출하는 경우 이 라우트가 처리합니다.
 */
export { GET } from "@/app/api/daily-vivid/by-date/route";
