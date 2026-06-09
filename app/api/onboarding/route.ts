import { catchRouteError } from "@/lib/api/catch-route-error";
import { saveOnboarding } from "@/controllers/patientController";

export async function POST(req: Request) {
  return catchRouteError("onboarding/POST", async () => {
    const body = await req.json().catch(() => null);
      return saveOnboarding(body);
  });
}
