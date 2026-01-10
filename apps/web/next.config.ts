import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Monorepo에서 올바른 root 경로 설정
  outputFileTracingRoot: path.join(__dirname, "../.."),
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // ESLint 에러가 빌드를 막지 않도록 설정 (Warning만 허용)
  eslint: {
    ignoreDuringBuilds: false, // 빌드 시 ESLint 체크는 유지하되, Warning은 허용
  },
  // CSS 처리 최적화 및 webpack 캐시 안정화
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Vercel 빌드 시 webpack 캐시 오류 완전 방지
    // 프로덕션 빌드에서 모든 캐시를 완전히 비활성화하여 안정성 확보
    if (!dev) {
      // webpack 캐시 완전 비활성화 (서버/클라이언트 모두)
      // Vercel 환경에서 캐시 관련 오류를 근본적으로 해결
      delete config.cache;
      config.cache = false;
      
      // 병렬 처리 제한 (Vercel 환경에서 안정성 향상)
      // 너무 많은 병렬 처리가 캐시 충돌을 일으킬 수 있음
      if (config.parallelism && config.parallelism > 4) {
        config.parallelism = 4;
      }
      
      // webpack의 최적화 설정에서 캐시 관련 옵션 제거
      if (config.optimization) {
        config.optimization = {
          ...config.optimization,
          // 모듈 ID를 deterministic으로 설정하여 캐시 의존성 제거
          moduleIds: 'deterministic',
          chunkIds: 'deterministic',
        };
      }
    }
    
    return config;
  },
};

export default nextConfig;
