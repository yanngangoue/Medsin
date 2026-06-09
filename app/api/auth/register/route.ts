import { registerUser } from "@/controllers/authController";
import { catchRouteError } from "@/lib/api/catch-route-error";

export async function POST(req: Request) {
  return catchRouteError("auth/register", async () => {
    void req;
    return registerUser();
  });
}
