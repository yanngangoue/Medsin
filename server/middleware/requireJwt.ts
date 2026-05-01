import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../lib/auth";

export async function requireJwt(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const match = header?.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }
  const payload = await verifyToken(match[1]);
  if (!payload) {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }
  req.auth = payload;
  next();
}
