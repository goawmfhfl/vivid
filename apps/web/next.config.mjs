import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  redirects: () => [
    { source: "/analysis", destination: "/reports", permanent: true },
    // /2025-02-27 등 기존 path 형식 -> /?date=2025-02-27 (클라이언트 라우팅용)
    {
      source: "/:date(\\d{4}-\\d{2}-\\d{2})",
      destination: "/?date=:date",
      permanent: false,
    },
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
    workerThreads: false,
    cpus: 1,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
