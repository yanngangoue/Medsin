# Architecture d’interopérabilité Medsim

Objectif : couche **canonique FHIR R4**, bus d’événements, multi‑locataire par province, audit et contrats d’API — extensible vers gateway dédiée (NestJS), NATS/Kafka et connecteurs clinique.

## Vue logique (MVP dans ce dépôt)

```mermaid
flowchart TB
  subgraph Clients["Clients"]
    WEB[App Next.js]
    PART[Partenaires API]
  end

  subgraph Edge["Périmètre exposition"]
    BFF["BFF / API Routes Next.js\n`/api/interop/v1/*`"]
    OIDC[JWT / OIDC futur]
  end

  subgraph Core["Cœur interop"]
    GW["Contrats gateway\n`lib/interop/gateway`"]
    FHIR["Modèle FHIR TS\n`lib/interop/fhir`"]
    EB["EventBus abstrait\nNATS / Kafka derrière"]
    TEN["Tenancy province\n`lib/interop/tenancy`"]
  end

  subgraph Data["Données"]
    PG[(PostgreSQL + Prisma)]
    FHIR_STORE["Store FHIR / Binary\nphase 2"]
  end

  subgraph Conn["Connecteurs (stubs)"]
    PHX[PharmacyConnector]
    AI[AIDecisionEngine]
    LOG[LogisticsTracker]
  end

  WEB --> BFF
  PART --> BFF
  BFF --> OIDC
  BFF --> GW
  GW --> FHIR
  GW --> EB
  GW --> TEN
  EB --> PHX
  EB --> AI
  EB --> LOG
  GW --> PG
```

## Flux prescription / synchronisation (cible)

```mermaid
sequenceDiagram
  participant M as Médecin (Encounter)
  participant BFF as Interop API
  participant EB as Event Bus
  participant PH as PharmacyConnector
  participant DB as Prisma / FHIR store

  M->>BFF: POST MedicationRequest (FHIR)
  BFF->>DB: persister + audit
  BFF->>EB: publish PrescriptionValidated
  EB->>PH: webhook / message
  PH-->>BFF: acknowledge + tracking id
  BFF-->>M: 201 + Bundle
```

## Principes de conformité (implémentation progressive)

| Exigence | MVP (ce repo) | Phase 2+ |
|---------|---------------|----------|
| **Loi 25 / vie privée** | Audit `AuditLog`, consentement versionné (schéma à ajouter), minimisation | DPIA, DPO, registre traitements |
| **HIPAA-like** | RBAC existant, TLS côté déploiement, secrets env | BAA, chiffrement at-rest managé |
| **FHIR R4** | Types TS + endpoints JSON nominalement conformes | Validation complète (HAPI / Iguana), CapabilityStatement |
| **ISO 27001 / SOC2** | Journalisation, séparation dev/prod | politiques documentées, pentest |

## Répertoires

| Chemin | Rôle |
|--------|------|
| `lib/interop/` | Types FHIR, tenancy, bus, contrats |
| `lib/metabolic/` | Normalisation FHIR métabolique, dashboards, profil agrégé |
| `app/api/interop/v1/` | Endpoints REST interop (MVP) |
| `services/pharmacy-connector/` | Worker / adaptateur pharmacie (stub) |
| `services/ai-decision-engine/` | Pipeline IA → FHIR (stub) |
| `services/logistics-tracker/` | Webhooks livraison (stub) |
| `services/metabolic-behavior-service/` | Agrégations métaboliques / bus (stub) |
| `.github/workflows/interop-ci.yml` | CI ciblé interop |

## Couche « Comportement métabolique »

- **FHIR** : `NutritionIntake` (repas / compléments via extension), `Observation` (sommeil, activité), `MedicationStatement` (GLP‑1).
- **API** : `docs/INTEROP_ENDPOINTS.md` (section métabolique) ; consentement explicite `POST …/metabolic/consent/dietary` avant toute ingestion.
- **Profil agrégé** : `MetabolicProfileSnapshot` + Observation panel ; recalcul via `POST …/metabolic/internal/recompute` (cron 24h).
- **RBAC** : `MEDECIN` → dashboard clinique ; `NUTRITIONNISTE` → dashboard alimentaire ; `PATIENT` → ingestion.

## Sécurité (cible production)

- **Transit** : TLS 1.3 en frontal (reverse proxy / CDN).
- **Repos** : chiffrement volumes DB et stockage objet (KMS, clés rotatives).
- **Logs** : expédition vers SIEM avec rétention légale ; idéalement chiffrement at-rest côté fournisseur.
- **Messagerie clinique E2E** : non couverte par ce MVP — intégrer un module dédié (ex. fournisseur certifié) et des exigences de conservation probatoire.

## Gateway NestJS (phase 2)

Pour monter un **vrai** API Gateway (rate limit global, policies, mTLS partenaires), extraire les handlers de `app/api/interop` vers un service `services/gateway-nest` et conserver Next comme front ; le document `services/gateway/README.md` décrit la migration.
