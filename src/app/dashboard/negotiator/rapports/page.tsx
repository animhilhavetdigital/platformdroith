import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  PREVIEW_NEGOTIATOR_SCENARIOS,
  buildPreviewHref,
  getPreviewNegotiatorData,
  isDevAccessEnabled,
  normalizePreviewNegotiatorScenario,
} from '@/lib/dev-access';
import { formatDate, getStatusLabel } from '@/lib/utils';

interface Props {
  searchParams?: { scenario?: string };
}

export default function NegotiatorRapportsPage({ searchParams }: Props) {
  const previewScenario = normalizePreviewNegotiatorScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();
  const previewData = isPreview ? getPreviewNegotiatorData(previewScenario) : null;

  return (
    <DashboardLayout allowedRoles={['negotiator', 'super_admin']}>
      <div className="space-y-6">
        {isPreview && previewData && (
          <PreviewScenarioNav
            currentPath="/dashboard/negotiator/rapports"
            currentScenario={previewScenario}
            scenarios={PREVIEW_NEGOTIATOR_SCENARIOS}
            title="Demo negotiateur"
            hubPath="/dashboard/negotiator"
            hubLabel="Retour au hub negociateur"
          />
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500">Rapports et analyses des dossiers.</p>
        </div>

        {isPreview && previewData ? (
          <div className="grid gap-4">
            {previewData.reportQueue.map((item: any) => (
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
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-700">{getStatusLabel(item.status)}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.updatedAt)}</p>
                  </div>
                </div>
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
