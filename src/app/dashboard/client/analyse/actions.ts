'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { generateAIReport, generateScoring } from '@/lib/ai-report';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { revalidatePath } from 'next/cache';

export async function lancerAnalyse(dossierId: string) {
  if (isDevAccessEnabled()) {
    const match = devStore.dossiers.find((d) => d.id === dossierId);
    if (!match) {
      return { ok: false, error: 'Dossier introuvable.' };
    }

    const formulaireData = (match.formulaire_data as Record<string, any>) || {};
    const report = generateAIReport(formulaireData);
    const scoring = generateScoring(formulaireData);

    match.rapport_data = report as unknown as Record<string, unknown>;
    match.rapport_url = '/demo/rapport.pdf';
    match.scoring_verdict = scoring.verdict;
    match.scoring_confiance = scoring.confiance;
    match.date_analyse_debut = new Date().toISOString();
    match.date_livraison = new Date().toISOString();
    match.statut = 'rapport_genere';

    revalidatePath('/dashboard/client/analyse');
    revalidatePath('/dashboard/client/rapport');
    revalidatePath('/dashboard/client');

    return { ok: true, report };
  }

  const supabase = createServerSupabaseClient();

  const { data: dossier, error: fetchError } = await supabase
    .from('dossiers')
    .select('formulaire_data')
    .eq('id', dossierId)
    .single();

  if (fetchError || !dossier) {
    console.error('Erreur récupération dossier:', fetchError);
    return { ok: false, error: 'Dossier introuvable.' };
  }

  const formulaireData = (dossier.formulaire_data as Record<string, any>) || {};
  const report = generateAIReport(formulaireData);
  const scoring = generateScoring(formulaireData);

  const { error: updateError } = await supabase
    .from('dossiers')
    .update({
      rapport_data: report,
      rapport_url: '/demo/rapport.pdf',
      scoring_verdict: scoring.verdict,
      scoring_confiance: scoring.confiance,
      date_analyse_debut: new Date().toISOString(),
      date_livraison: new Date().toISOString(),
      statut: 'rapport_genere',
    })
    .eq('id', dossierId);

  if (updateError) {
    console.error('Erreur mise à jour dossier:', updateError);
    return { ok: false, error: updateError.message };
  }

  await supabase.from('historique_actions').insert({
    dossier_id: dossierId,
    action: 'analyse_generee',
    details: { type: 'IA_simulee', scoring },
  });

  revalidatePath('/dashboard/client/analyse');
  revalidatePath('/dashboard/client/rapport');
  revalidatePath('/dashboard/client');

  return { ok: true, report };
}
