import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/login", destination: "/auth/connexion", permanent: false },
      { source: "/register", destination: "/auth/inscription", permanent: false },
      { source: "/connexion", destination: "/auth/connexion", permanent: false },
      { source: "/patient", destination: "/", permanent: false },
      { source: "/patient/", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
