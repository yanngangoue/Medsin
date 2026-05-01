import { LandingSectionImage } from "@/components/LandingSectionImage";

const TRUST_IMAGE =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&q=90";
const RESULTS_IMAGE =
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=900&q=90";
const NUTRITION_IMAGE =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=90";
const WELLBEING_IMAGE =
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=90";

const sectionShell =
  "mt-16 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm shadow-slate-200/40 backdrop-blur-[2px]";

export function LandingHighlights() {
  return (
    <>
      <div className={sectionShell}>
        <h2 className="text-base font-semibold text-slate-900">Une équipe médicale de confiance</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Des médecins souriants et à l’écoute, dans un environnement clinique clair et rassurant — comme une
          consultation en présentiel.
        </p>
        <LandingSectionImage
          src={TRUST_IMAGE}
          alt="Médecine souriante en blouse blanche, cadre lumineux et professionnel"
          aspect="four-three"
          className="mt-6"
        />
      </div>

      <div className={sectionShell}>
        <h2 className="text-base font-semibold text-slate-900">Des résultats qui vous ressemblent</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Avancez avec confiance : un sourire naturel, une lumière douce et un accompagnement pensé pour votre bien-être
          durable.
        </p>
        <LandingSectionImage
          src={RESULTS_IMAGE}
          alt="Femme confiante et souriante, portrait lumineux à la lumière douce"
          aspect="video"
          className="mt-6"
        />
      </div>

      <div className={sectionShell}>
        <h2 className="text-base font-semibold text-slate-900">Nutrition et mode de vie</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Une alimentation colorée et équilibrée pour soutenir votre parcours — fraîche, simple et motivante au
          quotidien.
        </p>
        <LandingSectionImage
          src={NUTRITION_IMAGE}
          alt="Assiette colorée de légumes et aliments frais, repas équilibré et appétissant"
          aspect="four-three"
          className="mt-6"
        />
      </div>

      <div className={sectionShell}>
        <h2 className="text-base font-semibold text-slate-900">Bien-être et sérénité</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Prenez un moment pour vous : détente, lumière naturelle et calme — le bon équilibre entre objectifs de santé et
          douceur au quotidien.
        </p>
        <LandingSectionImage
          src={WELLBEING_IMAGE}
          alt="Femme détendue dans un cadre lumineux évoquant le wellness et la sérénité"
          aspect="video"
          className="mt-6"
        />
      </div>
    </>
  );
}
