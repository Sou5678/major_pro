import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  compress: true,
  poweredByHeader: false,
  // Disable static optimization for dynamic routes
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "date-fns",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Ensure client components are properly bundled
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure client-side modules are included
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
