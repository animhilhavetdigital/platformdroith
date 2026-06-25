import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  buildPreviewHref,
  getPreviewNegotiatorData,
  isDevAccessEnabled,
  normalizePreviewNegotiatorScenario,
  PREVIEW_NEGOTIATOR_SCENARIOS,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { CheckCircle, Clock, FolderOpen, MessageSquare, ArrowRight, Users } from 'lucide-react';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function NegotiatorDashboard({ searchParams }: Props) {
  let mesDossiers: any[] = [];
  let count = 0;
  let mediationQueue: any[] = [];
  const previewScenario = normalizePreviewNegotiatorScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();

  if (isPreview) {
    const previewData = getPreviewNegotiatorData(previewScenario);
    mesDossiers = previewData.mesDossiers;
    count = previewData.count;
    mediationQueue = previewData.mediationQueue;
  } else {
    const supabase = createServerSupabaseClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, count: rawCount } = await supabase
      .from('dossiers')
      .select('*, client:profiles!dossiers_client_id_fkey(nom, prenom, email, téléphone)', { count: 'exact' })
      .eq('negotiator_id', session?.user.id)
      .eq('offre', '2')
      .order('date_creation', { ascending: false });

    mesDossiers = data || [];
    count = rawCount || 0;
  }

  const stats = {
    total: count,
    mediation: mesDossiers.filter((dossier) => dossier.statut === 'mediation_en_cours').length,
    attente: mesDossiers.filter((dossier) => dossier.statut === 'rapport_genere' || dossier.statut === 'livre').length,
    clotures: mesDossiers.filter((dossier) => dossier.statut === 'cloture').length,
  };

  return (
    <DashboardLayout allowedRoles={['negotiator', 'super_admin']}>
      <div className="space-y-8">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/negotiator"
            currentScenario={previewScenario}
            scenarios={PREVIEW_NEGOTIATOR_SCENARIOS}
            title="Demo negotiateur"
            hubPath="/dashboard/negotiator"
            hubLabel="Retour au hub negociateur"
          />
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Espace Negociateur</h1>
            <p className="mt-2 text-gray-500">Gerez vos dossiers et mediations en temps reel</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Dossiers</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard title="Dossiers assignes" value={stats.total} icon={<FolderOpen size={22} />} color="bg-primary-50 text-primary-600" border="border-primary-100" />
          <StatCard title="Mediations actives" value={stats.mediation} icon={<MessageSquare size={22} />} color="bg-amber-50 text-amber-600" border="border-amber-100" />
          <StatCard title="En attente" value={stats.attente} icon={<Clock size={22} />} color="bg-yellow-50 text-yellow-700" border="border-yellow-100" />
          <StatCard title="Clotures" value={stats.clotures} icon={<CheckCircle size={22} />} color="bg-green-50 text-green-600" border="border-green-100" />
        </div>

        {isPreview && mediationQueue.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">File de priorites</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {mediationQueue.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-bold text-gray-900">{item.reference}</p>
                  <p className="mt-1 text-sm text-gray-500">{item.clientName}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white px-2 py-1 text-gray-700">{item.priority}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-gray-700">{item.dueIn}</span>
                  </div>
                  <p className="mt-3 text-sm text-primary-800">{item.nextAction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Mes dossiers</h2>
            <span className="text-xs font-medium text-gray-400">{mesDossiers.length} resultat(s)</span>
          </div>
          {mesDossiers.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {mesDossiers.map((dossier) => (
                <div key={dossier.id} className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-sm font-bold text-primary-700">
                      {((dossier.client as any)?.prenom?.[0] || '') + ((dossier.client as any)?.nom?.[0] || '')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {(dossier.client as any)?.prenom} {(dossier.client as any)?.nom}
                      </p>
                      <p className="font-mono text-sm text-gray-400">
                        {dossier.reference} - Offre {dossier.offre === '2' ? 'Mediation' : dossier.offre === '3' ? 'Relais avocat' : 'Diagnostic'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(dossier.statut)}`}>
                      {getStatusLabel(dossier.statut)}
                    </span>
                    <a
                      href={isPreview ? buildPreviewHref(`/dashboard/negotiator/dossiers/${dossier.id}`, previewScenario) : `/dashboard/negotiator/dossiers/${dossier.id}`}
                      className="group flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700"
                    >
                      Ouvrir
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                <FolderOpen size={28} className="text-gray-300" />
              </div>
              <p className="mt-4 font-medium text-gray-500">Aucun dossier ne vous est assigne pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color, border }: { title: string; value: number; icon: React.ReactNode; color: string; border: string }) {
  return (
    <div className={`rounded-2xl border ${border} bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
