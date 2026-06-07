"use client";

import { useCallback, useEffect, useState } from "react";

export type PatientNotifications = {
  unreadMessages: number;
  upcomingVideo: boolean;
  nextAppointmentId: string | null;
  hasGlp1Dossier: boolean;
  checkInPending: boolean;
};

const EMPTY: PatientNotifications = {
  unreadMessages: 0,
  upcomingVideo: false,
  nextAppointmentId: null,
  hasGlp1Dossier: false,
  checkInPending: false,
};

export function usePatientNotifications(enabled = true) {
  const [data, setData] = useState<PatientNotifications>(EMPTY);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/patient/notifications");
      if (res.ok) {
        const json = (await res.json()) as PatientNotifications;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
    if (!enabled) return;
    const id = window.setInterval(() => void refresh(), 60_000);
    const onCheckIn = () => void refresh();
    window.addEventListener("medsim:check-in-complete", onCheckIn);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("medsim:check-in-complete", onCheckIn);
    };
  }, [refresh, enabled]);

  return { ...data, loading, refresh };
}
