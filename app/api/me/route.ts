import { getMe } from "@/controllers/patientController";
import { catchRouteError } from "@/lib/api/catch-route-error";

export async function GET() {
  return catchRouteError("me", () => getMe());
}
