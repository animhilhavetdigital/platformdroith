'use server';

import { isDevAccessEnabled, getPreviewProfile } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function sendMessage(dossierId: string, content: string) {
  const text = content.trim();
  if (!text) {
    return { error: 'Le message ne peut pas être vide.' };
  }

  if (isDevAccessEnabled()) {
    const adminId = getPreviewProfile('super_admin').id;
    const dossier = devStore.dossiers.find((d) => d.id === dossierId);
    if (!dossier) {
      return { error: 'Dossier introuvable.' };
    }

    devStore.messages.push({
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      sender_id: adminId,
      recipient_id: dossier.client_id,
      content: text,
      created_at: new Date().toISOString(),
    });

    revalidatePath('/dashboard/admin/dossiers');
    return { ok: true };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'Non authentifié.' };
  }

  await supabase.from('historique_actions').insert({
    dossier_id: dossierId,
    user_id: session.user.id,
    action: 'message_admin',
    details: { message: text },
  });

  revalidatePath('/dashboard/admin/dossiers');
  return { ok: true };
}
