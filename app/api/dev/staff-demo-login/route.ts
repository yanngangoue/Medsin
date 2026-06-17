import { NextResponse } from "next/server";
import { catchRouteError } from "@/lib/api/catch-route-error";
import {
  getStaffDemoAccount,
  isStaffDemoLoginEnabled,
  isStaffDemoRole,
  listStaffDemoAccounts,
} from "@/lib/staff-demo-login";

export async function GET() {
  return catchRouteError("dev/staff-demo-login/GET", async () => {
    if (!isStaffDemoLoginEnabled()) {
      return NextResponse.json({ enabled: false });
    }
    return NextResponse.json({
      enabled: true,
      roles: listStaffDemoAccounts(),
    });
  });
}

export async function POST(req: Request) {
  return catchRouteError("dev/staff-demo-login/POST", async () => {
    if (!isStaffDemoLoginEnabled()) {
      return NextResponse.json({ error: "Non disponible" }, { status: 404 });
    }

    const body = (await req.json().catch(() => null)) as { role?: string } | null;
    const role = body?.role?.trim().toUpperCase() ?? "";
    if (!isStaffDemoRole(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    const account = getStaffDemoAccount(role);
    if (!account) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      email: account.email,
      password: account.password,
      redirectTo: account.home,
    });
  });
}
