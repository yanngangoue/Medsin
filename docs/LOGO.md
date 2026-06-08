# Logo officiel MedSim

Le logo entreprise est le **mot-symbole « MedSim »** en typographie sans-serif grasse, fond **transparent**.

## Fichiers sources

| Fichier | Usage |
|---------|--------|
| [`docs/logo/medsim-logo.svg`](logo/medsim-logo.svg) | Version principale (vert sur fond clair) |
| [`docs/logo/medsim-logo-white.svg`](logo/medsim-logo-white.svg) | Version fond sombre (footer, hero) |

Copies servies par l’application : `public/brand/medsim-logo.svg` et `public/brand/medsim-logo-white.svg`.

## Spécifications

- **Texte** : `MedSim` (M et S majuscules)
- **Couleur principale** : `#1D9E75`
- **Couleur sur fond sombre** : `#FFFFFF`
- **Fond** : transparent (aucun encadré)
- **Police** : Inter Bold (ou équivalent sans-serif système dans les SVG)

## Utilisation dans le code

Composant React : `components/MedsimLogo.tsx`  
Constantes : `lib/brand/medsim-logo.ts`

```tsx
import { MedsimLogo } from "@/components/MedsimLogo";

<MedsimLogo />
<MedsimLogo variant="onDark" />
```

## Règles

- Ne pas modifier les couleurs officielles sans mise à jour de ce document et des SVG.
- Ne pas ajouter d’ombre, de contour ni de fond au logo.
- Conserver un espace libre minimal autour du mot-symbole (hauteur du « M »).
