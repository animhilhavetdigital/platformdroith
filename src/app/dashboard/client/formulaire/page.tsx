import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import FormulaireForm from './FormulaireForm';
import { resetFormulaire } from './actions';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function ClientFormulairePage({ searchParams }: Props) {
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

  const isComplete = !!dossier?.date_formulaire_complete;
  const data = (dossier?.formulaire_data as Record<string, unknown>) || {};
  const dashboardHref = isPreview
    ? buildPreviewHref('/dashboard/client', previewScenario)
    : '/dashboard/client';
  const analyseHref = isPreview
    ? buildPreviewHref('/dashboard/client/analyse', previewScenario)
    : '/dashboard/client/analyse';

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="mx-auto max-w-7xl space-y-6">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/formulaire"
            currentScenario={previewScenario}
          />
        )}

        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Retour au tableau de bord
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulaire initial</h1>
          <p className="text-gray-500">Renseignez les informations de votre dossier</p>
        </div>

        {isPreview ? (
          <div className="space-y-6">
            {!isComplete ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
                  <strong>Mode Démo :</strong> Vous pouvez remplir ce formulaire interactif pour tester l&apos;expérience client.
                </div>
                {dossier ? (
                  <FormulaireForm dossierId={dossier.id} initialData={dossier.formulaire_data as Record<string, unknown>} />
                ) : (
                  <p className="text-gray-500">Aucun dossier trouvé.</p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-success-200 bg-success-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-success-600" size={24} />
                    <div>
                      <h2 className="text-lg font-semibold text-success-900">
                        Formulaire de démonstration complété
                      </h2>
                      <p className="text-sm text-success-800">
                        Aperçu des données saisies en mode démo.
                      </p>
                    </div>
                  </div>
                  <form
                    action={async () => {
                      'use server';
                      await resetFormulaire(dossier.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-xl border border-success-300 bg-white px-3 py-1.5 text-xs font-bold text-success-700 shadow-sm transition-all hover:bg-success-100"
                    >
                      Recommencer
                    </button>
                  </form>
                </div>

                <div className="space-y-3 text-sm text-success-900">
                  {Object.entries(data).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-6 border-b border-success-200 pb-2"
                    >
                      <span className="capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="max-w-md text-right font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm text-success-800">
                  Pour la suite du parcours, consultez l&apos;étape{' '}
                  <Link href={isPreview ? buildPreviewHref('/dashboard/client/analyse', previewScenario) : '/dashboard/client/analyse'} className="font-medium underline">
                    Analyse en cours
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        ) : isComplete ? (
          <div className="rounded-2xl border border-success-200 bg-success-50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle className="text-success-600" size={24} />
              <h2 className="text-lg font-semibold text-success-900">
                Formulaire deja complete
              </h2>
            </div>
            <div className="space-y-3 text-sm text-success-900">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-success-200 pb-2">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-success-800">
              Votre dossier est en attente d&apos;analyse. Rendez-vous sur{' '}
              <Link href={isPreview ? buildPreviewHref('/dashboard/client/analyse', previewScenario) : '/dashboard/client/analyse'} className="font-medium underline">
                Analyse en cours
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {dossier ? (
              <FormulaireForm dossierId={dossier.id} />
            ) : (
              <p className="text-gray-500">
                Aucun dossier trouve. Veuillez contacter l&apos;administration.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
