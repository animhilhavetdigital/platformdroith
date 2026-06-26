import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  PREVIEW_ADMIN_SCENARIOS,
  getPreviewAdminData,
  isDevAccessEnabled,
  normalizePreviewAdminScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import DossiersContent from './DossiersContent';
import { FileCheck, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Dossier } from '@/types';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function AdminDossiersPage({ searchParams }: Props) {
  const previewScenario = normalizePreviewAdminScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();

  let dossiers: Dossier[] = [];

  if (isPreview) {
    const previewData = getPreviewAdminData(previewScenario);
    dossiers = previewData.dossiers;
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('dossiers')
      .select('*, client:profiles!dossiers_client_id_fkey(*), negotiator:profiles!dossiers_negotiator_id_fkey(*)')
      .order('date_creation', { ascending: false });
    dossiers = (data as Dossier[] | null) || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/admin/dossiers"
            currentScenario={previewScenario}
            scenarios={PREVIEW_ADMIN_SCENARIOS}
            title="Demo admin"
            hubPath="/dashboard/admin"
            hubLabel="Retour au hub admin"
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/admin/negociations"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            <FileCheck size={16} />
            Dossiers en négociation
          </Link>
          <Link
            href="/dashboard/admin/rapports"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            <FileText size={16} />
            Rapports IA
          </Link>
        </div>

        <DossiersContent dossiers={dossiers} scenario={isPreview ? previewScenario : undefined} />
      </div>
    </DashboardLayout>
  );
}
