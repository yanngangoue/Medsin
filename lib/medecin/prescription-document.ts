export function renderPrescriptionHtml(params: {
  numeroOrdonnance: string;
  signedAt: Date;
  medecinName: string;
  license: string | null;
  patientName: string;
  medicament: string;
  dosage: string;
  frequence: string;
  duree: string;
  instructions: string;
  notesMedicales: string;
}): string {
  const dateStr = params.signedAt.toLocaleDateString("fr-CA", { dateStyle: "long" });
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><title>Ordonnance ${params.numeroOrdonnance}</title>
<style>
body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;color:#111}
h1{font-size:1.25rem;color:#16a34a}
.meta{font-size:0.85rem;color:#444;margin-bottom:1.5rem}
.section{margin:1rem 0;padding:1rem;border:1px solid #e2e8f0;border-radius:8px}
</style></head>
<body>
<h1>Anne-sante — Ordonnance GLP-1</h1>
<p class="meta">N° ${params.numeroOrdonnance} · ${dateStr}</p>
<p><strong>Médecin :</strong> Dr. ${params.medecinName}${params.license ? ` · Permis ${params.license}` : ""}</p>
<p><strong>Patient :</strong> ${params.patientName}</p>
<div class="section">
<p><strong>${params.medicament}</strong></p>
<p>Dosage : ${params.dosage}</p>
<p>Fréquence : ${params.frequence}</p>
<p>Durée : ${params.duree}</p>
<p>Instructions : ${params.instructions}</p>
</div>
<div class="section"><p><strong>Notes cliniques</strong></p><p>${params.notesMedicales}</p></div>
<p style="margin-top:2rem"><em>Signé électroniquement par Dr. ${params.medecinName} le ${dateStr}</em></p>
</body></html>`;
}
