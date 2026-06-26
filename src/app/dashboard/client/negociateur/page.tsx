import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewClientData, buildPreviewHref, buildPreviewMediationEtapes } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { initMediationEtapes } from '@/app/dashboard/negotiator/dossiers/[id]/actions';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Download, Handshake, ShieldCheck, Sparkles, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';

interface Props {
  searchParams?: { scenario?: string; id?: string };
}

export default async function ClientNegociateurPage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const previewScenario = isPreview ? (searchParams?.scenario as any) || 'mediation' : undefined;
  const dossierId = searchParams?.id;
  let dossier: any = null;

  if (isPreview) {
    if (dossierId) {
      dossier = devStore.dossiers.find((d) => d.id === dossierId);
    }
    if (!dossier) {
      dossier = getPreviewClientData(previewScenario).dossier;
    }
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      let query = supabase
        .from('dossiers')
        .select('*, documents(*), mediation_etapes(*)')
        .eq('client_id', session.user.id);
      
      if (dossierId) {
        query = query.eq('id', dossierId);
      } else {
        query = query.order('date_creation', { ascending: false }).limit(1);
      }

      const { data } = await query.maybeSingle();
      dossier = data;
    }
  }

  async function handleAutonomyAction(targetDossierId: string) {
    'use server';
    if (isDevAccessEnabled()) {
      const match = devStore.dossiers.find((d) => d.id === targetDossierId);
      if (match) {
        match.statut = 'autonomie';
        match.updated_at = new Date().toISOString();
      }
      redirect('/dashboard/client?message=Mode Autonomie activé');
    } else {
      const supabase = createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('dossiers')
          .update({ statut: 'autonomie' })
          .eq('id', targetDossierId);

        revalidatePath('/dashboard/client');
        redirect('/dashboard/client');
      }
    }
  }

  const isActive = ['mediation_en_cours', 'negociation_payment_pending', 'negociation_paid', 'negociation_en_attente_assignation', 'negociation_en_cours'].includes(dossier?.statut);
  const isDone = ['mediation_terminee', 'negociation_terminee', 'resultat_positif', 'resultat_negatif', 'cloture'].includes(dossier?.statut);
  const isAutonomie = dossier?.statut === 'autonomie';

  let mediationEtapes: any[] = [];
  if (dossier) {
    if (isPreview) {
      const liveEtapes = devStore.mediationEtapes[dossier.id];
      if (liveEtapes && liveEtapes.length > 0) {
        mediationEtapes = [...liveEtapes].sort((a: any, b: any) => a.ordre - b.ordre);
      } else {
        const defaultData = getPreviewClientData(previewScenario).dossier;
        let defaultEtapes: any[] = [];
        if (defaultData && defaultData.id === dossier.id && defaultData.mediation_etapes) {
          defaultEtapes = defaultData.mediation_etapes;
        } else {
          defaultEtapes = buildPreviewMediationEtapes(dossier.id, 2);
        }
        devStore.mediationEtapes[dossier.id] = defaultEtapes;
        mediationEtapes = [...defaultEtapes].sort((a: any, b: any) => a.ordre - b.ordre);
      }
    } else {
      const dbEtapes = dossier.mediation_etapes || [];
      if (isActive && dbEtapes.length === 0) {
        await initMediationEtapes(dossier.id);
        const supabase = createServerSupabaseClient();
        const { data: refreshed } = await supabase
          .from('mediation_etapes')
          .select('*')
          .eq('dossier_id', dossier.id)
          .order('ordre', { ascending: true });
        mediationEtapes = refreshed || [];
      } else {
        mediationEtapes = [...dbEtapes].sort((a: any, b: any) => a.ordre - b.ordre);
      }
    }
  }

  const completedSteps = mediationEtapes.filter((e: any) => e.complete).length;
  const totalSteps = mediationEtapes.length || 5;

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="w-full space-y-8 font-sans">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/negociateur"
            currentScenario={previewScenario}
          />
        )}

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Négociateur</h1>
          <p className="mt-1 text-gray-500 font-medium">Suivez l&apos;intervention de votre négociateur et accédez au rapport final.</p>
        </div>

        {dossier ? (
          <>
            {isActive && (
              <div className="rounded-2xl border border-success-100 bg-success-50/40 p-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Option Négociateur active</h2>
                <p className="text-gray-600 max-w-md mx-auto text-sm font-medium">
                  Un négociateur expérimenté est désormais en charge de votre dossier ({dossier.reference}). Il contacte directement l&apos;organisme de crédit pour obtenir un accord amiable.
                </p>

                {mediationEtapes.length > 0 && (
                  <div className="mx-auto max-w-md rounded-2xl border border-success-200 bg-white p-5 text-left">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-700">Avancement de la médiation</span>
                      <span className="font-bold text-success-700">{completedSteps}/{totalSteps}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-success-100">
                      <div
                        className="h-2 rounded-full bg-success-600 transition-all"
                        style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                      />
                    </div>
                    <ul className="mt-4 space-y-2">
                      {mediationEtapes.map((etape: any) => (
                        <li key={etape.id} className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                          {etape.complete ? (
                            <CheckCircle size={16} className="text-success-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          {etape.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href={isPreview ? buildPreviewHref('/dashboard/client', previewScenario) : '/dashboard/client'}
                    className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-6 py-3 font-bold text-white shadow-md shadow-success-500/10 transition-all hover:bg-success-700"
                  >
                    Retourner au tableau de bord
                  </Link>
                </div>
              </div>
            )}

            {isDone && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-success-100 bg-success-50/40 p-8 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
                    <CheckCircle size={28} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Médiation terminée</h2>
                  <p className="text-gray-600 max-w-md mx-auto text-sm font-medium">
                    Votre négociateur a finalisé le dossier ({dossier.reference}). Vous trouverez ci-dessous le résultat de la négociation et le rapport final.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Résultat de la négociation</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100 text-success-600">
                          <Handshake size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Statut du dossier</p>
                          <p className="text-lg font-bold text-gray-900">
                            {dossier?.statut === 'resultat_negatif' ? 'Non résolu à l\'amiable' : 'Résolution obtenue'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {dossier?.statut === 'resultat_negatif'
                          ? 'La médiation n\'a pas abouti à un accord amiable. Le rapport final détaille les conclusions et les éventuelles pistes restantes.'
                          : 'Un accord amiable a été trouvé avec l\'organisme de crédit. Les modalités sont détaillées dans le rapport final ci-dessous.'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Rapport final du négociateur</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Document final</p>
                          <p className="text-xs text-gray-500">Compte-rendu de médiation</p>
                        </div>
                      </div>
                      <a
                        href={dossier?.rapport_url || '/demo/rapport-final.pdf'}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700"
                      >
                        <Download size={18} />
                        Télécharger le rapport final
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAutonomie && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-gray-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Parcours en autonomie</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      Vous avez choisi de poursuivre seul avec votre rapport pour le dossier {dossier.reference}. Nous vous souhaitons bonne chance dans vos démarches.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isActive && !isDone && !isAutonomie && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                      <Download size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Télécharger mon dossier et continuer seul</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      Récupérez votre mémoire juridique d&apos;expertise et toutes vos pièces. Vous pourrez mener vous-même la réclamation amiable ou contentieuse auprès de l&apos;organisme de crédit.
                    </p>
                    <ul className="space-y-2 text-xs font-bold text-gray-600">
                      <li className="flex items-center gap-2">✓ Mémoire juridique complet</li>
                      <li className="flex items-center gap-2">✓ Modèles de courriers types</li>
                      <li className="flex items-center gap-2">✓ Sans frais supplémentaires</li>
                    </ul>
                  </div>

                  <form action={handleAutonomyAction.bind(null, dossier.id)} className="pt-4">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Continuer en autonomie
                    </button>
                  </form>
                </div>

                <div className="relative rounded-2xl border border-primary-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
                  <div className="absolute -top-3.5 right-6 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    <Sparkles size={10} />
                    Recommandé
                  </div>

                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Handshake size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Demander l&apos;intervention d&apos;un négociateur</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      Un négociateur expérimenté de notre cabinet prend le relais sur votre dossier. Il contacte directement l&apos;organisme de crédit, gère les échanges officiels et cherche un accord.
                    </p>
                    <ul className="space-y-2 text-xs font-bold text-gray-600">
                      <li className="flex items-center gap-2">✓ Négociateur dédié affecté</li>
                      <li className="flex items-center gap-2">✓ Relances et suivi d&apos;accord officiel</li>
                      <li className="flex items-center gap-2">✓ Rapport de médiation final fourni</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-baseline justify-between border-t border-gray-50 pt-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarif optionnel</span>
                      <span className="text-xl font-extrabold text-primary-600">199 €</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Le paiement s&apos;effectue depuis la page Mon rapport après avoir consulté votre mémoire juridique.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500 font-semibold">Aucun dossier actif trouvé pour cette étape.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
