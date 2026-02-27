import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  redirects: () => [
    // /analysis -> /reports (쿼리 파라미터 유지) - sync으로 빌드 워커 이슈 회피
    { source: "/analysis", destination: "/reports", permanent: true },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mogjqlhzxqjuvffdizlc.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
