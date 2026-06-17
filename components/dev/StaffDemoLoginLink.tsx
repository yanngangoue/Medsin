"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function StaffDemoLoginLink() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    void fetch("/api/dev/staff-demo-login")
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  return (
    <p className="mt-10 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
      Accès professionnel (démo) :{" "}
      <Link href="/acces-equipe" className="text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline">
        IPS · médecin · pharmacien
      </Link>
    </p>
  );
}
