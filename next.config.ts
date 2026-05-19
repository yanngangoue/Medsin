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
      { source: "/login", destination: "/connexion", permanent: false },
      { source: "/register", destination: "/onboarding/inscription", permanent: false },
      { source: "/patient", destination: "/", permanent: false },
      { source: "/patient/", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
