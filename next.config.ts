import type { NextConfig } from "next";

interface ExtendedNextConfig extends NextConfig {
  eslint?: { ignoreDuringBuilds?: boolean };
  typescript?: { ignoreBuildErrors?: boolean };
}

const nextConfig: ExtendedNextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Ignorar ESLint durante el build para evitar fallos por warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig as NextConfig;
