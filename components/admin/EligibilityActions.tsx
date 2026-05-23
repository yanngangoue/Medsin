"use client";

import type { EligibilityStatus } from "@prisma/client";

type Props = {
  updating: boolean;
  onSet: (status: EligibilityStatus) => void;
};

export function EligibilityActions({ updating, onSet }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={updating}
        onClick={() => onSet("ELIGIBLE")}
        className="rounded-lg bg-[#16a34a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#15803d] disabled:opacity-50"
      >
        Valider éligible
      </button>
      <button
        type="button"
        disabled={updating}
        onClick={() => onSet("NOT_ELIGIBLE")}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        Refuser
      </button>
      <button
        type="button"
        disabled={updating}
        onClick={() => onSet("MEDICAL_REVIEW_REQUIRED")}
        className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
      >
        Révision requise
      </button>
    </div>
  );
}
