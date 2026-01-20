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
      
      // CSS 로더와 PostCSS 로더의 캐시 명시적으로 비활성화
      // globals.css 처리 시 발생하는 캐시 오류 방지
      const rules = config.module?.rules;
      if (rules && Array.isArray(rules)) {
        rules.forEach((rule: any) => {
          if (rule.oneOf && Array.isArray(rule.oneOf)) {
            rule.oneOf.forEach((oneOf: any) => {
              if (oneOf.use && Array.isArray(oneOf.use)) {
                oneOf.use.forEach((use: any) => {
                  // CSS 로더 캐시 완전 비활성화
                  if (use.loader && typeof use.loader === 'string' && use.loader.includes('css-loader')) {
                    if (!use.options) {
                      use.options = {};
                    }
                    // CSS 로더의 모든 캐시 옵션 제거
                    delete use.options.cache;
                    use.options = {
                      ...use.options,
                      importLoaders: use.options?.importLoaders || 1,
                      modules: use.options?.modules || false,
                      // 캐시 관련 옵션 명시적 비활성화
                      esModule: true,
                    };
                  }
                  // PostCSS 로더 캐시 완전 비활성화
                  if (use.loader && typeof use.loader === 'string' && use.loader.includes('postcss-loader')) {
                    if (!use.options) {
                      use.options = {};
                    }
                    // PostCSS 로더의 모든 캐시 옵션 제거
                    delete use.options.cache;
                    use.options = {
                      ...use.options,
                      postcssOptions: {
                        ...use.options?.postcssOptions,
                        // 캐시 완전 비활성화
                      },
                    };
                  }
                });
              }
            });
          }
        });
      }
    }
    
    return config;
  },
};

export default nextConfig;
