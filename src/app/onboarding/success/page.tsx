import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle, Mail, Lock, FileText, ArrowRight, Copy } from 'lucide-react';

interface Props {
  searchParams: { email?: string; password?: string; reference?: string };
}

export default function OnboardingSuccessPage({ searchParams }: Props) {
  const { email, password, reference } = searchParams;

  if (!email || !password || !reference) {
    redirect('/offres');
  }

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
            Bienvenue chez Droit Habitat. Votre compte et votre dossier ont été créés avec succès.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100/50">
          <h2 className="text-lg font-bold text-gray-900">Vos identifiants</h2>
          <p className="mt-1 text-sm text-gray-500">
            Conservez ces informations pour accéder à votre espace. Un email et un SMS de confirmation vous ont été envoyés (simulation).
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Mot de passe temporaire</p>
                  <p className="text-sm font-semibold text-gray-900">{password}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Référence dossier</p>
                  <p className="text-sm font-semibold text-gray-900">{reference}</p>
                </div>
              </div>
            </div>
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
