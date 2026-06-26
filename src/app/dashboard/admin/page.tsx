import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  PREVIEW_ADMIN_SCENARIOS,
  getPreviewAdminData,
  isDevAccessEnabled,
  normalizePreviewAdminScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { Clock, FolderOpen, Users, ArrowRight } from 'lucide-react';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function AdminDashboard({ searchParams }: Props) {
  let totalDossiers = 0;
  let totalClients = 0;
  let totalNegotiators = 0;
  let recentDossiers: any[] = [];
  let previewStats: any = null;
  const previewScenario = normalizePreviewAdminScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();

  if (isPreview) {
    const previewData = getPreviewAdminData(previewScenario);
    totalDossiers = previewData.totalDossiers;
    totalClients = previewData.totalClients;
    totalNegotiators = previewData.totalNegotiators;
    recentDossiers = previewData.recentDossiers;
    previewStats = previewData.stats;
  } else {
    const supabase = createServerSupabaseClient();

    const [{ count: dossiersCount }, { count: clientsCount }, { count: negotiatorsCount }, { data: dossiersData }] =
      await Promise.all([
        supabase.from('dossiers').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'negotiator'),
        supabase
          .from('dossiers')
          .select('*, client:profiles!dossiers_client_id_fkey(nom, prenom)')
          .order('date_creation', { ascending: false })
          .limit(10),
      ]);

    totalDossiers = dossiersCount || 0;
    totalClients = clientsCount || 0;
    totalNegotiators = negotiatorsCount || 0;
    recentDossiers = dossiersData || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/admin"
            currentScenario={previewScenario}
            scenarios={PREVIEW_ADMIN_SCENARIOS}
            title="Demo admin"
            hubPath="/dashboard/admin"
            hubLabel="Retour au hub admin"
          />
        )}

        <div className="mb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bienvenue dans l&apos;espace Super Admin</h1>
          <p className="text-xs text-slate-400 mt-0.5">Vue d&apos;ensemble de l&apos;activité Droit Habitat</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <StatCard title="Dossiers totaux" value={totalDossiers} icon={<FolderOpen size={16} />} trend={{ value: "+55%", isPositive: true }} />
          <StatCard title="Clients" value={totalClients} icon={<Users size={16} />} trend={{ value: "+5%", isPositive: true }} />
          <StatCard title="Négociateurs" value={totalNegotiators} icon={<Users size={16} />} trend={{ value: "+8%", isPositive: true }} />
          <StatCard title="En attente" value={recentDossiers.filter((dossier) => dossier.statut === 'pieces_attendues').length} icon={<Clock size={16} />} trend={{ value: "-14%", isPositive: false }} />
        </div>

        {isPreview && previewStats && (
          <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
            <MetricCard title="Taux Conversion" value={previewStats.conversionRate} trend={{ value: "+5.4%", isPositive: true }} />
            <MetricCard title="Temps d&apos;analyse" value={previewStats.avgAnalysisHours} trend={{ value: "-8h", isPositive: true }} />
            <MetricCard title="Satisfaction" value={previewStats.satisfaction} trend={{ value: "+0.2", isPositive: true }} />
            <MetricCard title="Récupéré" value={previewStats.recoveredAmount} trend={{ value: "+12k", isPositive: true }} />
          </div>
        )}

        {isPreview && previewStats && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Repartition des statuts */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100/50">
              <h3 className="text-sm font-bold text-slate-800">Répartition des statuts</h3>
              <div className="mt-5 space-y-4">
                {previewStats.statusBreakdown.map((entry: any) => (
                  <div key={entry.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">{entry.label}</span>
                      <span className="font-bold text-slate-800">{entry.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                        style={{ width: `${Math.max(10, entry.value * 18)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume mensuel */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100/50">
              <h3 className="text-sm font-bold text-slate-800">Volume mensuel</h3>
              <div className="mt-5 flex h-48 items-end gap-3 px-2">
                {previewStats.monthlyVolumes.map((value: number, index: number) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-end rounded-t-xl bg-slate-50 h-full">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500"
                        style={{ height: `${Math.max(10, (value / Math.max(...previewStats.monthlyVolumes)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">M{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent dossiers table */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Dossiers récents</h3>
            <a href="/dashboard/admin/dossiers" className="group flex items-center gap-1 text-xs font-bold text-primary-500 hover:text-primary-600">
              Voir tout
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/40">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Référence</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Client</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Offre</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Statut</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {recentDossiers.map((dossier) => {
                  const clientName = `${dossier.client?.prenom || ''} ${dossier.client?.nom || ''}`.trim() || 'Client démo';
                  const initials = `${dossier.client?.prenom?.[0] || ''}${dossier.client?.nom?.[0] || ''}`.toUpperCase() || 'CD';
                  return (
                    <tr key={dossier.id} className="transition-colors hover:bg-slate-50/20">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{dossier.reference}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-[10px] font-bold text-primary-600 shadow-sm shadow-primary-100/50">
                            {initials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{clientName}</p>
                            <p className="text-[10px] font-medium text-slate-400">{dossier.client?.email || 'client@droithabitat.fr'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Médiation' : dossier.offre === '3' ? 'Accompagnement complet' : 'Offre ' + dossier.offre}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-xl px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getStatusColor(dossier.statut)}`}>
                          {getStatusLabel(dossier.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                        {new Date(dossier.date_creation).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: number | string; icon: React.ReactNode; trend?: { value: string; isPositive: boolean } }) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm shadow-primary-100/30 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-800">{value}</span>
            {trend && (
              <span className={`text-[10px] font-bold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.value}
              </span>
            )}
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-md shadow-primary-500/20">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend }: { title: string; value: string; trend?: { value: string; isPositive: boolean } }) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm shadow-primary-100/30">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-lg font-bold text-slate-800">{value}</span>
        {trend && (
          <span className={`text-[10px] font-bold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
