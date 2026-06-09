import { logoutUser } from "@/controllers/authController";
import { catchRouteError } from "@/lib/api/catch-route-error";

export async function POST() {
  return catchRouteError("auth/logout", () => logoutUser());
}
