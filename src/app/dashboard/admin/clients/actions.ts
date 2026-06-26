'use server';

import { isDevAccessEnabled, getPreviewProfile } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateReference() {
  return `DH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function offerPrice(offre: '1' | '2' | '3' | string | null): number {
  if (offre === '1') return 99;
  if (offre === '2') return 199;
  if (offre === '3') return 399;
  return 0;
}

export async function addClientFromPayment(paymentId: string) {
  if (isDevAccessEnabled()) {
    const payment = devStore.clientsPayes.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error('Paiement introuvable');
    }

    const newClientId = generateId('client');
    const now = new Date().toISOString();

    devStore.profiles.push({
      id: newClientId,
      role: 'client',
      nom: payment.client_last_name,
      prenom: payment.client_first_name,
      email: payment.client_email,
      téléphone: payment.client_phone,
      avatar_url: undefined,
      status: 'active',
      created_at: now,
      updated_at: now,
    });

    const newDossierId = generateId('dos');
    devStore.dossiers.push({
      id: newDossierId,
      reference: generateReference(),
      statut: 'formulaire_en_cours',
      offre: payment.offer_type,
      client_id: newClientId,
      negotiator_id: null,
      formulaire_data: {},
      scoring_verdict: null,
      scoring_confiance: null,
      scoring_justification: null,
      montant_paye: payment.amount,
      stripe_payment_id: null,
      date_paiement: now,
      date_creation: now,
      date_formulaire_complete: null,
      date_upload_complete: null,
      date_analyse_debut: null,
      date_livraison: null,
      date_cloture: null,
      rapport_url: null,
      rapport_data: {},
      created_at: now,
      updated_at: now,
    });

    devStore.emails.push({
      id: generateId('mail'),
      email: payment.client_email,
      prenom: payment.client_first_name,
      subject: 'Votre espace client est pret',
      type: 'acces_client',
      status: 'sent',
      created_at: now,
    });

    payment.platform_status = 'account_created';
    payment.user_id = newClientId;
    payment.dossier_id = newDossierId;

    revalidatePath('/dashboard/admin/clients');
    redirect('/dashboard/admin/clients?message=Client ajoute avec succes');
  }

  const supabase = createServerSupabaseClient();

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (!payment) {
    throw new Error('Paiement introuvable');
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .insert({
      nom: payment.client_last_name,
      prenom: payment.client_first_name,
      email: payment.client_email,
      telephone: payment.client_phone,
      role: 'client',
      status: 'active',
    })
    .select()
    .single();

  if (userProfile) {
    const { data: dossier } = await supabase
      .from('dossiers')
      .insert({
        client_id: userProfile.id,
        offre: payment.offer_type,
        statut: 'formulaire_en_cours',
        montant_paye: payment.amount,
      })
      .select()
      .single();

    await supabase
      .from('payments')
      .update({
        platform_status: 'account_created',
        user_id: userProfile.id,
        dossier_id: dossier?.id || null,
      })
      .eq('id', paymentId);
  }

  revalidatePath('/dashboard/admin/clients');
  redirect('/dashboard/admin/clients?message=Client ajoute avec succes');
}

export async function createClient(formData: FormData) {
  const prenom = formData.get('prenom') as string;
  const nom = formData.get('nom') as string;
  const email = formData.get('email') as string;
  const telephone = formData.get('telephone') as string;
  const offre = formData.get('offre') as '1' | '2' | '3';

  if (!prenom || !nom || !email || !telephone || !offre) {
    throw new Error('Champs manquants');
  }

  if (isDevAccessEnabled()) {
    const newClientId = generateId('client');
    const now = new Date().toISOString();

    devStore.profiles.push({
      id: newClientId,
      role: 'client',
      nom,
      prenom,
      email,
      téléphone: telephone,
      avatar_url: undefined,
      status: 'active',
      created_at: now,
      updated_at: now,
    });

    devStore.dossiers.push({
      id: generateId('dos'),
      reference: generateReference(),
      statut: 'formulaire_en_cours',
      offre,
      client_id: newClientId,
      negotiator_id: null,
      formulaire_data: {},
      scoring_verdict: null,
      scoring_confiance: null,
      scoring_justification: null,
      montant_paye: offerPrice(offre),
      stripe_payment_id: null,
      date_paiement: now,
      date_creation: now,
      date_formulaire_complete: null,
      date_upload_complete: null,
      date_analyse_debut: null,
      date_livraison: null,
      date_cloture: null,
      rapport_url: null,
      rapport_data: {},
      created_at: now,
      updated_at: now,
    });

    devStore.emails.push({
      id: generateId('mail'),
      email,
      prenom,
      subject: 'Votre espace client est pret',
      type: 'acces_client',
      status: 'sent',
      created_at: now,
    });

    revalidatePath('/dashboard/admin/clients');
    redirect('/dashboard/admin/clients?message=Client cree avec succes');
  }

  const supabase = createServerSupabaseClient();

  const { data: userProfile } = await supabase
    .from('profiles')
    .insert({
      nom,
      prenom,
      email,
      telephone,
      role: 'client',
      status: 'active',
    })
    .select()
    .single();

  if (userProfile) {
    await supabase.from('dossiers').insert({
      client_id: userProfile.id,
      offre,
      statut: 'formulaire_en_cours',
      montant_paye: offerPrice(offre),
    });
  }

  revalidatePath('/dashboard/admin/clients');
  redirect('/dashboard/admin/clients?message=Client cree avec succes');
}


export async function updateClient(clientId: string, formData: FormData) {
  const email = (formData.get('email') as string || '').trim();
  const telephone = (formData.get('telephone') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();

  if (!email || !telephone) {
    throw new Error('Email et téléphone requis');
  }

  if (isDevAccessEnabled()) {
    const profile = devStore.profiles.find((p) => p.id === clientId);
    if (profile) {
      profile.email = email;
      profile.téléphone = telephone;
      profile.updated_at = new Date().toISOString();
    }
    revalidatePath('/dashboard/admin/clients');
    redirect('/dashboard/admin/clients?message=Client mis a jour');
  }

  const supabase = createServerSupabaseClient();
  await supabase
    .from('profiles')
    .update({ email, telephone })
    .eq('id', clientId);

  if (password && password.length >= 6) {
    const serviceRole = createServiceRoleClient();
    await serviceRole.auth.admin.updateUserById(clientId, {
      email,
      password,
    });
  } else if (password) {
    throw new Error('Le mot de passe doit faire au moins 6 caractères');
  } else {
    const serviceRole = createServiceRoleClient();
    await serviceRole.auth.admin.updateUserById(clientId, { email });
  }

  revalidatePath('/dashboard/admin/clients');
  redirect('/dashboard/admin/clients?message=Client mis a jour');
}

export async function deleteClient(clientId: string) {
  if (isDevAccessEnabled()) {
    devStore.profiles = devStore.profiles.filter((p) => p.id !== clientId);
    devStore.dossiers = devStore.dossiers.filter((d) => d.client_id !== clientId);
    devStore.messages = devStore.messages.filter(
      (m) => m.sender_id !== clientId && m.recipient_id !== clientId
    );
    revalidatePath('/dashboard/admin/clients');
    redirect('/dashboard/admin/clients?message=Client supprime');
  }

  const supabase = createServerSupabaseClient();
  await supabase.from('dossiers').delete().eq('client_id', clientId);

  const serviceRole = createServiceRoleClient();
  await serviceRole.auth.admin.deleteUser(clientId);

  revalidatePath('/dashboard/admin/clients');
  redirect('/dashboard/admin/clients?message=Client supprime');
}
