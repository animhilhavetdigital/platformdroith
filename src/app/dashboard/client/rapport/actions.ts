'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { initMediationEtapes } from '@/app/dashboard/negotiator/dossiers/[id]/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function choisirNegociateur(dossierId: string) {
  const supabase = createServerSupabaseClient();

  const { data: dossier, error: fetchError } = await supabase
    .from('dossiers')
    .select('*')
    .eq('id', dossierId)
    .single();

  if (fetchError || !dossier) {
    return { error: 'Dossier introuvable.' };
  }

  // Trouver un négociateur disponible
  const { data: negotiators } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'negotiator')
    .limit(1);

  const negotiatorId = negotiators?.[0]?.id || null;

  const currentMontant = Number(dossier.montant_paye) || 0;

  const { error: updateError } = await supabase
    .from('dossiers')
    .update({
      statut: 'mediation_en_cours',
      negotiator_id: negotiatorId,
      montant_paye: currentMontant + 199,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dossierId);

  if (updateError) {
    console.error('Erreur choix negociateur:', updateError);
    return { error: updateError.message };
  }

  // Initialiser les étapes de médiation
  await initMediationEtapes(dossierId);

  await supabase.from('historique_actions').insert({
    dossier_id: dossierId,
    action: 'negociateur_choisi',
    details: { montant: 199, negotiator_id: negotiatorId },
  });

  revalidatePath('/dashboard/client/rapport');
  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/negotiator');

  redirect('/dashboard/client');
}

export async function choisirAutonomie(dossierId: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('dossiers')
    .update({ statut: 'autonomie' })
    .eq('id', dossierId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from('historique_actions').insert({
    dossier_id: dossierId,
    action: 'autonomie_choisie',
    details: {},
  });

  revalidatePath('/dashboard/client/rapport');
  revalidatePath('/dashboard/client');

  redirect('/dashboard/client');
}
