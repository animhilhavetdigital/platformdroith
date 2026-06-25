'use server';

import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function saveFormulaire(dossierId: string, data: Record<string, unknown>) {
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
