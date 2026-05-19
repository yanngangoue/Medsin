import assert from "node:assert/strict";
import {
  canWriteMedicationRequest,
  canViewDoctorMetabolicDashboard,
  canViewNutritionistMetabolicDashboard,
  canIngestOwnMetabolicData,
  type InteropPrincipal,
} from "@/lib/interop/gateway";

function pr(roles: string[]): InteropPrincipal {
  return { userId: "u1", roles, province: "QC" };
}

assert.equal(canWriteMedicationRequest(pr(["MEDECIN"])), true);
assert.equal(canWriteMedicationRequest(pr(["PATIENT"])), false);
assert.equal(canWriteMedicationRequest(pr(["ADMIN"])), true);

assert.equal(canViewDoctorMetabolicDashboard(pr(["MEDECIN"])), true);
assert.equal(canViewDoctorMetabolicDashboard(pr(["NUTRITIONNISTE"])), false);
assert.equal(canViewNutritionistMetabolicDashboard(pr(["NUTRITIONNISTE"])), true);
assert.equal(canIngestOwnMetabolicData(pr(["PATIENT"])), true);
assert.equal(canIngestOwnMetabolicData(pr(["ADMIN"])), false);

console.log("interop gateway checks ok");
