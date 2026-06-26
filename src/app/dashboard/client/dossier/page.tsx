import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { FolderOpen } from 'lucide-react';
import DossiersList from './DossiersList';

export default async function ClientDossiersPage() {
  const isPreview = isDevAccessEnabled();
  let dossiers: any[] = [];

  if (isPreview) {
    dossiers = devStore.dossiers.filter((d) => d.client_id === 'preview-client');
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data } = await supabase
        .from('dossiers')
        .select('*')
        .eq('client_id', session.user.id)
        .order('date_creation', { ascending: false });
      
      dossiers = data || [];
    }
  }

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mes dossiers</h1>
          <p className="mt-1 text-gray-500">Consultez l&apos;état d&apos;avancement et gérez l&apos;ensemble de vos dossiers d&apos;expertise juridique</p>
        </div>

        {dossiers.length > 0 ? (
          <DossiersList dossiers={dossiers} />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300 mb-4">
              <FolderOpen size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Aucun dossier actif</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Vous n&apos;avez pas encore de dossier actif. Rendez-vous sur le Tableau de bord pour en ajouter un.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
