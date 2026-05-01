import { createAppointment, listAppointments } from "@/controllers/appointmentController";

export async function GET() {
  return listAppointments();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return createAppointment(body);
}
