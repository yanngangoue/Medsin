export function EmergencyBanner() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
      <span className="font-semibold">Urgence médicale</span>
      {" — "}
      Composez le{" "}
      <a href="tel:811" className="font-bold underline">
        811
      </a>{" "}
      (Info-Santé) ou le{" "}
      <a href="tel:911" className="font-bold underline">
        911
      </a>
      . MedSim ne remplace pas les services d&apos;urgence.
    </div>
  );
}
