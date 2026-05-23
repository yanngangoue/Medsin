import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DossierDelegate = {
  findMany: (args: Prisma.DossierGlp1FindManyArgs) => Promise<unknown[]>;
  count: (args: Prisma.DossierGlp1CountArgs) => Promise<number>;
  findUnique: (args: Prisma.DossierGlp1FindUniqueArgs) => Promise<unknown>;
  findFirst: (args: Prisma.DossierGlp1FindFirstArgs) => Promise<unknown>;
  create: (args: Prisma.DossierGlp1CreateArgs) => Promise<unknown>;
  update: (args: Prisma.DossierGlp1UpdateArgs) => Promise<unknown>;
};

/** Client Prisma à jour requis (`npx prisma generate` après ajout de DossierGlp1). */
export function dossierGlp1Client(client: PrismaClient = prisma): DossierDelegate | null {
  const delegate = (client as PrismaClient & { dossierGlp1?: DossierDelegate }).dossierGlp1;
  return delegate ?? null;
}

export function hasDossierGlp1Model(client: PrismaClient = prisma): boolean {
  return dossierGlp1Client(client) != null;
}
