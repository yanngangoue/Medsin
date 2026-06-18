import { useState } from 'react'
import Layout from '../components/Layout'

interface Article {
  id: string
  icon: string
  title: string
  summary: string
  tips: string[]
  foods?: string[]
}

interface Category {
  id: string
  icon: string
  label: string
  color: string
  articles: Article[]
}

const CATEGORIES: Category[] = [
  {
    id: 'alimentation',
    icon: '🥗',
    label: 'Alimentation',
    color: '#16a34a',
    articles: [
      {
        id: 'assiette',
        icon: '🍽',
        title: 'L\'assiette santé équilibrée',
        summary: 'Composez chaque repas avec les bonnes proportions pour un apport optimal en nutriments.',
        tips: [
          '½ de l\'assiette : légumes et fruits colorés',
          '¼ de l\'assiette : protéines (légumineuses, volaille, poisson)',
          '¼ de l\'assiette : grains entiers (riz brun, quinoa, avoine)',
          'Huiles saines de préférence (huile d\'olive extra-vierge)',
          'Limitez les aliments ultra-transformés et le sucre ajouté',
        ],
        foods: ['Épinards', 'Brocoli', 'Lentilles', 'Saumon', 'Quinoa', 'Avocat'],
      },
      {
        id: 'proteines',
        icon: '💪',
        title: 'Les protéines de qualité',
        summary: 'Les protéines sont essentielles à la récupération musculaire, à l\'immunité et à la satiété.',
        tips: [
          'Visez 0,8 à 1,6 g de protéines par kg de poids corporel',
          'Variez les sources : animales ET végétales',
          'Répartissez l\'apport sur 3 repas principaux',
          'Privilégiez le poisson gras 2x par semaine (oméga-3)',
        ],
        foods: ['Œufs', 'Pois chiches', 'Tofu', 'Thon', 'Fromage cottage', 'Tempeh'],
      },
      {
        id: 'sucre',
        icon: '🚫',
        title: 'Réduire le sucre ajouté',
        summary: 'L\'OMS recommande de limiter le sucre libre à moins de 10% de l\'apport calorique total.',
        tips: [
          'Lisez les étiquettes : sucrose, fructose, sirop de maïs = sucre',
          'Remplacez les jus par des fruits entiers',
          'Cuisinez à la maison le plus souvent possible',
          'Choisissez des yaourts nature et ajoutez vos propres fruits',
          'Hydratez-vous avec de l\'eau plutôt que des boissons sucrées',
        ],
      },
    ],
  },
  {
    id: 'hydratation',
    icon: '💧',
    label: 'Hydratation',
    color: '#0ea5e9',
    articles: [
      {
        id: 'eau',
        icon: '🥤',
        title: 'L\'hydratation optimale',
        summary: 'L\'eau représente 60% du corps humain et est impliquée dans toutes les fonctions biologiques.',
        tips: [
          'Objectif : 2 à 2,5 litres d\'eau par jour pour un adulte',
          'Augmentez lors d\'effort physique ou de chaleur',
          'L\'urine claire = bonne hydratation',
          'Commencez la journée avec un grand verre d\'eau',
          'Les tisanes non sucrées comptent dans l\'apport hydrique',
        ],
      },
      {
        id: 'caffe',
        icon: '☕',
        title: 'Café & boissons caféinées',
        summary: 'La caféine a des effets positifs et négatifs selon la consommation.',
        tips: [
          'Maximum recommandé : 400 mg/jour (≈ 4 tasses)',
          'Évitez le café après 14h pour ne pas perturber le sommeil',
          'Pas de café à jeun si vous avez un estomac sensible',
          'Les boissons énergisantes sont déconseillées au quotidien',
        ],
      },
    ],
  },
  {
    id: 'activite',
    icon: '🏃',
    label: 'Activité physique',
    color: '#f59e0b',
    articles: [
      {
        id: 'recommandations',
        icon: '📊',
        title: 'Recommandations OMS 2024',
        summary: 'L\'OMS a mis à jour ses recommandations pour un mode de vie actif à tout âge.',
        tips: [
          '150 à 300 min d\'activité modérée par semaine (adultes)',
          'OU 75 à 150 min d\'activité intense par semaine',
          'Exercices de renforcement musculaire ≥ 2x par semaine',
          'Limitez la sédentarité prolongée (bougez toutes les heures)',
          'Même 10 minutes d\'activité sont bénéfiques',
        ],
      },
      {
        id: 'debuter',
        icon: '🎯',
        title: 'Commencer à bouger sans se blesser',
        summary: 'La progressivité est la clé d\'un programme durable et sécuritaire.',
        tips: [
          'Commencez par 10-20 min de marche rapide 3x/semaine',
          'Augmentez de 10% par semaine maximum (règle des 10%)',
          'Échauffez-vous 5 min avant chaque séance',
          'Récupération : au moins 1 jour de repos entre les séances intenses',
          'Consultez votre médecin avant un programme intensif si vous avez des conditions médicales',
        ],
      },
    ],
  },
  {
    id: 'sommeil',
    icon: '😴',
    label: 'Sommeil',
    color: '#8b5cf6',
    articles: [
      {
        id: 'hygiene',
        icon: '🌙',
        title: 'Hygiène du sommeil',
        summary: 'Un sommeil réparateur est aussi important que l\'alimentation pour la santé globale.',
        tips: [
          'Adultes : 7 à 9 heures de sommeil par nuit',
          'Couchez-vous et levez-vous à heure régulière, même le week-end',
          'Chambre fraîche (18-20°C), sombre et silencieuse',
          'Pas d\'écran 1h avant le coucher (lumière bleue)',
          'Évitez l\'alcool et la caféine en soirée',
          'Routine relaxante : lecture, méditation, bain chaud',
        ],
      },
    ],
  },
  {
    id: 'stress',
    icon: '🧘',
    label: 'Gestion du stress',
    color: '#ec4899',
    articles: [
      {
        id: 'meditation',
        icon: '🌿',
        title: 'Techniques de gestion du stress',
        summary: 'Le stress chronique affecte la santé cardiovasculaire, immunitaire et métabolique.',
        tips: [
          'Respiration 4-7-8 : inspirez 4s, retenez 7s, expirez 8s',
          'Méditation de pleine conscience : 10 min/jour suffisent',
          'Journaling : écrire ses pensées pour les extérioriser',
          'Exercice physique : libère des endorphines naturelles',
          'Connexions sociales : l\'isolement amplifie le stress',
          'Application recommandée : Petit Bambou, Calm, Headspace',
        ],
      },
      {
        id: 'sante-mentale',
        icon: '💚',
        title: 'Santé mentale & bien-être',
        summary: 'La santé mentale est une composante essentielle de la santé globale.',
        tips: [
          'Parlez à quelqu\'un de confiance de ce que vous ressentez',
          'Info-Santé (811) : ressource 24/7 pour les questions de santé mentale',
          'Fixez-vous des objectifs réalistes et célébrez les petites victoires',
          'Limitez les réseaux sociaux qui augmentent l\'anxiété',
          'N\'hésitez pas à consulter un professionnel de la santé mentale',
        ],
      },
    ],
  },
]

