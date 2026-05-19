/**
 * `auth` : Edge-safe (`auth.edge`).
 * `handlers` : importer depuis `@/auth.node` dans les routes API uniquement (évite Prisma dans le bundle middleware).
 */
export { auth } from "./auth.edge";
