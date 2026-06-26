'use server';

import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function toggleNegotiatorStatus(profileId: string, currentStatus: string) {
  const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';

  if (isDevAccessEnabled()) {
    const profile = devStore.profiles.find((p) => p.id === profileId);
    if (profile) {
      profile.status = nextStatus;
      profile.updated_at = new Date().toISOString();
    }
    revalidatePath('/dashboard/admin/negociateurs');
    return;
  }

  const supabase = createServerSupabaseClient();
  await supabase.from('profiles').update({ status: nextStatus }).eq('id', profileId);
  revalidatePath('/dashboard/admin/negociateurs');
}

export async function deleteNegotiator(profileId: string) {
  if (isDevAccessEnabled()) {
    devStore.profiles = devStore.profiles.filter((p) => p.id !== profileId);
    revalidatePath('/dashboard/admin/negociateurs');
    redirect('/dashboard/admin/negociateurs?message=Negociateur supprime');
  }

  const supabase = createServerSupabaseClient();

  await supabase
    .from('dossiers')
    .update({ negotiator_id: null })
    .eq('negotiator_id', profileId);

  const serviceRole = createServiceRoleClient();
  await serviceRole.auth.admin.deleteUser(profileId);

  revalidatePath('/dashboard/admin/negociateurs');
  redirect('/dashboard/admin/negociateurs?message=Negociateur supprime');
}

export async function createNegotiator(formData: FormData) {
  const prenom = formData.get('prenom') as string;
  const nom = formData.get('nom') as string;
  const email = formData.get('email') as string;
  const telephone = formData.get('telephone') as string;
  const password = formData.get('password') as string;

  if (!prenom || !nom || !email || !telephone || !password) {
    throw new Error('Champs manquants');
  }

  if (isDevAccessEnabled()) {
    const now = new Date().toISOString();
    devStore.profiles.push({
      id: 'negotiator-' + Math.random().toString(36).substr(2, 9),
      role: 'negotiator',
      nom,
      prenom,
      email,
      téléphone: telephone,
      avatar_url: undefined,
      status: 'active',
      created_at: now,
      updated_at: now,
    });
    revalidatePath('/dashboard/admin/negociateurs');
    redirect('/dashboard/admin/negociateurs?message=Negociateur cree avec succes');
  }

  const serviceRole = createServiceRoleClient();
  const { data, error } = await serviceRole.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'negotiator',
      prenom,
      nom,
      telephone,
    },
  });

  if (error) {
    console.error('Erreur création négociateur:', error);
    throw new Error(error.message);
  }

  if (data?.user) {
    await serviceRole.from('profiles').insert({
      id: data.user.id,
      nom,
      prenom,
      email,
      telephone,
      role: 'negotiator',
      status: 'active',
    });
  }

  revalidatePath('/dashboard/admin/negociateurs');
  redirect('/dashboard/admin/negociateurs?message=Negociateur cree avec succes');
}
