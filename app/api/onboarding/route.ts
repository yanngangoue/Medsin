import { saveOnboarding } from "@/controllers/patientController";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return saveOnboarding(body);
}
