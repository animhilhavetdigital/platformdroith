import Link from 'next/link';
import { Check, ArrowRight, Sparkles, Shield } from 'lucide-react';

const offres = [
  {
    id: '1',
    nom: 'Diagnostic',
    prix: '99',
    prixLabel: '€',
    description: 'Mémoire + Pack de preuves structuré pour agir seul.',
    features: [
      'Analyse IA complète',
      'Rapport PDF mémoire',
      'Pack de preuves ordonnées',
      'Recommandations stratégiques',
    ],
    icon: <Shield size={24} />,
    highlight: false,
  },
  {
    id: '2',
    nom: 'Médiation',
    prix: '199',
    prixLabel: '€',
    description: 'Rapport + Médiation amiable. Droit Habitat prend le relais.',
    features: [
      'Tout inclus dans le Diagnostic',
      'Mise en demeure recommandée',
      'Négociation amiable',
      'Suivi étape par étape',
      'Conciliation avec la partie prenante',
    ],
    icon: <Sparkles size={24} />,
    highlight: true,
  },
];

export default function OffresPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-expertise.png" alt="DroitHabitat" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
            <Sparkles size={14} />
            Éligibilité confirmée
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900">
            Choisissez votre offre
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Un accompagnement adapté à chaque étape de votre dossier.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {offres.map((offre) => (
            <div
              key={offre.id}
              className={`relative flex flex-col rounded-3xl border p-8 transition-all hover:-translate-y-1 hover:shadow-2xl ${
                offre.highlight
                  ? 'border-primary-500 bg-gradient-to-b from-primary-50/50 to-white shadow-xl shadow-primary-200/30'
                  : 'border-gray-100 bg-white shadow-lg shadow-gray-100/50'
              }`}
            >
              {offre.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary-600/20">
                  La plus choisie
                </span>
              )}

              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${offre.highlight ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                {offre.icon}
              </div>

              <h3 className="mt-6 text-center text-xl font-bold text-gray-900">{offre.nom}</h3>
              <p className="mt-1 text-center text-sm text-gray-500">{offre.description}</p>

              <div className="mt-5 text-center">
                <span className="text-4xl font-extrabold text-gray-900">{offre.prix}</span>
                <span className="text-lg font-semibold text-gray-500">{offre.prixLabel}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {offre.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${offre.highlight ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/paiement?offre=${offre.id}`}
                className={`mt-8 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 ${
                  offre.highlight
                    ? 'bg-primary-600 shadow-primary-600/20 hover:bg-primary-700'
                    : 'bg-gray-900 shadow-gray-900/20 hover:bg-gray-800'
                }`}
              >
                Choisir cette offre
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        {/* Garantie */}
        <div className="mt-16 rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Shield size={20} className="text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">Satisfait ou remboursé</h3>
          <p className="mt-2 mx-auto max-w-lg text-sm text-gray-500">
            Si vous n&apos;êtes pas satisfait de votre rapport dans les 7 jours suivant la réception, nous vous remboursons intégralement. Sans justification.
          </p>
        </div>
      </main>
    </div>
  );
}
