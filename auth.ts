/**
 * Point d’entrée Auth.js : `auth` sans Prisma (middleware Edge) ;
 * `handlers` / `signIn` / `signOut` avec adaptateur Prisma (routes Node).
 */
export { auth } from "./auth.edge";
export { handlers, signIn, signOut } from "./auth.node";
