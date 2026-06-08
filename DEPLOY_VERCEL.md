# Déployer MedSim sur Vercel (inscription fonctionnelle)

Pour que **n'importe qui** puisse créer un compte sur le site hébergé, configurez ces variables dans **Vercel → Projet → Settings → Environment Variables** (environnement **Production**).

## Variables obligatoires

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Chaîne **Neon** (pooler), ex. `postgresql://...@ep-xxx-pooler...neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | Secret long (ex. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL publique du site, ex. `https://votre-projet.vercel.app` (sans slash final) |
| `NEXT_PUBLIC_APP_URL` | **La même URL** que `NEXTAUTH_URL` |

## Variables à ne pas activer en production

| Variable | Valeur attendue |
|----------|-----------------|
| `MEDSIM_DEMO_MODE` | **Absente** ou `false` — sinon l'inscription ne s'enregistre pas en base |

## Après avoir ajouté les variables

1. **Deployments** → dernier déploiement → **Redeploy** (sans cache si possible).
2. Ouvrir `https://votre-projet.vercel.app/api/health`  
   - `ok: true` et `inscription: "ready"` → prêt pour les tests.
3. Tester `https://votre-projet.vercel.app/onboarding/inscription` sur téléphone et PC.

## Où copier DATABASE_URL

Neon → projet **Medsim** → **Connect** → connection string **pooled** → coller dans Vercel.

## Dépannage

| Message à l'inscription | Cause probable |
|-------------------------|----------------|
| Connexion à la base impossible | `DATABASE_URL` manquante ou incorrecte sur Vercel |
| Impossible de créer le compte | Redéployer après avoir fixé les variables ; vérifier `/api/health` |
| Compte créé mais connexion échoue | `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` ≠ URL réelle du site |
