import { catchRouteError } from "@/lib/api/catch-route-error";
import { createAppointment, listAppointments } from "@/controllers/appointmentController";

export async function GET() {
  return catchRouteError("appointments/GET", async () => {
    return listAppointments();
  });
}

export async function POST(req: Request) {
  return catchRouteError("appointments/POST", async () => {
    const body = await req.json().catch(() => null);
      return createAppointment(body);
  });
}
