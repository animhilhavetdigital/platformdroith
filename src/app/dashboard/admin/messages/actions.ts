'use server';

import { isDevAccessEnabled, getPreviewProfile } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function sendAdminMessage(formData: FormData) {
  const recipientId = formData.get('recipientId') as string;
  const content = (formData.get('content') as string || '').trim();

  if (!recipientId || !content) {
    return;
  }

  if (isDevAccessEnabled()) {
    const adminId = getPreviewProfile('super_admin').id;
    devStore.messages.push({
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      sender_id: adminId,
      recipient_id: recipientId,
      content,
      created_at: new Date().toISOString(),
    });
    revalidatePath('/dashboard/admin/messages');
    return;
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return;
  }

  await supabase.from('messages').insert({
    sender_id: session.user.id,
    recipient_id: recipientId,
    content,
  });

  revalidatePath('/dashboard/admin/messages');
}
