import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import ClientsContent from './ClientsContent';
import type { Dossier } from '@/types';

export interface UnifiedClientRow {
  type: 'pending' | 'existing';
  id: string;
  prenom: string;
  nom: string;
  email: string;
  phone: string;
  offer: '1' | '2' | '3' | null;
  amount: number;
  status: 'pending' | 'added' | 'active';
  date: string;
  dossierId?: string;
}

function offerPrice(offre: '1' | '2' | '3' | null): number {
  if (offre === '1') return 99;
  if (offre === '2') return 199;
  return 0;
}

function formatOffer(offre: '1' | '2' | '3' | null): string {
  if (offre === '1') return 'Diagnostic';
  if (offre === '2') return 'Médiation';
  return 'N/A';
}

export default async function AdminClientsPage() {
  const isPreview = isDevAccessEnabled();
  const rows: UnifiedClientRow[] = [];

  if (isPreview) {
    const pending = devStore.clientsPayes.filter((p) => p.platform_status === 'to_create');
    pending.forEach((p) => {
      rows.push({
        type: 'pending',
        id: p.id,
        prenom: p.client_first_name,
        nom: p.client_last_name,
        email: p.client_email,
        phone: p.client_phone,
        offer: p.offer_type,
        amount: p.amount,
        status: 'pending',
        date: p.created_at,
      });
    });

    devStore.profiles
      .filter((p) => p.role === 'client')
      .forEach((profile) => {
        const dossier = devStore.dossiers.find((d) => d.client_id === profile.id);
        const payment = devStore.clientsPayes.find((p) => p.user_id === profile.id);
        rows.push({
          type: 'existing',
          id: profile.id,
          prenom: profile.prenom,
          nom: profile.nom,
          email: profile.email || payment?.client_email || 'client@preview.local',
          phone: profile.téléphone || payment?.client_phone || '—',
          offer: dossier?.offre || payment?.offer_type || null,
          amount: dossier?.montant_paye || payment?.amount || offerPrice(dossier?.offre || null),
          status: profile.status === 'active' ? 'active' : 'added',
          date: profile.created_at,
          dossierId: dossier?.id,
        });
      });
  } else {
    const supabase = createServerSupabaseClient();

    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('platform_status', 'to_create')
      .order('created_at', { ascending: false });

    const { data: clients } = await supabase
      .from('profiles')
      .select('*, dossiers(*)')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    const { data: payments } = await supabase.from('payments').select('*');

    const paymentByUserId = new Map<string, any>();
    (payments || []).forEach((p: any) => {
      if (p.user_id) paymentByUserId.set(p.user_id, p);
    });

    (pendingPayments || []).forEach((p: any) => {
      rows.push({
        type: 'pending',
        id: p.id,
        prenom: p.client_first_name,
        nom: p.client_last_name,
        email: p.client_email,
        phone: p.client_phone,
        offer: p.offer_type,
        amount: p.amount,
        status: 'pending',
        date: p.created_at,
      });
    });

    (clients || []).forEach((profile: any) => {
      const dossiers: any[] = profile.dossiers || [];
      const dossier = dossiers[0] as Dossier | undefined;
      const payment = paymentByUserId.get(profile.id);
      rows.push({
        type: 'existing',
        id: profile.id,
        prenom: profile.prenom,
        nom: profile.nom,
        email: payment?.client_email || '—',
        phone: profile.telephone || profile.téléphone || payment?.client_phone || '—',
        offer: dossier?.offre || payment?.offer_type || null,
        amount: dossier?.montant_paye || payment?.amount || offerPrice(dossier?.offre || null),
        status: profile.status === 'active' ? 'active' : 'added',
        date: profile.created_at,
        dossierId: dossier?.id,
      });
    });
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <ClientsContent rows={rows} />
    </DashboardLayout>
  );
}
