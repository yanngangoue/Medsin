import { logoutUser } from "@/controllers/authController";

export async function POST() {
  return logoutUser();
}
