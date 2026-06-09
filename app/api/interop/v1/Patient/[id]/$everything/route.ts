import { catchRouteError } from "@/lib/api/catch-route-error";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo-mode";
import { logInteropAction } from "@/lib/interop/audit-interop";
import type { FhirEncounter } from "@/lib/interop/fhir/encounter";
import type { FhirObservation } from "@/lib/interop/fhir/observation";
import type { FhirPatient } from "@/lib/interop/fhir/patient";
import { interopError, interopJson } from "@/lib/interop/http";
import { canReadPatientRecord, sessionToPrincipal } from "@/lib/interop/gateway";
import { parseTenantFromHeaders } from "@/lib/interop/tenancy";
import type { NextRequest } from "next/server";

type Bundle = {
  resourceType: "Bundle";
  type: "collection";
  entry: { resource: unknown }[];
};

/**
 * GET /api/interop/v1/Patient/:id/$everything — dossier synthétique (MVP).
 * Si id correspond à un User PATIENT connecté ou profil autorisé, enrichit depuis Prisma.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return catchRouteError("interop/v1/Patient/[id]/$everything/GET", async () => {
    const tenant = parseTenantFromHeaders(req.headers);
      if (!tenant) {
        return interopError(400, "tenant-required", "En-tête x-medisim-tenant requis (QC|ON|BC|AB)");
      }
      const session = await auth();
      const principal = sessionToPrincipal(session, tenant.province);
      if (!principal) return interopError(401, "unauthorized", "Session requise");
      if (!canReadPatientRecord(principal)) {
        return interopError(403, "forbidden", "Rôle insuffisant");
      }
    
      const { id } = await ctx.params;
    
      /** ABAC MVP : un patient ne lit que son propre dossier par id utilisateur. */
      if (principal.roles.includes("PATIENT") && principal.userId !== id) {
        return interopError(403, "patient-scope", "Accès limité à votre propre dossier");
      }
    
      const bundle: Bundle = { resourceType: "Bundle", type: "collection", entry: [] };
    
      let patientFhir: FhirPatient = {
        resourceType: "Patient",
        id,
        active: true,
      };
    
      if (!isDemoMode()) {
        const user = await prisma.user.findUnique({
          where: { id },
          include: { profile: true, questionnaire: true },
        });
        if (user?.profile) {
          const pr = user.profile;
          patientFhir = {
            resourceType: "Patient",
            id: user.id,
            name: [{ family: pr.fullName || user.name || undefined, given: [user.prenom] }],
            gender: (pr.gender as FhirPatient["gender"]) ?? undefined,
            birthDate: pr.dateOfBirth?.toISOString().slice(0, 10),
          };
          if (pr.weightKg != null && pr.heightCm != null) {
            const obsW: FhirObservation = {
              resourceType: "Observation",
              id: `obs-weight-${user.id}`,
              status: "final",
              code: { text: "Body weight", coding: [{ system: "http://loinc.org", code: "29463-7" }] },
              subject: { reference: `Patient/${user.id}` },
              valueQuantity: { value: pr.weightKg, unit: "kg" },
            };
            const bmi =
              pr.bmi ??
              (pr.weightKg / Math.pow(pr.heightCm / 100, 2) > 0
                ? Math.round((pr.weightKg / Math.pow(pr.heightCm / 100, 2)) * 10) / 10
                : undefined);
            const obsBmi: FhirObservation = {
              resourceType: "Observation",
              id: `obs-bmi-${user.id}`,
              status: "final",
              code: { text: "BMI", coding: [{ system: "http://loinc.org", code: "39156-5" }] },
              subject: { reference: `Patient/${user.id}` },
              valueQuantity: bmi != null ? { value: bmi, unit: "kg/m2" } : undefined,
            };
            bundle.entry.push({ resource: obsW }, { resource: obsBmi });
          }
        }
      }
    
      bundle.entry.unshift({ resource: patientFhir });
    
      const enc: FhirEncounter = {
        resourceType: "Encounter",
        id: `enc-last-${id}`,
        status: "finished",
        class: { text: "ambulatory" },
        subject: { reference: `Patient/${id}` },
        period: { start: new Date().toISOString() },
      };
      bundle.entry.push({ resource: enc });
    
      await logInteropAction({
        userId: session!.user!.id,
        action: "PatientEverythingRead",
        resourceType: "Patient",
        resourceId: id,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      });
    
      return interopJson(bundle);
  });
}
