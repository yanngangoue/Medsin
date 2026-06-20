import { catchRouteError } from "@/lib/api/catch-route-error";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generatePrescriptionPdf } from "@/lib/pdf-generator";
import { isDemoMode } from "@/lib/is-demo-mode";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function pdfBufferFromDataUrl(pdfUrl: string): Buffer | null {
  if (!pdfUrl.startsWith("data:application/pdf;base64,")) return null;
  const base64 = pdfUrl.slice("data:application/pdf;base64,".length);
  if (!base64) return null;
  return Buffer.from(base64, "base64");
}

export async function GET(_req: Request, { params }: Params) {
  return catchRouteError("patient/prescription/[id]/pdf/GET", async () => {
    const session = await auth();
      if (!session?.user?.id || session.user.role !== "PATIENT") {
        return NextResponse.json({ error: "Non autorisé", code: "UNAUTHORIZED" }, { status: 401 });
      }
    
      const { id } = await params;
    
      if (isDemoMode() || id === "demo") {
        const demo = generatePrescriptionPdf({
          patientName: session.user.prenom ?? "Patient",
          medication: "Ozempic",
          dosage: "0,25 mg/semaine",
          durationMonths: 3,
          refills: 2,
          instructions: "Injection sous-cutanée une fois par semaine.",
          ipsName: "IPS Anne-sante",
          issuedAt: new Date(),
        });
        return new NextResponse(new Uint8Array(demo), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="ordonnance-medsim.pdf"',
          },
        });
      }
    
      const fulfillment = await prisma.medicationFulfillment.findFirst({
        where: { id, userId: session.user.id },
        include: {
          user: { select: { prenom: true, name: true } },
        },
      });
    
      if (!fulfillment) {
        return NextResponse.json({ error: "Ordonnance introuvable", code: "NOT_FOUND" }, { status: 404 });
      }
    
      if (fulfillment.pdfUrl) {
        const stored = pdfBufferFromDataUrl(fulfillment.pdfUrl);
        if (stored) {
          return new NextResponse(new Uint8Array(stored), {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="ordonnance-medsim.pdf"',
            },
          });
        }
      }
    
      const ips = await prisma.user.findUnique({
        where: { id: fulfillment.ipsId },
        select: { prenom: true, name: true, medecinLicenseNumber: true },
      });
    
      const generated = generatePrescriptionPdf({
        patientName: fulfillment.user.prenom || fulfillment.user.name || "Patient",
        medication: fulfillment.medication,
        dosage: fulfillment.dosage,
        durationMonths: fulfillment.duration,
        refills: fulfillment.refills,
        instructions: fulfillment.instructions,
        ipsName: ips?.prenom ?? ips?.name ?? "IPS Anne-sante",
        ipsLicense: ips?.medecinLicenseNumber ?? undefined,
        issuedAt: fulfillment.pdfGeneratedAt ?? fulfillment.createdAt,
      });
    
      return new NextResponse(new Uint8Array(generated), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="ordonnance-medsim.pdf"',
        },
      });
  });
}
