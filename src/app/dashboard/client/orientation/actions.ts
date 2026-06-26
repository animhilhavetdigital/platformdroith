'use server';

import { isDevAccessEnabled } from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function choisirOrientation(dossierId: string, choix: 'autonomie' | 'mediation') {
  if (isDevAccessEnabled()) {
    const match = (globalThis as any).__DEV_STORE__?.dossiers?.find((d: any) => d.id === dossierId);
    if (match) {
      match.statut = choix === 'mediation' ? 'mediation_en_cours' : 'autonomie';
      match.updated_at = new Date().toISOString();
    }
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/orientation');
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const statuts = {
    autonomie: 'autonomie',
    mediation: 'mediation_en_cours',
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
