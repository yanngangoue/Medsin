import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const u = await p.user.findUnique({ where: { email: "mvp.flow.test@medsim.ca" } });
  if (!u) {
    console.log("no user");
    process.exit(1);
  }
  const q = await p.medicalQuestionnaire.findFirst({ where: { userId: u.id } });
  const ci = await p.weightCheckIn.findFirst({ where: { userId: u.id }, orderBy: { recordedAt: "desc" } });
  const reports = await p.anneIpsReport.findMany({ where: { userId: u.id }, take: 1 });
  const f = await p.medicationFulfillment.findFirst({ where: { userId: u.id } });
  console.log(
    JSON.stringify(
      {
        ipsId: q?.ipsId,
        aiReportLen: ci?.aiReport?.length ?? 0,
        aiReportPreview: ci?.aiReport?.slice(0, 100),
        anneReports: reports.length,
        fulfillmentStatus: f?.status,
        tracking: f?.trackingNumber,
      },
      null,
      2,
    ),
  );
  await p.$disconnect();
}

main();
