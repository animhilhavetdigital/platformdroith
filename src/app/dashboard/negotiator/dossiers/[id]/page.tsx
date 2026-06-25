import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, Calendar, XCircle, CheckCircle } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  PREVIEW_NEGOTIATOR_SCENARIOS,
  buildPreviewHref,
  getPreviewNegotiatorDossierById,
  isDevAccessEnabled,
  normalizePreviewNegotiatorScenario,
} from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { initMediationEtapes, updateDossierStatut, genererRapportFinal } from './actions';
import EtapesForm from './EtapesForm';

interface Props {
  params: { id: string };
  searchParams?: { scenario?: string };
}

export default async function NegotiatorDossierDetail({ params, searchParams }: Props) {
  let dossier: any = null;
  const previewScenario = normalizePreviewNegotiatorScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();

  if (isPreview) {
    dossier = getPreviewNegotiatorDossierById(params.id, previewScenario);
  } else {
    const supabase = createServerSupabaseClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data } = await supabase
      .from('dossiers')
      .select('*, client:profiles!dossiers_client_id_fkey(nom, prenom, téléphone, email), mediation_etapes(*)')
      .eq('id', params.id)
      .eq('negotiator_id', session?.user.id)
      .eq('offre', '2')
      .single();

    dossier = data;
  }

  if (!dossier) {
    notFound();
  }

  let etapes = (dossier.mediation_etapes as any[]) || [];

  if (isPreview) {
    const liveEtapes = devStore.mediationEtapes[params.id];
    if (liveEtapes) {
      etapes = [...liveEtapes];
    }
    etapes = etapes.sort((a, b) => a.ordre - b.ordre);
  } else if (etapes.length === 0) {
    await initMediationEtapes(params.id);
    const supabase = createServerSupabaseClient();
    const { data: refreshed } = await supabase
      .from('mediation_etapes')
      .select('*')
      .eq('dossier_id', params.id)
      .order('ordre', { ascending: true });
    etapes = refreshed || [];
  } else {
    etapes = etapes.sort((a, b) => a.ordre - b.ordre);
  }

  const client = dossier.client as any;
  const completedSteps = etapes.filter((etape) => etape.complete).length;
  const progress = etapes.length > 0 ? Math.round((completedSteps / etapes.length) * 100) : 0;
  const backHref = isPreview
    ? buildPreviewHref('/dashboard/negotiator', previewScenario)
    : '/dashboard/negotiator';

  return (
    <DashboardLayout allowedRoles={['negotiator']}>
      <div className="space-y-8">
        {isPreview && (
          <PreviewScenarioNav
            currentPath={`/dashboard/negotiator/dossiers/${params.id}`}
            currentScenario={previewScenario}
            scenarios={PREVIEW_NEGOTIATOR_SCENARIOS}
            title="Demo negotiateur"
            hubPath="/dashboard/negotiator"
            hubLabel="Retour au hub negociateur"
          />
        )}

        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500 shadow-sm transition-colors hover:border-gray-200 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Retour aux dossiers
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900">{dossier.reference}</h1>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(dossier.statut)}`}>
                {getStatusLabel(dossier.statut)}
              </span>
            </div>
            <p className="text-sm text-gray-500">Mediation - Offre 2</p>
          </div>
          {dossier.statut === 'mediation_en_cours' && (
            <div className="flex items-center gap-3">
              <form
                action={async () => {
                  'use server';
                  await genererRapportFinal(params.id, 'positif');
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-success-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success-600/20 transition-all hover:scale-[1.02] hover:bg-success-700"
                >
                  <CheckCircle size={16} />
                  Accord positif
                </button>
              </form>
              <form
                action={async () => {
                  'use server';
                  await genererRapportFinal(params.id, 'negatif');
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-danger-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-danger-600/20 transition-all hover:scale-[1.02] hover:bg-danger-700"
                >
                  <XCircle size={16} />
                  Négatif — Relais avocat
                </button>
              </form>
            </div>
          )}
          {dossier.statut !== 'mediation_en_cours' && dossier.statut !== 'cloture' && (
            <form
              action={async () => {
                'use server';
                await updateDossierStatut(params.id, 'cloture');
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-[1.02] hover:bg-gray-800"
              >
                <XCircle size={16} />
                Cloturer le dossier
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">Client</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {client?.prenom} {client?.nom}
                  </span>
                </div>
                {client?.téléphone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                      <Phone size={18} />
                    </div>
                    <span className="text-sm text-gray-600">{client.téléphone}</span>
                  </div>
                )}
                {client?.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                      <Mail size={18} />
                    </div>
                    <span className="text-sm text-gray-600">{client.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <span className="text-sm text-gray-600">
                    Cree le {new Date(dossier.date_creation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">Informations</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant paye</span>
                  <span className="font-bold text-gray-900">{dossier.montant_paye ? `${dossier.montant_paye} EUR` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scoring</span>
                  <span className="font-bold text-gray-900">{dossier.scoring_verdict || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Progression</span>
                  <span className="font-bold text-primary-600">{progress}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Suivi de la mediation</h2>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                  {completedSteps}/{etapes.length} etapes
                </span>
              </div>
              <EtapesForm dossierId={params.id} etapes={etapes} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
