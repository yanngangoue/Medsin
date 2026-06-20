import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { forbidden, unauthorized } from "@/lib/api-errors";
import { getLatestClinicalDecision } from "@/lib/clinical/decisions";
import { medicationLabel, KIND_FR } from "@/lib/clinical/decisions";

export async function GET() {
  return catchRouteError("patient/clinical-decision/GET", async () => {
    const user = await getSessionUser();
      if (!user) return unauthorized();
      if (user.role !== "PATIENT") return forbidden();
    
      const decision = await getLatestClinicalDecision(user.id);
      if (!decision) {
        return NextResponse.json({ decision: null });
      }
    
      return NextResponse.json({
        decision: {
          id: decision.id,
          kind: decision.kind,
          kindLabel: KIND_FR[decision.kind],
          eligibility: decision.eligibility,
          medication: decision.medication,
          medicationLabel: medicationLabel(decision.medication),
          patientMessage: decision.patientMessage,
          createdAt: decision.createdAt.toISOString(),
          decidedBy:
            decision.decidedBy.prenom || decision.decidedBy.name || "Équipe Anne-sante",
        },
      });
  });
}
