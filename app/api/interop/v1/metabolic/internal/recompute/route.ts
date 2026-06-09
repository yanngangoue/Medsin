import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { recomputeMetabolicProfileForPatient } from "@/lib/metabolic/profile-compute";
import { listPatientUserIdsForRecompute } from "@/lib/metabolic/repository";
import { logInteropAction } from "@/lib/interop/audit-interop";
import { z } from "zod";

const bodySchema = z.object({ patientUserId: z.string().uuid().optional() });

/**
 * POST recalcul profils metaboliques (cron 24h ou manuel).
 * Auth: MEDSIM_SERVICE_TOKEN ou MEDSIM_CRON_SECRET en Bearer.
 */
export async function POST(req: NextRequest) {
  return catchRouteError("interop/v1/metabolic/internal/recompute/POST", async () => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      const ok =
        token &&
        (token === process.env.MEDSIM_SERVICE_TOKEN || token === process.env.MEDSIM_CRON_SECRET);
      if (!ok) {
        return NextResponse.json({ error: "Non autorise", code: "UNAUTHORIZED" }, { status: 401 });
      }
      const json = await req.json().catch(() => ({}));
      const parsed = bodySchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.message }, { status: 400 });
      }
      if (parsed.data.patientUserId) {
        await recomputeMetabolicProfileForPatient(parsed.data.patientUserId);
        await logInteropAction({
          userId: null,
          action: "MetabolicProfileRecomputeSingle",
          resourceId: parsed.data.patientUserId,
        });
        return NextResponse.json({ ok: true, processed: 1 });
      }
      const ids = await listPatientUserIdsForRecompute(500);
      for (const id of ids) {
        await recomputeMetabolicProfileForPatient(id);
      }
      await logInteropAction({
        userId: null,
        action: "MetabolicProfileRecomputeBatch",
        resourceId: "count-" + String(ids.length),
      });
      return NextResponse.json({ ok: true, processed: ids.length });
  });
}
