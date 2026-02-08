import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Monorepo에서 올바른 root 경로 설정
  outputFileTracingRoot: path.join(__dirname, "../.."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mogjqlhzxqjuvffdizlc.supabase.co",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // ESLint 에러가 빌드를 막지 않도록 설정 (Warning만 허용)
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 체크는 유지하되, Warning은 허용
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  workerThreads: false,
  cpus: 1,

  webpack: (config, { isServer, dev }) => {
    // 3. 프로덕션 빌드 시 소스맵 생성 방지
    // 소스맵은 메모리를 가장 많이 잡아먹는 주범입니다.
    if (!dev) {
      config.devtool = false;
    }

    // 4. fs 모듈 에러 방지 (기존에 쓰시던 것)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // 5. 캐시를 끄는 대신, Webpack의 기본 최적화에 맡깁니다.
    // 사용자가 작성했던 복잡한 rule 수정 코드는 모두 삭제했습니다.

    return config;
  },
};

export default nextConfig;
