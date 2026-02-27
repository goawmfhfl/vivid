import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
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
