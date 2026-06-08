function vercelDeploymentUrl(): string | undefined {
  const host = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  return host ? `https://${host}` : undefined;
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
    vercelDeploymentUrl() ??
    "http://localhost:3001"
  );
}
