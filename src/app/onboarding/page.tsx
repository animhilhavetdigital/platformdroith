import Link from 'next/link';
import { ArrowRight, CheckCircle, FileText, Upload, BrainCircuit, FileCheck } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-expertise.png" alt="DroitHabitat" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 pt-32 pb-20">
        <div className="rounded-3xl border border-success-200 bg-gradient-to-br from-success-50 to-white p-10 text-center shadow-xl shadow-success-200/20">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
            <CheckCircle className="text-success-600" size={40} />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-success-900">
            Votre dossier est ouvert !
          </h1>
          <p className="mt-3 text-success-700">
            Bienvenue chez Droit Habitat. Votre espace personnel est prêt et sécurisé.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100/50">
          <h2 className="text-lg font-bold text-gray-900">Prochaines étapes</h2>
          <div className="mt-6 space-y-4">
            {[
              { num: 1, icon: <FileText size={18} />, text: 'Remplissez le formulaire initial de votre dossier' },
              { num: 2, icon: <Upload size={18} />, text: 'Téléchargez vos contrats, relevés et preuves' },
              { num: 3, icon: <BrainCircuit size={18} />, text: 'Notre IA analyse votre dossier sous 72h' },
              { num: 4, icon: <FileCheck size={18} />, text: 'Recevez votre rapport et choisissez la suite' },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-primary-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-sm">
                  {step.num}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-gray-400">{step.icon}</span>
                  <span className="font-medium">{step.text}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/auth/login"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02]"
          >
            Accéder à mon espace
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </div>
  );
}
