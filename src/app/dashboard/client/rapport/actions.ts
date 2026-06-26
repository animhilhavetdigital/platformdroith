'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { initMediationEtapes } from '@/app/dashboard/negotiator/dossiers/[id]/actions';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { revalidatePath } from 'next/cache';

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

  await initMediationEtapes(dossierId);

  await supabase.from('historique_actions').insert({
    dossier_id: dossierId,
    action: 'negociateur_choisi',
    details: { montant: 199, negotiator_id: negotiatorId },
  });

  revalidatePath('/dashboard/client/rapport');
  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/negotiator');

  return { ok: true };
}

export async function choisirAutonomie(dossierId: string) {
  if (isDevAccessEnabled()) {
    const match = devStore.dossiers.find((d) => d.id === dossierId);
    if (match) {
      match.statut = 'autonomie';
      match.updated_at = new Date().toISOString();
    }
    revalidatePath('/dashboard/client/rapport');
    revalidatePath('/dashboard/client');
    return { ok: true };
  }

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

  return { ok: true };
}

export async function payerNegociateur(dossierId: string) {
  if (isDevAccessEnabled()) {
    const match = devStore.dossiers.find((d) => d.id === dossierId);
    if (!match) {
      return { ok: false, error: 'Dossier introuvable.' };
    }

    match.statut = 'mediation_en_cours';
    match.negotiator_id = match.negotiator_id || 'preview-negotiator';
    match.montant_paye = (match.montant_paye || 0) + 199;
    match.updated_at = new Date().toISOString();

    devStore.mediationEtapes[match.id] = [
      { id: 'et-1', dossier_id: match.id, label: 'Prise de contact client', ordre: 1, complete: true, completed_at: new Date().toISOString(), completed_by: 'preview-negotiator', created_at: new Date().toISOString() },
      { id: 'et-2', dossier_id: match.id, label: 'Constitution du dossier de contestation', ordre: 2, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
      { id: 'et-3', dossier_id: match.id, label: 'Notification officielle a l\'organisme', ordre: 3, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
      { id: 'et-4', dossier_id: match.id, label: 'Negociation des conditions d\'accord', ordre: 4, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
      { id: 'et-5', dossier_id: match.id, label: 'Resolution amiable finale', ordre: 5, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
    ];

    devStore.clientsPayes.push({
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      client_first_name: 'Nadia',
      client_last_name: 'Alaoui',
      client_email: 'client@preview.local',
      client_phone: '+33 6 77 88 99 11',
      amount: 199.00,
      offer_type: '2',
      payment_type: 'negotiator_option',
      payment_status: 'paid',
      platform_status: 'account_created',
      dossier_id: match.id,
      user_id: 'preview-client',
      created_at: new Date().toISOString(),
    });

    revalidatePath('/dashboard/client/rapport');
    revalidatePath('/dashboard/client/negociateur');
    revalidatePath('/dashboard/client');

    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const { data: dossier, error: fetchError } = await supabase
    .from('dossiers')
    .select('*')
    .eq('id', dossierId)
    .single();

  if (fetchError || !dossier) {
    return { ok: false, error: 'Dossier introuvable.' };
  }

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
    console.error('Erreur paiement negociateur:', updateError);
    return { ok: false, error: updateError.message };
  }

  await initMediationEtapes(dossierId);

  await supabase.from('historique_actions').insert({
    dossier_id: dossierId,
    action: 'paiement_negociateur',
    details: { montant: 199, negotiator_id: negotiatorId },
  });

  revalidatePath('/dashboard/client/rapport');
  revalidatePath('/dashboard/client/negociateur');
  revalidatePath('/dashboard/client');

  return { ok: true };
}
