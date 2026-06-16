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
      { source: "/onboarding/questionnaire", destination: "/questionnaire", permanent: true },
      { source: "/onboarding/nutri-plus", destination: "/onboarding/gestion-poids", permanent: true },
      { source: "/onboarding/nutri-plus/:path*", destination: "/onboarding/gestion-poids", permanent: true },
      { source: "/onboarding/repas-sante", destination: "/onboarding/gestion-poids", permanent: true },
      { source: "/onboarding/repas-sante/:path*", destination: "/onboarding/gestion-poids", permanent: true },
      { source: "/nutrition", destination: "/onboarding/gestion-poids", permanent: true },
      { source: "/politique-confidentialite", destination: "/confidentialite", permanent: true },
    ];
  },
};

export default nextConfig;
