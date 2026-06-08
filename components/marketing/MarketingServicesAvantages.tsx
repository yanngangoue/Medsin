import Image from "next/image";

const BLOCKS = [
  {
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400",
    title: "100% en ligne",
    text: "Consultation, prescription et suivi depuis chez vous. Sans salle d'attente, sans déplacement.",
    highlighted: false,
  },
  {
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    title: "Traitement personnalisé",
    text: "Ozempic, Wegovy ou générique — prescrit par une IPS certifiée selon votre profil unique.",
    highlighted: false,
  },
  {
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400",
    title: "Livraison discrète",
    text: "Votre médicament livré à domicile en emballage discret. Ordonnance PDF téléchargeable incluse.",
    highlighted: false,
  },
  {
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400",
    title: "Suivi hebdomadaire avec Anne",
    text: "Votre coach IA vous contacte chaque semaine — proactivement. Jamais seul dans votre parcours.",
    highlighted: true,
  },
] as const;

export function MarketingServicesAvantages() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="text-center text-3xl font-black tracking-tight text-[#1A1A2E] sm:text-4xl md:text-5xl">
          Tout ce dont vous avez besoin, au même endroit
        </h2>

        <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {BLOCKS.map((block) => (
            <article
              key={block.title}
              className={`rounded-2xl transition-shadow hover:shadow-md ${
                block.highlighted ? "border-2 border-[#3EBD93] p-1" : ""
              }`}
            >
              <div className={`flex h-full flex-col ${block.highlighted ? "rounded-xl bg-white p-3" : ""}`}>
                <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={block.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3 className="mt-4 font-semibold text-[#1D4D3A]">{block.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{block.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
