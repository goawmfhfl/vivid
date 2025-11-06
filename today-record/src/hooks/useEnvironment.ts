/**
 * 현재 실행 환경을 확인하는 커스텀 훅
 * @returns {object} 환경 정보와 유틸리티 함수들
 */
export function useEnvironment() {
  const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
  const isTest = process.env.NEXT_PUBLIC_NODE_ENV === "test";
  const currentEnv = process.env.NEXT_PUBLIC_NODE_ENV || "development";

  return {
    // 환경 플래그
    isDevelopment,
    isProduction,
    isTest,
    currentEnv,

    // 유틸리티 함수
    isEnv: (env: string) => currentEnv === env,
  };
}
