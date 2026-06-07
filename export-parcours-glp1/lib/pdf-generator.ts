import { signDocumentDigest } from "@/lib/encryption";

export type PrescriptionPdfInput = {
  patientName: string;
  patientDob?: string;
  medication: string;
  dosage: string;
  durationMonths: number;
  refills: number;
  instructions: string;
  ipsName: string;
  ipsLicense?: string;
  issuedAt: Date;
};

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Génère un PDF minimal valide (ordonnance) — signature numérique via empreinte SHA-256. */
export function generatePrescriptionPdf(input: PrescriptionPdfInput): Buffer {
  const dateStr = new Intl.DateTimeFormat("fr-CA", { dateStyle: "long" }).format(input.issuedAt);
  const body = [
    "ORDONNANCE MEDSIM",
    `Patient : ${input.patientName}`,
    input.patientDob ? `Date de naissance : ${input.patientDob}` : null,
    `Médicament : ${input.medication}`,
    `Dose : ${input.dosage}`,
    `Durée : ${input.durationMonths} mois · Renouvellements : ${input.refills}`,
    `Instructions : ${input.instructions}`,
    `Prescrit par : ${input.ipsName}${input.ipsLicense ? ` (${input.ipsLicense})` : ""}`,
    `Date : ${dateStr}`,
  ]
    .filter(Boolean)
    .join("\n");

  const signature = signDocumentDigest(body);
  const fullText = `${body}\n\nSignature numérique : ${signature.slice(0, 16)}…`;

  const lines = fullText.split("\n").map((line, i) => {
    const y = 750 - i * 16;
    return `BT /F1 11 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
  });

  const stream = `${lines.join("\n")}\n`;
  const streamLen = Buffer.byteLength(stream, "utf8");

  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length ${streamLen} >>stream
${stream}endstream endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000114 00000 n 
0000000241 00000 n 
0000000${(300 + streamLen).toString().padStart(3, "0")} 00000 n 
trailer<< /Size 6 /Root 1 0 R >>
startxref
${350 + streamLen}
%%EOF`;

  return Buffer.from(pdf, "utf8");
}
