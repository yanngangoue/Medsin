import type { FhirId, Meta } from "./primitive";
import type { HumanName } from "./patient";

export interface FhirPractitioner {
  resourceType: "Practitioner";
  id?: FhirId;
  meta?: Meta;
  identifier?: { system?: string; value?: string }[];
  active?: boolean;
  name?: HumanName[];
  qualification?: {
    code: { text?: string };
  }[];
}
