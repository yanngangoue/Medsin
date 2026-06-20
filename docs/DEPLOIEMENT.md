# Déploiement Anne-sante — production

Guide pour rendre **Anne-sante** pleinement fonctionnel sur Vercel + Neon.

**URL prod actuelle :** https://medsim-roan.vercel.app  
**Projet Vercel :** `builder-e834f123/medsim`  
**Dépôt GitHub :** https://github.com/yanngangoue/Medsin (`main`)

---

## État actuel (automatisé)

| Élément | Statut |
|---------|--------|
| Build & déploiement Vercel | ✅ |
| Base Neon + comptes seed | ✅ (connexion test OK) |
| Variables critiques (DB, NextAuth, Anthropic, Stripe clés) | ✅ |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` → prod | ✅ |
| `ENCRYPTION_KEY`, secrets cron | ✅ (générés via `ensure-prod-secrets.mjs`) |
| Connexion patient / médecin / admin | ✅ testé |
| Coach IA (Anthropic) | ✅ si `ANTHROPIC_API_KEY` renseignée |
| Paiements Stripe bout-en-bout | ⚠️ webhook à configurer |
| Courriels (Resend) | ⚠️ clé API à ajouter |
| Domaine `medsin.vercel.app` | ❌ autre compte Vercel (ancienne app) |

---

## Déploiement rapide (CLI)

```bash
# 1. Secrets manquants + URLs prod dans .env.local
node scripts/ensure-prod-secrets.mjs

# 2. Pousser toutes les variables vers Vercel
node scripts/ensure-prod-secrets.mjs --vercel

# 3. Schéma base (une fois ou après migration Prisma)
npx prisma db push
npx tsx prisma/seed.ts

# 4. Déployer
vercel deploy --prod --yes

# 5. Vérifier
MEDSIM_SMOKE_BASE=https://medsim-roan.vercel.app node scripts/mvp-audit.mjs
```

---

## Variables d'environnement (production)

### Obligatoires — déjà configurées

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | PostgreSQL Neon (pooler, `?sslmode=require`) |
| `NEXTAUTH_SECRET` | Sessions Auth.js |
| `NEXTAUTH_URL` | `https://medsim-roan.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Redirections Stripe, liens absolus |
| `MEDSIM_DEMO_MODE` | `false` |
| `ENCRYPTION_KEY` | Chiffrement données médicales (min. 32 car.) |
| `ANTHROPIC_API_KEY` | Coach Anne |
| `STRIPE_SECRET_KEY` | Checkout |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout client |
| `STRIPE_PRICE_ID` | Abonnement |
| `MEDSIM_CRON_SECRET` / `CRON_SECRET` | Crons Vercel (`vercel.json`) |

### À compléter manuellement

#### 1. Stripe Webhook (paiements)

1. [Stripe Dashboard](https://dashboard.stripe.com/webhooks) → **Ajouter un endpoint**
2. URL : `https://medsim-roan.vercel.app/api/stripe/webhook`
3. Événements recommandés :
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copier le **Signing secret** (`whsec_…`) → Vercel : `STRIPE_WEBHOOK_SECRET`
5. Redéployer

Test local (dev) :

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

#### 2. Resend (courriels)

1. [resend.com](https://resend.com) → API Keys
2. Vercel : `RESEND_API_KEY=re_…`
3. Vérifier le domaine d'envoi ou utiliser `onboarding@resend.dev` en test
4. `MEDSIM_EMAIL_FROM=MedSim <noreply@votredomaine.ca>`

Sans Resend : les e-mails sont logués en console, pas envoyés.

#### 3. Domaine personnalisé (optionnel)

Vercel → **Domaines** → ajouter `medsim.ca`  
Puis mettre à jour `NEXTAUTH_URL` et `NEXT_PUBLIC_APP_URL` → redéployer.

`medsin.vercel.app` appartient à un **autre** projet Vercel ; le récupérer ou abandonner au profit de `medsim-roan.vercel.app`.

---

## Crons planifiés

Définis dans `vercel.json` :

| Chemin | Horaire (UTC) | Rôle |
|--------|---------------|------|
| `/api/cron/rappel-check-in` | Lundi 13:00 | Rappel bilan hebdomadaire |
| `/api/cron/escalades` | Chaque heure | Escalades cliniques |

Vercel envoie `Authorization: Bearer <CRON_SECRET>`.  
`MEDSIM_CRON_SECRET` doit avoir la **même** valeur (ou utiliser uniquement `CRON_SECRET`).

---

## Comptes de test (après seed)

| Rôle | Courriel | Mot de passe |
|------|----------|--------------|
| Patient | `sophie.eligible@medsim.ca` | `Patient2026!` |
| IPS | `ips-test@medsim.ca` | `Test1234!` |
| Médecin | `medecin@medsim.ca` | `Medecin2026!` |
| Admin | `admin@medsim.ca` | `Admin2026!` |

```bash
npx tsx prisma/seed.ts
```

---

## Tests de validation

```bash
# Audit pages + APIs par rôle
MEDSIM_SMOKE_BASE=https://medsim-roan.vercel.app node scripts/mvp-audit.mjs

# Flux métier (DB locale requise)
MEDSIM_SMOKE_BASE=https://medsim-roan.vercel.app npx tsx scripts/test-mvp-flows.ts
```

---

## Checklist « go-live »

- [ ] `STRIPE_WEBHOOK_SECRET` configuré + webhook actif
- [ ] `RESEND_API_KEY` + domaine vérifié
- [ ] Paiement test Stripe (mode test) bout-en-bout
- [ ] Connexion patient + dashboard + coach Anne
- [ ] `MEDSIM_DEV_PASSWORD_RESET=false` en prod
- [ ] `MEDSIM_ENABLE_DEV_INTEROP_PAGE=false` en prod
- [ ] Domaine final + URLs mises à jour
- [ ] Clés Stripe **live** (`sk_live_` / `pk_live_`) pour vraie prod

---

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| Connexion échoue | `NEXTAUTH_URL` ≠ URL réelle du site |
| Erreur chiffrement | `ENCRYPTION_KEY` manquant ou &lt; 16 car. |
| Paiement sans effet | Webhook Stripe absent ou mauvais secret |
| Anne ne répond pas | `ANTHROPIC_API_KEY` absente sur Vercel |
| Crons ignorés | `CRON_SECRET` / `MEDSIM_CRON_SECRET` vide ou différent |
| Ancienne app MDCAT | Mauvais domaine Vercel (`medsin` vs `medsim-roan`) |

---

## Scripts utiles

| Script | Usage |
|--------|--------|
| `scripts/ensure-prod-secrets.mjs` | Génère secrets + URLs prod |
| `scripts/check-env-empty.mjs` | Liste variables vides dans `.env.local` |
| `scripts/mvp-audit.mjs` | Smoke test HTTP multi-rôles |
| `scripts/test-mvp-flows.ts` | Tests intégration métier |
