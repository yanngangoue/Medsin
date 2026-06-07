import { loginUser } from "@/controllers/authController";

export async function POST(req: Request) {
  void req;
  return loginUser();
}
