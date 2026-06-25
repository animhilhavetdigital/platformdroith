'use server';

import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore, updateDevMediationEtape } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

const DEFAULT_STEP_LABELS = [
  'Envoi de la mise en demeure',
  'Prise de contact avec la partie prenante',
  'Analyse des pieces complementaires',
  'Proposition d\'accord amiable',
  'Clôture de la médiation',
];

export async function initMediationEtapes(dossierId: string) {
  if (isDevAccessEnabled()) {
    const existing = devStore.mediationEtapes[dossierId];
    if (existing && existing.length > 0) {
      return { ok: true, message: 'Étapes déjà initialisees' };
    }
    const etapes = DEFAULT_STEP_LABELS.map((label, index) => ({
      id: `étape-${dossierId}-${index}`,
      dossier_id: dossierId,
      label,
      ordre: index,
      complete: false,
      completed_at: null as string | null,
      completed_by: null as string | null,
      created_at: new Date().toISOString(),
    }));
    devStore.mediationEtapes[dossierId] = etapes;
    revalidatePath(`/dashboard/negotiator/dossiers/${dossierId}`);
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from('mediation_etapes')
    .select('id')
    .eq('dossier_id', dossierId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: true, message: 'Étapes déjà initialisees' };
  }

  const etapes = DEFAULT_STEP_LABELS.map((label, index) => ({
    dossier_id: dossierId,
    label,
    ordre: index,
    complete: false,
  }));

  const { error } = await supabase.from('mediation_etapes').insert(etapes);

  if (error) {
    console.error('Erreur init etapes:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/negotiator/dossiers/${dossierId}`);
  return { ok: true };
}

export async function toggleMediationEtape(dossierId: string, etapeId: string, complete: boolean) {
  if (isDevAccessEnabled()) {
    const now = new Date().toISOString();
    updateDevMediationEtape(dossierId, etapeId, {
      complete,
      completed_at: complete ? now : null,
      completed_by: complete ? 'preview-negotiator' : null,
    });
    revalidatePath(`/dashboard/negotiator/dossiers/${dossierId}`);
    revalidatePath(`/dashboard/client`);
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { error } = await supabase
    .from('mediation_etapes')
    .update({
      complete,
      completed_at: complete ? new Date().toISOString() : null,
      completed_by: complete ? session?.user.id : null,
    })
    .eq('id', etapeId)
    .eq('dossier_id', dossierId);

  if (error) {
    console.error('Erreur toggle étape:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/negotiator/dossiers/${dossierId}`);
  revalidatePath(`/dashboard/client`);
  return { ok: true };
}

export async function updateDossierStatut(dossierId: string, statut: string) {
  if (isDevAccessEnabled()) {
    // En mode dev, on ne persiste pas le statut, mais on revalide quand meme
    revalidatePath(`/dashboard/negotiator/dossiers/${dossierId}`);
    revalidatePath(`/dashboard/client`);
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from('dossiers').update({ statut }).eq('id', dossierId);

  if (error) {
    console.error('Erreur update statut:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/dashboard/negotiator/dossiers/${dossierId}`);
  revalidatePath(`/dashboard/client`);
  return { ok: true };
}
