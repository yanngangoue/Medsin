import { registerUser } from "@/controllers/authController";

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return registerUser(body, { ip: clientIp(req) });
}
