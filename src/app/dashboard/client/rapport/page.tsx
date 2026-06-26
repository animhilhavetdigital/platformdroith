import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Download, FileText, Shield, Sparkles, Scale, UserCheck, CheckCircle, ArrowLeft, ArrowRight, User } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { formatDate, getDossierCardTheme } from '@/lib/utils';
import { choisirAutonomie } from './actions';
import PaymentTrigger from './PaymentTrigger';

interface Props {
  searchParams?: { scenario?: string; id?: string };
}

export default async function ClientRapportPage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);

  let dossier: any = null;
  let clientDossiers: any[] = [];

  if (isPreview) {
    // In preview mode, load the selected scenario dossier to populate devStore
    const scenarioDossier = getPreviewClientData(previewScenario).dossier;
    clientDossiers = devStore.dossiers.filter((d) => d.client_id === 'preview-client');

    if (searchParams?.id) {
      dossier = devStore.dossiers.find((d) => d.id === searchParams.id);
    }
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/auth/login');
    }

    if (searchParams?.id) {
      const { data } = await supabase
        .from('dossiers')
        .select('*, client:profiles!dossiers_client_id_fkey(*), negotiator:profiles!dossiers_negotiator_id_fkey(*)')
        .eq('client_id', session.user.id)
        .eq('id', searchParams.id)
        .single();

      dossier = data;
    } else {
      const { data } = await supabase
        .from('dossiers')
        .select('*, client:profiles!dossiers_client_id_fkey(*), negotiator:profiles!dossiers_negotiator_id_fkey(*)')
        .eq('client_id', session.user.id)
        .order('date_creation', { ascending: false });

      clientDossiers = data || [];
    }
  }

  // Helper to build links while preserving the preview scenario if present
  const getLinkHref = (path: string, dossierId?: string) => {
    if (isPreview) {
      const url = new URL(path, 'http://preview.local');
      url.searchParams.set('scenario', previewScenario);
      if (dossierId) {
        url.searchParams.set('id', dossierId);
      }
      return `${url.pathname}?${url.searchParams.toString()}`;
    }
    return dossierId ? `${path}?id=${dossierId}` : path;
  };

  // If no specific dossier ID is selected, display the list of all available reports
  if (!searchParams?.id) {
    const dossiersAvecRapport = clientDossiers.filter((d) => 
      d.rapport_url || 
      (d.rapport_data && Object.keys(d.rapport_data).length > 0) ||
      ['rapport_genere', 'livre', 'mediation_en_cours', 'autonomie', 'cloture', 'mediation_terminee'].includes(d.statut)
    );

    return (
      <DashboardLayout allowedRoles={['client']}>
        <div className="w-full space-y-6">
          {isPreview && (
            <PreviewScenarioNav
              currentPath="/dashboard/client/rapport"
              currentScenario={previewScenario}
            />
          )}

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mes rapports</h1>
            <p className="mt-2 text-gray-500">
              Accédez à vos rapports d&apos;analyse juridique et suivez les conclusions pour chacun de vos dossiers.
            </p>
          </div>

          {dossiersAvecRapport.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xl shadow-gray-100/50">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <FileText size={40} className="text-gray-300" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-gray-900">Aucun rapport disponible</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
                Vos mémoires d&apos;expertise s&apos;afficheront ici dès que l&apos;analyse IA ou l&apos;intervention du négociateur aura généré un rapport.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {dossiersAvecRapport.map((d) => {
                const isMediationReport = !!d.negotiator_id;
                const reportTitle = d.rapport_data?.title 
                  ? (isMediationReport && (d.rapport_data.title.toLowerCase().includes('mémoire') || d.rapport_data.title.toLowerCase().includes('memoire'))
                      ? 'Compte-rendu de médiation' 
                      : d.rapport_data.title)
                  : (isMediationReport ? 'Compte-rendu de médiation' : 'Mémoire juridique de contestation');

                const createdDate = new Date(d.date_creation).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const reportTheme = isMediationReport ? getDossierCardTheme('médiation_en_cours') : getDossierCardTheme('analyse_en_cours');

                return (
                  <div 
                    key={d.id}
                    className={`rounded-2xl border ${reportTheme.border} ${reportTheme.gradient} p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                  >
                    <div className="space-y-4">
                      {/* Badge and Ref */}
                      <div className="flex items-center justify-between border-b border-white/60 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                          Dossier : {d.reference}
                        </span>
                        <div className={`inline-flex items-center gap-1 text-xs font-bold ${reportTheme.actionText} ${reportTheme.stepBg} px-2.5 py-1 rounded-full`}>
                          {isMediationReport ? (
                            <>
                              <User size={12} />
                              Négociateur Expert
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} />
                              Analyse IA
                            </>
                          )}
                        </div>
                      </div>

                      {/* Info body */}
                      <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{reportTitle}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {d.rapport_data?.summary || (isMediationReport ? 'Consultez les conclusions de votre compte-rendu de médiation.' : 'Consultez les conclusions détaillées de ce mémoire juridique.')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 pt-2">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider">Créé le</p>
                          <p className="text-gray-700 mt-0.5">{createdDate}</p>
                        </div>
                        {d.formulaire_data?.organisme && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider">Organisme</p>
                            <p className="text-gray-700 mt-0.5 truncate">{d.formulaire_data.organisme}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/60 flex items-center justify-between gap-3">
                      <Link
                        href={getLinkHref('/dashboard/client/rapport', d.id)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border ${reportTheme.border} bg-white text-xs font-bold text-gray-900 py-3 transition-colors hover:bg-slate-50 shadow-sm`}
                      >
                        {isMediationReport ? 'Consulter le compte-rendu' : 'Consulter le mémoire'}
                        <ArrowRight size={14} />
                      </Link>

                      {d.rapport_url && (
                        <a
                          href={d.rapport_url}
                          download
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${reportTheme.arrowBg} ${reportTheme.arrowText} transition-colors`}
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // If searchParams.id is present, render the detailed report view
  const reportData = (dossier?.rapport_data as Record<string, unknown>) || {};
  const irregularities = Array.isArray(reportData.irregularities)
    ? (reportData.irregularities as string[])
    : [];
  const recommendations = Array.isArray(reportData.recommendations)
    ? (reportData.recommendations as string[])
    : [];

  const isMediationReport = !!dossier?.negotiator_id;
  const hasInitialReport = dossier?.rapport_url || irregularities.length > 0;
  const isMediationActive = dossier?.statut === 'mediation_en_cours';
  const isMediationDone = dossier?.statut === 'mediation_terminee';
  const isAutonomie = dossier?.statut === 'autonomie';
  const showNegotiatorOption = hasInitialReport && !isMediationActive && !isMediationDone && !isAutonomie;

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="w-full space-y-6">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/rapport"
            currentScenario={previewScenario}
          />
        )}

        <Link
          href={getLinkHref('/dashboard/client/rapport')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Retour aux rapports
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isMediationReport ? 'Compte-rendu de médiation' : 'Mémoire juridique'}
          </h1>
          <p className="mt-2 text-gray-500">
            {isMediationReport
              ? 'Consultez le compte-rendu de la médiation menée par votre négociateur'
              : 'Consultez le mémoire juridique et choisissez la suite à donner pour ce dossier'}
          </p>
        </div>

        {!hasInitialReport ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xl shadow-gray-100/50">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-gray-900">Rapport en préparation</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
              Le rapport d&apos;analyse est en cours de modélisation pour ce dossier.
            </p>
          </div>
        ) : (
          <>
            {/* Rapport initial */}
            <div className="rounded-2xl border border-success-100 bg-white p-8 shadow-xl shadow-gray-100/50">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-success-700 font-sans">
                    <Shield size={14} />
                    {isMediationReport ? 'Rapport de médiation disponible' : 'Rapport IA disponible'}
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900 font-sans">
                    {isMediationReport
                      ? (reportData.title && (String(reportData.title).toLowerCase().includes('mémoire') || String(reportData.title).toLowerCase().includes('memoire'))
                          ? 'Compte-rendu de médiation'
                          : (reportData.title as string) || 'Compte-rendu de médiation')
                      : (reportData.title as string) || 'Mémoire juridique de contestation'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 font-sans">
                    {(reportData.summary as string) || 'Le dossier est consolidé.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500 font-sans">
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-mono">
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

                <div className="flex flex-col gap-3 font-sans">
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

            <div className="grid gap-6 md:grid-cols-2 font-sans">
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
              <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 shadow-sm font-sans">
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
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm font-sans">
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
              <div className="rounded-2xl border border-success-100 bg-success-50 p-6 shadow-sm font-sans">
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
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm font-sans">
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