export default function NutritionalGuidePage() {
  const [activeCategory, setActiveCategory] = useState('alimentation')
  const [openArticle, setOpenArticle] = useState<string | null>(null)

  const cat = CATEGORIES.find(c => c.id === activeCategory)!

  return (
    <Layout>
      <div className="guide-page">

        {/* Hero */}
        <div className="guide-hero">
          <div className="guide-hero-content">
            <div className="guide-hero-badge">📖 Guide gratuit</div>
            <h1>Guide nutritionnel & bien-être Anne</h1>
            <p>Des conseils fondés sur les données probantes pour optimiser votre santé au quotidien. Rédigé par notre équipe d'infirmières praticiennes.</p>
          </div>
        </div>

        <div className="guide-layout">

          {/* Catégories (sidebar) */}
          <div className="guide-cat-sidebar">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                className={`guide-cat-btn ${activeCategory === c.id ? 'guide-cat-active' : ''}`}
                style={{ borderLeftColor: activeCategory === c.id ? c.color : 'transparent' }}
                onClick={() => { setActiveCategory(c.id); setOpenArticle(null) }}
              >
                <span className="guide-cat-icon">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
            <div className="guide-disclaimer">
              <p>Ces informations sont à titre éducatif. Consultez un professionnel de santé pour des conseils personnalisés.</p>
            </div>
          </div>

          {/* Contenu */}
          <div className="guide-content">
            <div className="guide-cat-header" style={{ borderBottom: `3px solid ${cat.color}` }}>
              <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
              <div>
                <h2 style={{ color: cat.color }}>{cat.label}</h2>
                <p>{cat.articles.length} article{cat.articles.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="guide-articles">
              {cat.articles.map(article => (
                <div key={article.id} className={`guide-article ${openArticle === article.id ? 'guide-article-open' : ''}`}>
                  <button
                    type="button"
                    className="guide-article-header"
                    onClick={() => setOpenArticle(openArticle === article.id ? null : article.id)}
                  >
                    <div className="guide-article-title-row">
                      <span className="guide-article-icon">{article.icon}</span>
                      <div>
                        <strong>{article.title}</strong>
                        <p>{article.summary}</p>
                      </div>
                    </div>
                    <span className="guide-article-chevron" style={{ color: openArticle === article.id ? cat.color : 'var(--gray-400)' }}>
                      {openArticle === article.id ? '▲' : '▼'}
                    </span>
                  </button>

                  {openArticle === article.id && (
                    <div className="guide-article-body">
                      <div className="guide-tips">
                        <h4 style={{ color: cat.color }}>Conseils pratiques</h4>
                        <ul>
                          {article.tips.map((tip, i) => (
                            <li key={i}><span className="guide-tip-bullet" style={{ background: cat.color }}>✓</span>{tip}</li>
                          ))}
                        </ul>
                      </div>
                      {article.foods && (
                        <div className="guide-foods">
                          <h4 style={{ color: cat.color }}>Aliments recommandés</h4>
                          <div className="guide-food-tags">
                            {article.foods.map(f => (
                              <span key={f} className="guide-food-tag" style={{ borderColor: cat.color, color: cat.color }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
