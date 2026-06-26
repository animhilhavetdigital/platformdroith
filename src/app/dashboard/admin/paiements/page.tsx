import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import PaiementsContent from './PaiementsContent';
import type { Dossier } from '@/types';

export default async function AdminPaiementsPage() {
  const isPreview = isDevAccessEnabled();
  let payments: any[] = [];
  let dossierMap = new Map<string, Dossier>();

  if (isPreview) {
    payments = devStore.clientsPayes || [];
    devStore.dossiers.forEach((d) => dossierMap.set(d.id, d));
  } else {
    const supabase = createServerSupabaseClient();

    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    payments = paymentsData || [];

    const { data: dossiersData } = await supabase
      .from('dossiers')
      .select('*');
    (dossiersData || []).forEach((d: any) => dossierMap.set(d.id, d as Dossier));
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <PaiementsContent payments={payments} dossierMap={dossierMap} />
    </DashboardLayout>
  );
}
