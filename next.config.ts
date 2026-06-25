import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.stripe.com",
      "font-src 'self'",
      "connect-src 'self' https://api.stripe.com https://*.vercel-insights.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/login", destination: "/connexion", permanent: false },
      { source: "/register", destination: "/auth/inscription", permanent: false },
      { source: "/onboarding", destination: "/eligibilite", permanent: true },
      { source: "/onboarding/inscription", destination: "/auth/inscription", permanent: true },
      { source: "/onboarding/gestion-poids", destination: "/eligibilite", permanent: true },
      { source: "/onboarding/gestion-poids/:path*", destination: "/eligibilite", permanent: true },
      { source: "/onboarding/questionnaire", destination: "/questionnaire", permanent: true },
      { source: "/onboarding/nutri-plus", destination: "/eligibilite", permanent: true },
      { source: "/onboarding/nutri-plus/:path*", destination: "/eligibilite", permanent: true },
      { source: "/onboarding/repas-sante", destination: "/eligibilite", permanent: true },
      { source: "/onboarding/repas-sante/:path*", destination: "/eligibilite", permanent: true },
      { source: "/nutrition", destination: "/eligibilite", permanent: true },
      { source: "/dashboard/admin", destination: "/admin/dashboard", permanent: true },
      { source: "/dashboard/admin/:path*", destination: "/admin/dashboard", permanent: true },
      { source: "/politique-confidentialite", destination: "/confidentialite", permanent: true },
    ];
  },
};

export default nextConfig;
