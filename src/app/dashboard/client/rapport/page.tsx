import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Download, FileText, Shield, Sparkles, Scale, UserCheck, CheckCircle } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { choisirAutonomie } from './actions';
import PaymentTrigger from './PaymentTrigger';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function ClientRapportPage({ searchParams }: Props) {
  let dossier: any = null;
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);

  if (isPreview) {
    dossier = getPreviewClientData(previewScenario).dossier;
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/auth/login');
    }

    const { data } = await supabase
      .from('dossiers')
      .select('*')
      .eq('client_id', session.user.id)
      .order('date_creation', { ascending: false })
      .limit(1)
      .single();

    dossier = data;
  }

  const reportData = (dossier?.rapport_data as Record<string, unknown>) || {};
  const irregularities = Array.isArray(reportData.irregularities)
    ? (reportData.irregularities as string[])
    : [];
  const recommendations = Array.isArray(reportData.recommendations)
    ? (reportData.recommendations as string[])
    : [];

  const hasInitialReport = dossier?.rapport_url || irregularities.length > 0;
  const isMediationActive = dossier?.statut === 'mediation_en_cours';
  const isMediationDone = dossier?.statut === 'mediation_terminee';
  const isAutonomie = dossier?.statut === 'autonomie';
  const showNegotiatorOption = hasInitialReport && !isMediationActive && !isMediationDone && !isAutonomie;

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="mx-auto max-w-7xl space-y-6">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/rapport"
            currentScenario={previewScenario}
          />
        )}

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mon rapport</h1>
          <p className="mt-2 text-gray-500">
            Consultez votre mémoire juridique et choisissez la suite à donner à votre dossier
          </p>
        </div>

        {!hasInitialReport ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xl shadow-gray-100/50">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-gray-900">Rapport en préparation</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
              Votre rapport sera disponible ici une fois l&apos;analyse terminée.
            </p>
          </div>
        ) : (
          <>
            {/* Rapport initial */}
            <div className="rounded-2xl border border-success-100 bg-white p-8 shadow-xl shadow-gray-100/50">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-success-700">
                    <Shield size={14} />
                    Rapport IA disponible
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">
                    {(reportData.title as string) || 'Mémoire juridique de contestation'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                    {(reportData.summary as string) || 'Le dossier est consolidé avec un rapport de démonstration.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      Référence: {dossier.reference}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      Généré le {formatDate((reportData.generated_at as string) || dossier.updated_at)}
                    </span>
                    {dossier.scoring_confiance && (
                      <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-700">
                        Confiance: {dossier.scoring_confiance}/10
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Verdict</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {(reportData.verdict as string) || 'Analyse positive'}
                    </p>
                  </div>

                  {isPreview ? (
                    <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-5 py-3 text-sm font-bold text-gray-500">
                      <Download size={16} />
                      PDF de démonstration
                    </div>
                  ) : (
                    <a
                      href={dossier.rapport_url || '/demo/rapport.pdf'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700"
                    >
                      <Download size={16} />
                      Télécharger le PDF
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Irrégularités retenues
                </h3>
                <ul className="mt-4 space-y-3">
                  {irregularities.map((item) => (
                    <li key={item} className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Recommandations
                </h3>
                <ul className="mt-4 space-y-3">
                  {recommendations.map((item) => (
                    <li key={item} className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-900">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Options après rapport */}
            {showNegotiatorOption && (
              <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-primary-900">Vous souhaitez être accompagné ?</h3>
                <p className="mt-2 text-sm text-primary-800">
                  Un négociateur Droit Habitat peut prendre le relais pour une conciliation amiable avec votre organisme de crédit.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <PaymentTrigger dossierId={dossier.id} />

                  <form
                    action={async () => {
                      'use server';
                      await choisirAutonomie(dossier.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-white px-5 py-3.5 text-sm font-bold text-primary-700 shadow-sm transition-all hover:bg-primary-100"
                    >
                      <UserCheck size={18} />
                      Télécharger mon dossier — Autonomie
                    </button>
                  </form>
                </div>
              </div>
            )}

            {isMediationActive && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-amber-600" />
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">Médiation en cours</h3>
                    <p className="text-sm text-amber-800">
                      Un négociateur travaille sur votre dossier. Vous recevrez un rapport final dès que la médiation sera terminée.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isMediationDone && (
              <div className="rounded-2xl border border-success-100 bg-success-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-success-600" />
                  <div>
                    <h3 className="text-lg font-bold text-success-900">Médiation terminée</h3>
                    <p className="text-sm text-success-800">
                      Votre négociateur a finalisé le dossier. Le rapport final est disponible ci-dessus.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isAutonomie && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <UserCheck size={20} className="text-gray-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Parcours en autonomie</h3>
                    <p className="text-sm text-gray-600">
                      Vous avez choisi de poursuivre seul avec votre rapport. Nous vous souhaitons bonne chance dans vos démarches.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
