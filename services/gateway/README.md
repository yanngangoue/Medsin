# Gateway NestJS (phase 2)

Le MVP Anne-sante expose l’interop via **Route Handlers Next.js** (`app/api/interop/v1/*`) avec la même logique métier dans `lib/interop`.

Pour une **API Gateway** dédiée (limite de débit globale, WAF, mTLS vers partenaires, agrégation multi‑backend) :

1. Générer une app NestJS (`nest new gateway`) dans `services/gateway-nest`.
2. Monter des contrôleurs qui appellent `https://api.medsim.internal/interop/v1` **ou** importer des providers partagés si vous extrayez `lib/interop` en package npm workspace.
3. Terminaison TLS 1.3 en frontal (Cloudflare / AWS ALB) ; chiffrement au repos via KMS (CMK rotative) pour secrets et logs.

Voir `docs/INTEROP_ARCHITECTURE.md`.
