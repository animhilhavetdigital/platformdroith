import { CheckCircle, FileText, Loader2, Sparkles, ArrowRight, Info } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { lancerAnalyse } from './actions';

interface Props {
  searchParams?: { scenario?: string; submitted?: string; id?: string };
}

export default async function ClientAnalysePage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);
  const dossierId = searchParams?.id;

  let dossier: any = null;

  if (isPreview) {
    if (dossierId) {
      dossier = devStore.dossiers.find((d) => d.id === dossierId);
    }
    if (!dossier) {
      dossier = getPreviewClientData(previewScenario).dossier;
    }
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/auth/login');
    }

    let query = supabase.from('dossiers').select('*, documents(*)').eq('client_id', session.user.id);
    if (dossierId) {
      query = query.eq('id', dossierId);
    } else {
      query = query.order('date_creation', { ascending: false }).limit(1);
    }

    const { data } = await query.maybeSingle();
    dossier = data;
  }

  const analysisReady = !!dossier?.date_livraison || !!dossier?.rapport_url;
  const waitingOnDocuments = (dossier?.documents?.length || 0) === 0 && !analysisReady;
  const canLaunchAnalysis = dossier?.statut === 'analyse_en_cours' && !analysisReady;

  const getRapportHref = () => {
    if (!dossier) return '/dashboard/client/rapport';
    if (isPreview) {
      return buildPreviewHref('/dashboard/client/rapport', previewScenario) + `&id=${dossier.id}`;
    }
    return `/dashboard/client/rapport?id=${dossier.id}`;
  };

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="w-full space-y-8 font-sans">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/analyse"
            currentScenario={previewScenario}
          />
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-bold text-primary-700">
            <Sparkles size={14} />
            Intelligence Artificielle
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            {analysisReady ? 'Analyse terminée' : 'Analyse en cours'}
          </h1>
          <p className="mt-2 text-gray-500">
            {waitingOnDocuments
              ? 'Le dossier attend encore des pièces pour lancer l\'analyse.'
              : analysisReady
                ? 'Les conclusions de l\'analyse sont déjà disponibles dans le rapport.'
                : 'Notre IA travaille sur votre dossier en temps réel.'}
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
          <p className="text-xl font-black text-primary-900">
            {waitingOnDocuments
              ? 'En attente des pièces justificatives'
              : analysisReady
                ? 'Analyse finalisée'
                : 'Analyse en cours'}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-primary-700 font-medium">
            {waitingOnDocuments
              ? 'Une fois vos documents déposés, l\'analyse de votre dossier sera lancée automatiquement (délai estimé : 72h).'
              : analysisReady
                ? 'Les irrégularités ont été consolidées et le mémoire juridique est prêt pour consultation.'
                : 'Votre dossier est en cours d\'analyse. Notre IA et nos experts analysent vos pièces (délai estimé : 72h).'}
          </p>

          {analysisReady && (
            <Link
              href={getRapportHref()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors"
            >
              Voir mon rapport
              <ArrowRight size={18} />
            </Link>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
