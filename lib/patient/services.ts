import { SERVICE_SECTION_ANCHORS } from "@/lib/patient/service-landing-paths";

export const PATIENT_SERVICE_CARDS = [
  {
    id: "gestion-poids",
    title: "Gestion du poids",
    subtitle: "GLP-1, suivi médical et assistant IA proactif",
    href: SERVICE_SECTION_ANCHORS["gestion-poids"],
    image: "https://images.unsplash.com/photo-1745939921744-ba8ef27940bf?w=640&q=80",
    imageAlt: "Stylo injectable GLP-1 pour la gestion du poids, sur ordonnance",
    panelClass: "bg-[#e8f5f0]",
  },
] as const;
