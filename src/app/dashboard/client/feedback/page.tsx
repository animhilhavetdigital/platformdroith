import { redirect } from 'next/navigation';
import { CheckCircle, MessageSquare, Send, Star } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function ClientFeedbackPage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);
  const dossier = isPreview ? getPreviewClientData(previewScenario).dossier : null;

  if (!isPreview) {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');
  }

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="w-full space-y-8">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/feedback"
            currentScenario={previewScenario}
          />
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
            <MessageSquare size={14} />
            Votre avis compte
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-gray-900">Questionnaire qualite</h1>
          <p className="mt-2 text-gray-500">Comment s&apos;est passee votre experience ?</p>
        </div>

        {isPreview && dossier && (
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-6 py-4 text-sm text-sky-900">
            Retour fictif rattache au dossier <span className="font-mono font-bold">{dossier.reference}</span>.
            Cette page est presente pour la demonstration visuelle du dernier ecran du parcours.
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100/50">
          <form className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">Note globale</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm"
                  >
                    <Star className="text-gray-300 hover:text-primary-400" size={22} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Qu&apos;avez-vous apprecie ?
              </label>
              <textarea
                rows={3}
                defaultValue="La lisibilite du dossier, le rythme des notifications et la clarte du rapport."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Que pourrions-nous ameliorer ?
              </label>
              <textarea
                rows={3}
                defaultValue="Ajouter davantage d exemples concrets pour la suite a donner apres le rapport."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-primary-200">
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Je recommanderais Droit Habitat
              </span>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02]"
            >
              <Send size={18} />
              Envoyer mon avis
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-success-100 bg-gradient-to-br from-success-50 to-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100">
            <CheckCircle className="text-success-600" size={28} />
          </div>
          <p className="mt-4 text-lg font-bold text-success-900">
            Merci d&apos;avoir utilise Droit Habitat.
          </p>
          <p className="mt-1 text-sm text-success-700">Votre dossier est cloture et oriente.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
