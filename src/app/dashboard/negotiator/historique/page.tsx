import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewNegotiatorData } from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import HistoriqueContent from './HistoriqueContent';

export default async function NegotiatorHistoryPage() {
  const isPreview = isDevAccessEnabled();
  let finishedDossiers: any[] = [];

  if (isPreview) {
    const previewData = getPreviewNegotiatorData('closed');
    finishedDossiers = previewData.mesDossiers || [];
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data } = await supabase
        .from('dossiers')
        .select('*, client:profiles!dossiers_client_id_fkey(nom, prenom)')
        .eq('negotiator_id', session.user.id)
        .in('statut', ['mediation_terminee', 'cloture', 'feedback']);
      
      finishedDossiers = data || [];
    }
  }

  return (
    <DashboardLayout allowedRoles={['negotiator']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Historique des dossiers</h1>
          <p className="mt-1 text-gray-500">Consultez tous vos anciens dossiers d&apos;intervention clôturés ou archivés</p>
        </div>

        <HistoriqueContent finishedDossiers={finishedDossiers} />
      </div>
    </DashboardLayout>
  );
}
