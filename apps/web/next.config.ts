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
    // 프로덕션 빌드에서 캐시를 완전히 비활성화하여 안정성 확보
    // 이는 빌드 시간을 약간 늘릴 수 있지만, 빌드 실패를 완전히 방지합니다
    if (!dev) {
      // webpack 캐시 완전 비활성화 (Vercel 빌드 오류 근본 해결)
      config.cache = false;
    }
    
    return config;
  },
};

export default nextConfig;
