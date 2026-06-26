import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewClientData } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { FileCheck, Save, ArrowLeft, Star, FileText } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

interface Props {
  params: { id: string };
}

export default async function NegotiatorReportPage({ params }: Props) {
  const isPreview = isDevAccessEnabled();
  let dossier: any = null;

  if (isPreview) {
    dossier = devStore.dossiers.find(d => d.id === params.id) || devStore.dossiers[0];
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('dossiers')
      .select('*')
      .eq('id', params.id)
      .single();
    dossier = data;
  }

  async function handleReportSubmit(formData: FormData) {
    'use server';

    const resume = formData.get('resume') as string;
    const actions = formData.get('actions') as string;
    const interlocuteur = formData.get('interlocuteur') as string;
    const reponse = formData.get('reponse') as string;
    const verdict = formData.get('verdict') as string; // 'positif' | 'negatif'
    const prochaine_etape = formData.get('prochaine_etape') as string;

    const report_data = {
      resume,
      actions: actions.split('\n').filter(Boolean),
      interlocuteur,
      reponse,
      verdict,
      prochaine_etape,
      submitted_at: new Date().toISOString(),
    };

    if (isDevAccessEnabled()) {
      const match = devStore.dossiers.find(d => d.id === params.id) || devStore.dossiers[0];
      if (match) {
        match.statut = verdict === 'positif' ? 'mediation_terminée' : 'mediation_terminée'; // Mark as finished!
        // We can also store the result specifically:
        match.scoring_verdict = verdict === 'positif' ? 'OUI' : 'NON';
        match.rapport_data = {
          ...match.rapport_data,
          negotiation: report_data,
        };
      }
      revalidatePath('/dashboard/negotiator');
      redirect('/dashboard/negotiator?message=Rapport de negotiation enregistre');
    } else {
      const supabase = createServerSupabaseClient();
      await supabase
        .from('dossiers')
        .update({
          statut: 'mediation_terminée',
          scoring_verdict: verdict === 'positif' ? 'OUI' : 'NON',
          rapport_data: {
            ...dossier?.rapport_data,
            negotiation: report_data,
          }
        })
        .eq('id', params.id);

      revalidatePath('/dashboard/negotiator');
      redirect('/dashboard/negotiator');
    }
  }

  return (
    <DashboardLayout allowedRoles={['negotiator', 'super_admin']}>
      <div className="max-w-3xl mx-auto space-y-8 py-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/negotiator/dossiers/${params.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Rédiger le rapport de négociation</h1>
            <p className="mt-1 text-sm text-gray-500">Dossier : {dossier?.reference || 'N/A'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FileCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Rapport d&apos;Intervention</h2>
              <p className="text-xs text-gray-400">Ce rapport sera visible par le client et le Super Admin</p>
            </div>
          </div>

          <form action={handleReportSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Verdict de la Négociation</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="verdict" value="positif" defaultChecked className="text-primary-600 focus:ring-primary-500" />
                  <div>
                    <span className="block text-sm font-bold text-gray-900">Résultat Positif</span>
                    <span className="block text-xs text-gray-400">Accord trouvé (réduction, remboursement)</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="verdict" value="negatif" className="text-primary-600 focus:ring-primary-500" />
                  <div>
                    <span className="block text-sm font-bold text-gray-900">Résultat Négatif</span>
                    <span className="block text-xs text-gray-400">Refus de l&apos;organisme d&apos;un accord amiable</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Résumé de l&apos;intervention</label>
              <textarea
                name="resume"
                required
                rows={3}
                placeholder="Décrivez brièvement les faits d'intervention..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Actions effectuées (une par ligne)</label>
              <textarea
                name="actions"
                required
                rows={4}
                placeholder="Envoi de mise en demeure par recommandé&#10;Relance téléphonique du service contentieux&#10;Négociation du protocole d'accord"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Interlocuteur contacté</label>
                <input
                  type="text"
                  name="interlocuteur"
                  required
                  placeholder="ex: Responsable Contentieux Finacredit"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Réponse obtenue</label>
                <input
                  type="text"
                  name="reponse"
                  required
                  placeholder="ex: Proposition de remise commerciale de 30%"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Prochaine étape recommandée</label>
              <input
                type="text"
                name="prochaine_etape"
                required
                placeholder="ex: Signature du protocole d'accord ou suite interne"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.01]"
            >
              <Save size={16} />
              Enregistrer &amp; Clôturer la Négociation
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
