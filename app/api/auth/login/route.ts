import { loginUser } from "@/controllers/authController";
import { catchRouteError } from "@/lib/api/catch-route-error";

export async function POST(req: Request) {
  return catchRouteError("auth/login", async () => {
    void req;
    return loginUser();
  });
}
