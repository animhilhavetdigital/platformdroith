import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  PREVIEW_ADMIN_SCENARIOS,
  getPreviewAdminData,
  isDevAccessEnabled,
  normalizePreviewAdminScenario,
} from '@/lib/dev-access';
import UsersContent from './UsersContent';

interface Props {
  searchParams?: { scenario?: string };
}

export default function AdminUsersPage({ searchParams }: Props) {
  const previewScenario = normalizePreviewAdminScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();
  const previewData = isPreview ? getPreviewAdminData(previewScenario) : null;

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {isPreview && previewData && (
          <PreviewScenarioNav
            currentPath="/dashboard/admin/users"
            currentScenario={previewScenario}
            scenarios={PREVIEW_ADMIN_SCENARIOS}
            title="Demo admin"
            hubPath="/dashboard/admin"
            hubLabel="Retour au hub admin"
          />
        )}

        {isPreview && previewData ? (
          <UsersContent data={previewData} />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Liste des utilisateurs en cours de developpement.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
