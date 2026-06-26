import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewProfile } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import MessagesContent from './MessagesContent';
import type { Profile } from '@/types';

interface Props {
  searchParams?: { contact?: string };
}

interface MessageItem {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

export default async function AdminMessagesPage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  let adminId = '';
  let contacts: Profile[] = [];
  let messages: MessageItem[] = [];
  let activeContactId = searchParams?.contact || '';

  if (isPreview) {
    adminId = getPreviewProfile('super_admin').id;
    contacts = devStore.profiles.filter((p) => p.role === 'client' || p.role === 'negotiator');

    if (!activeContactId && contacts.length > 0) {
      activeContactId = contacts[0].id;
    }

    messages = devStore.messages
      .filter(
        (m) =>
          (m.sender_id === adminId && m.recipient_id === activeContactId) ||
          (m.sender_id === activeContactId && m.recipient_id === adminId)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      adminId = session.user.id;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['client', 'negotiator'])
        .order('created_at', { ascending: false });
      contacts = (profiles || []).map((p: any) => ({ ...p, role: p.role })) as Profile[];

      if (!activeContactId && contacts.length > 0) {
        activeContactId = contacts[0].id;
      }

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${session.user.id},recipient_id.eq.${activeContactId}),and(sender_id.eq.${activeContactId},recipient_id.eq.${session.user.id})`
        )
        .order('created_at', { ascending: true });
      messages = (messagesData || []) as MessageItem[];
    }
  }

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <MessagesContent
        contacts={contacts}
        messages={messages}
        activeContactId={activeContact?.id || activeContactId}
        adminId={adminId || ''}
      />
    </DashboardLayout>
  );
}
