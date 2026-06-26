import { CheckCircle, Clock, FileText, Loader2, Sparkles, ArrowRight, BrainCircuit, Info } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { lancerAnalyse } from './actions';

interface Props {
  searchParams?: { scenario?: string; submitted?: string };
}

export default async function ClientAnalysePage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);

  let dossier: any = null;

  if (isPreview) {
    dossier = getPreviewClientData(previewScenario).dossier;
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/auth/login');
    }

    const { data } = await supabase
      .from('dossiers')
      .select('*, documents(*)')
      .eq('client_id', session.user.id)
      .order('date_creation', { ascending: false })
      .limit(1)
      .single();

    dossier = data;
  }

  const analysisReady = !!dossier?.date_livraison || !!dossier?.rapport_url;
  const waitingOnDocuments = (dossier?.documents?.length || 0) === 0 && !analysisReady;
  const canLaunchAnalysis = dossier?.statut === 'analyse_en_cours' && !analysisReady;

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="mx-auto max-w-7xl space-y-8">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/analyse"
            currentScenario={previewScenario}
          />
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
            <Sparkles size={14} />
            Intelligence Artificielle
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            {analysisReady ? 'Analyse terminee' : 'Analyse en cours'}
          </h1>
          <p className="mt-2 text-gray-500">
            {waitingOnDocuments
              ? 'Le dossier attend encore des pieces pour lancer l analyse.'
              : analysisReady
                ? 'Les conclusions de l analyse sont deja disponibles dans le rapport.'
                : 'Notre IA travaille sur votre dossier en temps reel.'}
          </p>
        </div>

        {searchParams?.submitted && !analysisReady && (
          <div className="rounded-2xl border border-success-200 bg-success-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 text-success-600">
              <Info size={24} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-success-900">Dossier bien reçu</h2>
            <p className="mt-1 text-sm text-success-800">
              Votre formulaire et vos documents ont été transmis. Vous pouvez maintenant lancer l&apos;analyse IA.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-12 text-center shadow-xl shadow-primary-100/30">
          <div className="relative mx-auto mb-8 h-20 w-20">
            {!analysisReady && !waitingOnDocuments && (
              <div className="absolute inset-0 animate-ping rounded-full bg-primary-400 opacity-10" />
            )}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              {waitingOnDocuments ? (
                <FileText className="text-primary-600" size={36} />
              ) : analysisReady ? (
                <CheckCircle className="text-success-600" size={40} />
              ) : (
                <Loader2 className="animate-spin text-primary-600" size={40} />
              )}
            </div>
          </div>
          <p className="text-xl font-bold text-primary-900">
            {waitingOnDocuments
              ? 'En attente des pieces justificatives'
              : analysisReady
                ? 'Analyse finalisee'
                : 'Delai estime : moins de 72h'}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-primary-700">
            {waitingOnDocuments
              ? 'Le lancement de l analyse se declenche une fois les documents essentiels deposes.'
              : analysisReady
                ? 'Les irregularites ont ete consolidees et le memoire juridique est pret pour consultation.'
                : 'Nous analysons vos pieces, extrayons les irregularites et redigeons votre rapport personnalise.'}
          </p>

          {canLaunchAnalysis && (
            <form
              action={async () => {
                'use server';
                await lancerAnalyse(dossier.id);
              }}
              className="mt-8"
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02]"
              >
                <BrainCircuit size={18} />
                Lancer l analyse IA
              </button>
            </form>
          )}

          {analysisReady && (
            <Link
              href="/dashboard/client/rapport"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors"
            >
              Voir mon rapport
              <ArrowRight size={18} />
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-400">
            Recapitulatif
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <CheckCircle size={18} />,
                label: 'Formulaire complete',
                done: !!dossier?.date_formulaire_complete,
              },
              {
                icon: <CheckCircle size={18} />,
                label: 'Documents deposes',
                done: (dossier?.documents?.length || 0) > 0,
              },
              {
                icon: <Clock size={18} />,
                label: analysisReady ? 'Analyse finalisee' : 'Analyse IA en cours',
                done: analysisReady,
              },
              {
                icon: <FileText size={18} />,
                label: 'Rapport genere',
                done: !!dossier?.rapport_url,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 rounded-xl border p-4 ${
                  item.done ? 'border-success-100 bg-success-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    item.done ? 'bg-success-100 text-success-600' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    item.done ? 'text-success-900' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
