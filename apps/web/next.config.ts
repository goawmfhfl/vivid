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
  // CSS 처리 최적화
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
