'use server';

import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function saveFormulaire(dossierId: string, data: Record<string, unknown>) {
  if (isDevAccessEnabled()) {
    const match = devStore.dossiers.find(d => d.id === dossierId);
    if (match) {
      match.formulaire_data = data;
      match.date_formulaire_complete = new Date().toISOString();
      match.statut = 'pieces_attendues';
    }
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/formulaire');
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('dossiers')
    .update({
      formulaire_data: data,
      date_formulaire_complete: new Date().toISOString(),
      statut: 'pieces_attendues',
    })
    .eq('id', dossierId);

  if (error) {
    console.error('Erreur save formulaire:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/formulaire');
  return { ok: true };
}

export async function resetFormulaire(dossierId: string) {
  if (isDevAccessEnabled()) {
    const match = devStore.dossiers.find(d => d.id === dossierId);
    if (match) {
      match.formulaire_data = {};
      match.date_formulaire_complete = null;
      match.statut = 'nouveau';
    }
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/formulaire');
  }
  return { ok: true };
}
