/**
 * Crée un compte MEDECIN et un ADMIN pour tester le back-office.
 * Usage : node scripts/seed-staff.mjs
 * Prérequis : DATABASE_URL, npx prisma db push
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STAFF = [
  { prenom: "Dr Demo", email: "medecin@medsim.local", password: "medecin12345", role: "MEDECIN" },
  { prenom: "Admin Demo", email: "admin@medsim.local", password: "admin12345", role: "ADMIN" },
];

async function main() {
  for (const s of STAFF) {
    const email = s.email.toLowerCase();
    const hash = await bcrypt.hash(s.password, 12);
    await prisma.user.upsert({
      where: { email },
      create: {
        prenom: s.prenom,
        name: s.prenom,
        email,
        passwordHash: hash,
        role: s.role,
        emailVerified: new Date(),
      },
      update: { passwordHash: hash, role: s.role },
    });
    console.log(`✓ ${s.role} : ${email} / ${s.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
