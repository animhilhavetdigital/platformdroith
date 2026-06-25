import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, FileText, Trash2, Upload } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Document } from '@/types';
import { deleteDocument } from './actions';
import UploadForm from './UploadForm';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function ClientDocumentsPage({ searchParams }: Props) {
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
      .select('*, documents(*)')
      .eq('client_id', session.user.id)
      .order('date_creation', { ascending: false })
      .limit(1)
      .single();

    dossier = data;
  }

  const documents: Document[] = dossier?.documents || [];
  const dashboardHref = isPreview
    ? buildPreviewHref('/dashboard/client', previewScenario)
    : '/dashboard/client';

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="mx-auto max-w-7xl space-y-8">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/documents"
            currentScenario={previewScenario}
          />
        )}

        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500 shadow-sm transition-colors hover:border-gray-200 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Retour au tableau de bord
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mes documents</h1>
          <p className="mt-2 text-gray-500">Deposez les pieces justificatives de votre dossier</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Upload size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Ajouter un document</h2>
          </div>

          {dossier ? (
            <>
              {isPreview && (
                <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
                  <strong>Mode Démo :</strong> Vous pouvez déposer un ou plusieurs fichiers factices pour simuler l&apos;envoi de pièces justificatives.
                </div>
              )}
              <UploadForm dossierId={dossier.id} formulaireData={dossier.formulaire_data} />
            </>
          ) : (
            <p className="text-gray-500">Aucun dossier trouve.</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                <FileText size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Documents deposes</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              {documents.length}
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                <FileText size={24} className="text-gray-300" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">
                Aucun document pour le moment.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Utilisez le scenario Analyse ou Rapport pour voir une liste complete de pieces fictives.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-primary-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <FileText size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{doc.nom_fichier}</p>
                      <p className="text-xs capitalize text-gray-400">
                        {doc.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <form
                    action={async () => {
                      'use server';
                      await deleteDocument(doc.id, doc.storage_path);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-xl p-2.5 text-gray-300 transition-colors hover:bg-danger-50 hover:text-danger-600"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
