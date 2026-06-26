import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import NegociateursContent from './NegociateursContent';
import type { Profile } from '@/types';

interface NegotiatorWithCount extends Profile {
  dossierCount: number;
}

export default async function AdminNegociateursPage() {
  const isPreview = isDevAccessEnabled();
  let negotiators: NegotiatorWithCount[] = [];

  if (isPreview) {
    const profiles = devStore.profiles.filter((p) => p.role === 'negotiator');
    negotiators = profiles.map((p) => ({
      ...p,
      dossierCount: devStore.dossiers.filter((d) => d.negotiator_id === p.id).length,
    }));
  } else {
    const supabase = createServerSupabaseClient();

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'negotiator')
      .order('created_at', { ascending: false });

    const { data: dossiers } = await supabase
      .from('dossiers')
      .select('negotiator_id');

    const countByNegotiator = new Map<string, number>();
    (dossiers || []).forEach((d: any) => {
      if (d.negotiator_id) {
        countByNegotiator.set(d.negotiator_id, (countByNegotiator.get(d.negotiator_id) || 0) + 1);
      }
    });

    negotiators = (profiles || []).map((p: any) => ({
      ...p,
      dossierCount: countByNegotiator.get(p.id) || 0,
    }));
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <NegociateursContent negotiators={negotiators} />
    </DashboardLayout>
  );
}
