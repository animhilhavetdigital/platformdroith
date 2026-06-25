import { CheckCircle, Clock, FileText, Loader2, Sparkles } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function ClientAnalysePage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);
  const dossier = isPreview ? getPreviewClientData(previewScenario).dossier : null;
  const analysisReady = !!dossier?.date_livraison || !!dossier?.rapport_url;
  const waitingOnDocuments = dossier?.documents?.length === 0;

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
                done: !!dossier?.date_formulaire_complete || !isPreview,
              },
              {
                icon: <CheckCircle size={18} />,
                label: 'Documents deposes',
                done: (dossier?.documents?.length || 0) > 0 || !isPreview,
              },
              {
                icon: <Clock size={18} />,
                label: analysisReady ? 'Analyse finalisee' : 'Analyse IA en cours',
                done: analysisReady,
              },
              {
                icon: <FileText size={18} />,
                label: 'Rapport genere',
                done: !!dossier?.rapport_url || !isPreview,
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
