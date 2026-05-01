import { loginUser } from "@/controllers/authController";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return loginUser(body);
}
