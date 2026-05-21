/** Portraits souriants — grille mosaïque (photos distinctes de la référence MEDVi). */
export type Glp1GalleryPortrait = {
  id: string;
  src: string;
  alt: string;
  heightClass: string;
};

export const GLP1_GALLERY_COLUMNS: readonly (readonly Glp1GalleryPortrait[])[] = [
  [
    {
      id: "p1",
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=85",
      alt: "Femme souriante, heureuse de son parcours santé",
      heightClass: "h-[155px] sm:h-[185px]",
    },
    {
      id: "p2",
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=85",
      alt: "Femme riant, confiante après sa transformation",
      heightClass: "h-[210px] sm:h-[250px]",
    },
  ],
  [
    {
      id: "p3",
      src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=85",
      alt: "Femme souriante en tenue décontractée",
      heightClass: "h-[110px] sm:h-[130px]",
    },
    {
      id: "p4",
      src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&q=85",
      alt: "Femme active et souriante, fière de ses progrès",
      heightClass: "h-[230px] sm:h-[270px]",
    },
    {
      id: "p7",
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=85",
      alt: "Femme célébrant une étape de son parcours",
      heightClass: "h-[115px] sm:h-[135px]",
    },
  ],
  [
    {
      id: "p5",
      src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=85",
      alt: "Homme souriant, satisfait de son accompagnement",
      heightClass: "h-[175px] sm:h-[205px]",
    },
    {
      id: "p6",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=85",
      alt: "Homme confiant et souriant",
      heightClass: "h-[250px] sm:h-[290px]",
    },
  ],
] as const;

export const GLP1_GALLERY_BULLETS = [
  "Pas d'abonnement surprise : votre parcours inclut le suivi médical et l'accompagnement essentiel.",
  "Sans assurance obligatoire — livraison discrète incluse",
  "Consultations diététiques et soutien en soins inclus dans votre dossier",
  "Accompagnement encadré par des professionnels de santé licenciés",
] as const;
