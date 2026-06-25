import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Download, FileText, Shield } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

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
  const orientationHref = isPreview
    ? buildPreviewHref('/dashboard/client/orientation', previewScenario)
    : '/dashboard/client/orientation';

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
            Consultez et telechargez votre memoire juridique
          </p>
        </div>

        {dossier?.rapport_url || irregularities.length > 0 ? (
          <>
            <div className="rounded-2xl border border-success-100 bg-white p-8 shadow-xl shadow-gray-100/50">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-success-700">
                    <Shield size={14} />
                    Rapport disponible
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">
                    {(reportData.title as string) || 'Memoire juridique de contestation'}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                    {(reportData.summary as string) ||
                      'Le dossier est consolide avec un rapport fictif de demonstration.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      Reference: {dossier.reference}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      Genere le {formatDate((reportData.generated_at as string) || dossier.updated_at)}
                    </span>
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
                      PDF de demonstration
                    </div>
                  ) : (
                    <a
                      href={dossier.rapport_url}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700"
                    >
                      <Download size={16} />
                      Telecharger le PDF
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Irregularites retenues
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

            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary-900">Etape suivante</h3>
              <p className="mt-2 text-sm text-primary-800">
                Le rapport est pret. Vous pouvez maintenant choisir si vous souhaitez agir
                seul, demander une mediation ou transmettre le dossier a un avocat.
              </p>
              <Link
                href={orientationHref}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700"
              >
                Choisir la suite
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xl shadow-gray-100/50">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-gray-900">Rapport en preparation</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
              Votre rapport sera disponible ici une fois l&apos;analyse terminee. Vous recevrez
              une notification par email.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
              <Shield size={14} />
              Document securise et confidentiel
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
