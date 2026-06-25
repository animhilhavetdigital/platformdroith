import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { FileCheck, Search, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default async function AdminNegociationsPage() {
  const isPreview = isDevAccessEnabled();
  let dossiersMediation: any[] = [];
  let negotiators: any[] = [];

  if (isPreview) {
    dossiersMediation = devStore.dossiers.filter(d => ['mediation_en_cours', 'mediation_terminee', 'negociation_paid', 'negociation_en_cours'].includes(d.statut));
    negotiators = devStore.profiles.filter(p => p.role === 'negotiator');
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('dossiers')
      .select('*, client:profiles!dossiers_client_id_fkey(nom, prenom)')
      .in('statut', ['mediation_en_cours', 'mediation_terminee', 'negociation_paid', 'negociation_en_cours']);
    dossiersMediation = data || [];

    const { data: negs } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'negotiator');
    negotiators = negs || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Suivi des négociations</h1>
          <p className="mt-1 text-gray-500">Supervision des dossiers confiés aux négociateurs d&apos;arbitrage</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Dossier</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Négociateur Assigné</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
                <th className="w-12 px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dossiersMediation.map((dossier) => {
                const assigned = negotiators.find(n => n.id === dossier.negotiator_id);
                return (
                  <tr key={dossier.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">{dossier.reference}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {dossier.client ? `${dossier.client.prenom} ${dossier.client.nom}` : 'Nadia Alaoui'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {assigned ? `${assigned.prenom} ${assigned.nom}` : (
                        <span className="text-amber-600 font-bold text-xs uppercase bg-amber-50 px-2 py-0.5 rounded">
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Médiation' : 'Avocat'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dossier.statut)}`}>
                        {getStatusLabel(dossier.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/super-admin/dossiers/${dossier.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {dossiersMediation.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun dossier en cours de négociation.
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
