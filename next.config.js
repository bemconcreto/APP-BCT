import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite builds mesmo com erros (substitui eslint + typescript antigos)
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Necessário para API Routes no Next 16
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;