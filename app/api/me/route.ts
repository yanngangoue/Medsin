import { getMe } from "@/controllers/patientController";

export async function GET() {
  return getMe();
}
