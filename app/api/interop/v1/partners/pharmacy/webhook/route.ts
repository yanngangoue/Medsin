import { catchRouteError } from "@/lib/api/catch-route-error";
import { logInteropAction } from "@/lib/interop/audit-interop";
import { getInteropEventBus } from "@/lib/interop/events/bus";
import { interopError, interopJson } from "@/lib/interop/http";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const bodySchema = z.object({
  partnerPharmacyId: z.string(),
  externalOrderId: z.string(),
  status: z.enum(["RECEIVED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  payload: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/interop/v1/partners/pharmacy/webhook — callback partenaire (MVP sans signature HMAC ; à sécuriser).
 * En production : vérifier `x-medisim-signature` (HMAC-SHA256 du corps avec clé rotative KMS).
 */
export async function POST(req: NextRequest) {
  return catchRouteError("interop/v1/partners/pharmacy/webhook/POST", async () => {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      const expected = process.env.MEDSIM_PARTNER_WEBHOOK_SECRET?.trim();
      if (!expected || token !== expected) {
        return interopError(401, "webhook-auth", "Jeton partenaire invalide");
      }
    
      const json = await req.json().catch(() => null);
      const parsed = bodySchema.safeParse(json);
      if (!parsed.success) {
        return interopError(400, "validation", parsed.error.message);
      }
    
      const evtId = randomUUID();
      await getInteropEventBus().publish({
        id: evtId,
        type: "DeliveryStatusUpdated",
        occurredAt: new Date().toISOString(),
        tenantProvince: "QC",
        payload: parsed.data,
      });
    
      await logInteropAction({
        userId: null,
        action: "PartnerPharmacyWebhook",
        resourceId: parsed.data.externalOrderId,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      });
    
      return interopJson({ ok: true, eventId: evtId }, { status: 200 });
  });
}
