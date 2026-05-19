# Référence interop — endpoints clés (MVP)

Base : `/api/interop/v1`

## Général

| Méthode | Chemin | Rôle | En-têtes |
|---------|--------|------|----------|
| POST | `/Patient` | PATIENT, PHARMACIEN, MEDECIN, ADMIN | `x-medisim-tenant: QC\|ON\|BC\|AB` |
| GET | `/Patient/{id}/$everything` | idem (patient = self only) | idem |
| POST | `/MedicationRequest` | MEDECIN, ADMIN | idem |
| POST | `/sync/prescription` | lecture dossier | corps JSON voir Zod dans route |
| POST | `/partners/pharmacy/webhook` | partenaire | `Authorization: Bearer` si `MEDSIM_PARTNER_WEBHOOK_SECRET` défini |
| POST | `/internal/Observation` | service (`MEDSIM_SERVICE_TOKEN`) | `Authorization: Bearer` + tenant |

## Comportement métabolique (Loi 25 : consentement `POST …/metabolic/consent/dietary` requis avant ingestion)

| Méthode | Chemin | Rôle | Notes |
|---------|--------|------|--------|
| POST | `/metabolic/consent/dietary` | PATIENT | `{ "optIn": true, "version"?: "1.0" }` |
| POST | `/metabolic/intake/meal` | PATIENT | repas → `NutritionIntake` |
| POST | `/metabolic/intake/supplement` | PATIENT | complément → `NutritionIntake` + extension |
| POST | `/metabolic/intake/sleep` | PATIENT | `Observation` sommeil |
| POST | `/metabolic/intake/activity` | PATIENT | `Observation` activité |
| POST | `/metabolic/intake/glp1` | PATIENT | `MedicationStatement` GLP‑1 pris |
| GET | `/metabolic/dashboard/doctor/{patientId}` | MEDECIN, ADMIN | synthèse clinique + scores profil |
| GET | `/metabolic/dashboard/nutritionist/{patientId}` | NUTRITIONNISTE, ADMIN | repas, macros, recommandations IA, résumés hebdo/mensuel |
| POST | `/metabolic/internal/recompute` | `MEDSIM_SERVICE_TOKEN` ou `MEDSIM_CRON_SECRET` | `{ "patientUserId"?: uuid }` — recalcul profil Observation panel |

Tous les chemins métaboliques (sauf `internal/recompute`) exigent aussi `x-medisim-tenant`.

Type MIME ingestion : `application/fhir+json` en réponse succès.

Événements bus (MVP mémoire) : `PatientCreated`, `MedicationRequestValidated`, `PharmacySyncRequested`, `DeliveryStatusUpdated`, `MetabolicIntakeRecorded`, `MetabolicProfileRecomputed`.

## Page de test (développement)

| Page | Condition |
|------|-----------|
| `GET /dev/interop-test` | `NODE_ENV=development` par défaut, ou `MEDSIM_ENABLE_DEV_INTEROP_PAGE=true` ; sinon 404. Connexion requise. |

Raccourci serveur : `POST /api/dev/metabolic-recompute` (même garde-fou) — PATIENT sans corps ; ADMIN avec `{ "patientUserId": "…" }`.

