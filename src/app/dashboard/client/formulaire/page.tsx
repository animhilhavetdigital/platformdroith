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
  const documentsHref = isPreview
    ? buildPreviewHref('/dashboard/client/documents', previewScenario)
    : '/dashboard/client/documents';

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
          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle className="text-sky-600" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isComplete ? 'Formulaire de demonstration complete' : 'Brouillon de demonstration'}
                </h2>
                <p className="text-sm text-gray-500">
                  Apercu non interactif du formulaire client avec des donnees fictives.
                </p>
              </div>
            </div>

            {Object.keys(data).length > 0 ? (
              <div className="space-y-3 text-sm text-gray-700">
                {Object.entries(data).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-6 border-b border-gray-100 pb-2"
                  >
                    <span className="capitalize text-gray-500">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="max-w-md text-right font-medium text-gray-900">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
                Ce scenario represente un dossier qui n&apos;a pas encore commence la saisie du formulaire.
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500">
              Pour la suite du parcours, ouvrez l&apos;etape{' '}
              <Link href={documentsHref} className="font-medium text-primary-700 underline">
                Documents
              </Link>
              .
            </p>
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
              Vous pouvez maintenant{' '}
              <Link href={documentsHref} className="font-medium underline">
                deposer vos documents
              </Link>{' '}
              si ce n&apos;est pas deja fait.
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
