/**
 * Pipeline IA → FHIR : implémenter `POST /metabolic/analyze` (entrée `{ category, fhir }`, sortie MetabolicAiResult).
 */

const INTERNAL_FHIR_BASE = process.env.MEDSIM_INTERNAL_FHIR_BASE ?? "http://localhost:3001/api/interop/v1";

async function main(): Promise<void> {
  console.info("[ai-decision-engine] base FHIR interne:", INTERNAL_FHIR_BASE);
  console.info("[ai-decision-engine] MVP : brancher Anthropic + garde-fous clinique humaine obligatoires");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
