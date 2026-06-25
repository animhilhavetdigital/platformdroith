import DashboardLayout from '@/components/layout/DashboardLayout';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { CheckCircle, Clock, FileText, Upload, Shield, ArrowRight, Star, AlertCircle, FileCheck } from 'lucide-react';
import Link from 'next/link';
import ProgressionMediation from '@/components/ProgressionMediation';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function ClientDashboard({ searchParams }: Props) {
  let dossier: any = null;
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);
  const isPreview = isDevAccessEnabled();

  if (isPreview) {
    dossier = getPreviewClientData(previewScenario).dossier;
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data } = await supabase
      .from('dossiers')
      .select('*, documents(*), mediation_etapes(*)')
      .eq('client_id', session?.user.id)
      .order('date_creation', { ascending: false })
      .limit(1)
      .single();

    dossier = data;
  }

  const getClientHref = (path: string) => (isPreview ? buildPreviewHref(path, previewScenario) : path);

  const isMediation = dossier?.offre === '2' || dossier?.offre === '3';
  const showOrientation = ['livre', 'rapport_genere', 'orientation_en_cours'].includes(dossier?.statut);
  const showFeedback = ['autonomie', 'mediation_terminee', 'avocat', 'cloture', 'feedback'].includes(dossier?.statut);

  const steps = [
    { label: 'Formulaire', done: !!dossier?.date_formulaire_complete, current: dossier?.statut === 'formulaire_en_cours' || dossier?.statut === 'nouveau' || dossier?.statut === 'onboarding' },
    { label: 'Documents', done: !!dossier?.date_upload_complete, current: dossier?.statut === 'pieces_attendues' },
    { label: 'Analyse', done: !!dossier?.date_livraison || dossier?.statut === 'rapport_genere', current: dossier?.statut === 'analyse_en_cours' },
    { label: 'Rapport', done: dossier?.statut === 'livre' || dossier?.statut === 'orientation_en_cours' || showFeedback, current: dossier?.statut === 'rapport_genere' },
    ...(isMediation ? [{ label: 'Médiation', done: dossier?.statut === 'mediation_terminee' || dossier?.statut === 'cloture', current: dossier?.statut === 'mediation_en_cours' }] : []),
    ...(showFeedback ? [{ label: 'Clôture', done: dossier?.statut === 'cloture', current: dossier?.statut === 'feedback' }] : []),
  ];

  let mediationEtapes = (dossier?.mediation_etapes as any[])?.sort((a: any, b: any) => a.ordre - b.ordre) || [];

  if (isDevAccessEnabled() && dossier?.id) {
    const liveEtapes = devStore.mediationEtapes[dossier.id];
    if (liveEtapes) {
      mediationEtapes = [...liveEtapes].sort((a, b) => a.ordre - b.ordre);
    }
  }

  const currentStepIndex = steps.findIndex((s) => s.current) ?? 0;

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="space-y-8">
        {isPreview && (
          <PreviewScenarioNav currentPath="/dashboard/client" currentScenario={previewScenario} />
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mon dossier</h1>
            <p className="mt-1 text-gray-500">Suivez l&apos;avancement de votre analyse en temps réel</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Référence</p>
            <p className="text-sm font-bold text-gray-900 font-mono">{dossier?.reference || 'N/A'}</p>
          </div>
        </div>

        {/* Progression moderne */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-400">Progression</h2>
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={step.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                      step.done
                        ? 'border-success-500 bg-success-500 text-white'
                        : step.current
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-200 bg-white text-gray-300'
                    }`}
                  >
                    {step.done ? <CheckCircle size={22} /> : step.current ? <div className="h-3 w-3 rounded-full bg-primary-600 animate-pulse" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <span className={`mt-3 text-xs font-semibold ${step.done || step.current ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-2 h-1.5 flex-1 rounded-full ${step.done ? 'bg-success-500' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {dossier ? (
          <>
            {/* Cartes statut + actions */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Statut */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <AlertCircle size={20} />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Statut actuel</h2>
                </div>
                <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${getStatusColor(dossier.statut)}`}>
                  {getStatusLabel(dossier.statut)}
                </span>
                {dossier.scoring_verdict && (
                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Score de conformité</span>
                      <span className="text-sm font-bold text-gray-900">{dossier.scoring_confiance || 'N/A'}/10</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${((dossier.scoring_confiance || 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Délai */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock size={20} />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Délai estimé</h2>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {dossier.statut === 'analyse_en_cours' ? '< 48h' : 'À déterminer'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {dossier.statut === 'analyse_en_cours' ? 'Notre équipe analyse votre dossier' : 'Selon l&apos;avancement'}
                </p>
              </div>

              {/* Offre */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
                    <FileCheck size={20} />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Offre souscrite</h2>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">
                  {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Médiation' : dossier.offre === '3' ? 'Relais Avocat' : 'N/A'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {dossier.offre === '1' ? '99 €' : dossier.offre === '2' ? '199 €' : dossier.offre === '3' ? '399 €' : ''}
                </p>
              </div>
            </div>

            {/* Actions principales */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">Actions disponibles</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {!dossier.date_formulaire_complete && (
                  <Link
                    href={getClientHref('/dashboard/client/formulaire')}
                    className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-primary-200 hover:bg-primary-50 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200">
                      <FileText size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">Compléter le formulaire</p>
                      <p className="text-sm text-gray-500 truncate">Informations essentielles du dossier</p>
                    </div>
                    <ArrowRight size={18} className="shrink-0 text-gray-300 transition-colors group-hover:text-primary-500" />
                  </Link>
                )}

                <Link
                  href={getClientHref('/dashboard/client/documents')}
                  className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-primary-200 hover:bg-primary-50 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200">
                    <Upload size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">Ajouter des documents</p>
                    <p className="text-sm text-gray-500 truncate">{dossier.documents?.length || 0} document(s) déposés</p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-gray-300 transition-colors group-hover:text-primary-500" />
                </Link>

                {dossier.statut === 'analyse_en_cours' && (
                  <Link
                    href={getClientHref('/dashboard/client/analyse')}
                    className="group flex items-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-5 transition-all hover:border-amber-200 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <Clock size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-amber-900">Analyse en cours</p>
                      <p className="text-sm text-amber-700 truncate">Délai maximum 72 heures</p>
                    </div>
                    <ArrowRight size={18} className="shrink-0 text-amber-400" />
                  </Link>
                )}

                {showOrientation && (
                  <Link
                    href={getClientHref('/dashboard/client/orientation')}
                    className="group flex items-center gap-4 rounded-xl border border-primary-100 bg-primary-50 p-5 transition-all hover:border-primary-200 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      <Shield size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary-900">Choisir la suite</p>
                      <p className="text-sm text-primary-700 truncate">Autonomie, Médiation ou Avocat</p>
                    </div>
                    <ArrowRight size={18} className="shrink-0 text-primary-400" />
                  </Link>
                )}

                {dossier.rapport_url && (
                  <Link
                    href={getClientHref('/dashboard/client/rapport')}
                    className="group flex items-center gap-4 rounded-xl border border-success-100 bg-success-50 p-5 transition-all hover:border-success-200 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-600">
                      <FileCheck size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-success-900">Voir mon rapport</p>
                      <p className="text-sm text-success-700 truncate">PDF disponible en téléchargement</p>
                    </div>
                    <ArrowRight size={18} className="shrink-0 text-success-400" />
                  </Link>
                )}

                {showFeedback && (
                  <Link
                    href={getClientHref('/dashboard/client/feedback')}
                    className="group flex items-center gap-4 rounded-xl border border-primary-100 bg-primary-50 p-5 transition-all hover:border-primary-200 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                      <Star size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary-900">Questionnaire qualité</p>
                      <p className="text-sm text-primary-700 truncate">Comment s&apos;est passée l&apos;expérience ?</p>
                    </div>
                    <ArrowRight size={18} className="shrink-0 text-primary-400" />
                  </Link>
                )}
              </div>
            </div>

            {/* Médiation */}
            {isMediation && mediationEtapes.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-400">Suivi de la médiation</h2>
                <ProgressionMediation etapes={mediationEtapes} readOnly />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <FileText size={28} className="text-gray-300" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">Aucun dossier trouvé</h3>
            <p className="mt-2 text-gray-500">Commencez votre analyse en remplissant le formulaire d&apos;éligibilité.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-105"
            >
              Commencer mon dossier
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
