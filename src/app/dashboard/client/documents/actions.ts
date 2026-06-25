'use server';

import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function confirmUploadComplete(dossierId: string) {
  if (isDevAccessEnabled()) {
    const match = devStore.dossiers.find(d => d.id === dossierId);
    if (match) {
      match.date_upload_complete = new Date().toISOString();
      match.statut = 'analyse_en_cours';
    }
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/documents');
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('dossiers')
    .update({ date_upload_complete: new Date().toISOString(), statut: 'analyse_en_cours' })
    .eq('id', dossierId);

  if (error) {
    console.error('Erreur confirm upload:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/documents');
  return { ok: true };
}

export async function deleteDocument(documentId: string, storagePath: string) {
  if (isDevAccessEnabled()) {
    for (const dossier of devStore.dossiers) {
      if (dossier.documents) {
        const index = dossier.documents.findIndex(d => d.id === documentId);
        if (index !== -1) {
          dossier.documents.splice(index, 1);
          break;
        }
      }
    }
    revalidatePath('/dashboard/client/documents');
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();

  const { error: storageError } = await supabase.storage.from('documents').remove([storagePath]);

  if (storageError) {
    console.error('Erreur suppression storage:', storageError);
    // On continue quand meme pour supprimer la ligne DB
  }

  const { error } = await supabase.from('documents').delete().eq('id', documentId);

  if (error) {
    console.error('Erreur suppression document:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/dashboard/client/documents');
  return { ok: true };
}
