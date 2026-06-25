import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  PREVIEW_NEGOTIATOR_SCENARIOS,
  buildPreviewHref,
  getPreviewNegotiatorData,
  isDevAccessEnabled,
  normalizePreviewNegotiatorScenario,
} from '@/lib/dev-access';

interface Props {
  searchParams?: { scenario?: string };
}

export default function NegotiatorMediationsPage({ searchParams }: Props) {
  const previewScenario = normalizePreviewNegotiatorScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();
  const previewData = isPreview ? getPreviewNegotiatorData(previewScenario) : null;

  return (
    <DashboardLayout allowedRoles={['negotiator', 'super_admin']}>
      <div className="space-y-6">
        {isPreview && previewData && (
          <PreviewScenarioNav
            currentPath="/dashboard/negotiator/mediations"
            currentScenario={previewScenario}
            scenarios={PREVIEW_NEGOTIATOR_SCENARIOS}
            title="Demo negotiateur"
            hubPath="/dashboard/negotiator"
            hubLabel="Retour au hub negociateur"
          />
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mediations</h1>
          <p className="text-gray-500">Vue dediee aux mediations et prochaines actions.</p>
        </div>

        {isPreview && previewData ? (
          <div className="grid gap-4">
            {previewData.mediationQueue.map((item: any) => (
              <a
                key={item.id}
                href={buildPreviewHref(`/dashboard/negotiator/dossiers/${item.id}`, previewScenario)}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{item.reference}</p>
                    <p className="text-sm text-gray-500">{item.clientName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-primary-700">{item.priority}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{item.dueIn}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-700">{item.nextAction}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Cette page est en cours de developpement.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
