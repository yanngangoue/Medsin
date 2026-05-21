import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
}

export function badRequest(message = "Données invalides") {
  return NextResponse.json({ error: message }, { status: 400 });
}
