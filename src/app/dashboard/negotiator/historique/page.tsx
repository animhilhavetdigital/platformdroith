import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewNegotiatorData } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { History, Search, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

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

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Référence</th>
                <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
                <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</th>
                <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
                <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date Clôture</th>
                <th className="w-12 px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {finishedDossiers.map((dossier) => (
                <tr key={dossier.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-4 py-4 text-sm font-bold text-gray-900 font-mono">{dossier.reference}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        {dossier.client ? `${dossier.client.prenom} ${dossier.client.nom}` : 'Nadia Alaoui'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                    {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Médiation' : dossier.offre === '3' ? 'Accompagnement complet' : 'Médiation'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dossier.statut)}`}>
                      {getStatusLabel(dossier.statut)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400">
                    {dossier.date_cloture
                      ? new Date(dossier.date_cloture).toLocaleDateString('fr-FR')
                      : 'Récemment'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/dashboard/negotiator/dossiers/${dossier.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {finishedDossiers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                    Aucun dossier historique trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
