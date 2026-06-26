import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { FileText, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default async function AdminRapportsPage() {
  const isPreview = isDevAccessEnabled();
  let reports: any[] = [];

  if (isPreview) {
    reports = devStore.dossiers.filter(d => d.rapport_url || d.statut === 'rapport_genere' || d.statut === 'livre');
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('dossiers')
      .select('*, client:profiles!dossiers_client_id_fkey(nom, prenom)')
      .or('statut.eq.rapport_genere,statut.eq.livre,rapport_url.not.is.null');
    reports = data || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Rapports IA d&apos;expertise</h1>
          <p className="mt-1 text-gray-500">Liste des mémoires juridiques et audits générés par l&apos;intelligence artificielle</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Dossier</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Verdict IA</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Score de Confiance</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date Génération</th>
                <th className="w-12 px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((report) => (
                <tr key={report.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">{report.reference}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {report.client ? `${report.client.prenom} ${report.client.nom}` : 'Nadia Alaoui'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-success-600">
                    {report.scoring_verdict === 'OUI' ? 'Potentiel Fort' : 'Potentiel Modéré'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      {report.scoring_confiance || '8'}/10
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {report.date_livraison
                      ? new Date(report.date_livraison).toLocaleDateString('fr-FR')
                      : 'Récemment'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/admin/dossiers/${report.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun rapport généré.
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
