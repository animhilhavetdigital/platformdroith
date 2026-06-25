import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  PREVIEW_ADMIN_SCENARIOS,
  getPreviewAdminData,
  isDevAccessEnabled,
  normalizePreviewAdminScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import UsersContent from './UsersContent';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const previewScenario = normalizePreviewAdminScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();

  let users: any[] = [];

  if (isPreview) {
    const previewData = getPreviewAdminData(previewScenario);
    users = previewData.users;
  } else {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération utilisateurs:', error);
    }

    users = data || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/admin/users"
            currentScenario={previewScenario}
            scenarios={PREVIEW_ADMIN_SCENARIOS}
            title="Demo admin"
            hubPath="/dashboard/admin"
            hubLabel="Retour au hub admin"
          />
        )}

        <UsersContent users={users} isPreview={isPreview} />
      </div>
    </DashboardLayout>
  );
}
