'use server';

import { isDevAccessEnabled } from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function choisirOrientation(dossierId: string, choix: 'autonomie' | 'mediation' | 'avocat') {
  if (isDevAccessEnabled()) {
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/orientation');
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const statuts = {
    autonomie: 'autonomie',
    mediation: 'mediation_en_cours',
    avocat: 'avocat',
  };

  const { error } = await supabase
    .from('dossiers')
    .update({ statut: statuts[choix] })
    .eq('id', dossierId);

  if (error) {
    console.error('Erreur orientation:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/orientation');
  return { ok: true };
}
