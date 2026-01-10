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
    
    // webpack 캐시 안정화 설정
    // Vercel 빌드 시 캐시 오류 방지를 위한 설정
    if (!dev) {
      // 프로덕션 빌드 시 캐시를 더 안정적으로 관리
      config.cache = {
        ...config.cache,
        type: 'filesystem',
        // 캐시 무결성 검증 비활성화 (빌드 오류 방지)
        buildDependencies: {
          config: [__filename],
        },
        // 캐시 디렉토리 명시적 설정
        cacheDirectory: path.join(__dirname, '.next/cache/webpack'),
        // 캐시 압축 비활성화 (성능과 안정성 균형)
        compression: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
