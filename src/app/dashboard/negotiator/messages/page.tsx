import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewProfile } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { MessageCircle, User, Search, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  searchParams?: { contact?: string };
}

interface Contact {
  id: string;
  type: 'admin' | 'client';
  name: string;
  subtitle: string;
  lastMessage: string;
  lastTime: string;
  href: string;
}

interface MessageItem {
  id: string;
  sender: 'me' | 'other';
  name: string;
  text: string;
  time: string;
}

export default async function NegotiatorMessagesPage({ searchParams }: Props) {
  const isPreview = isDevAccessEnabled();
  const hasContactParam = !!searchParams?.contact;
  const activeContactId = searchParams?.contact || 'admin';

  let contacts: Contact[] = [];
  let messages: MessageItem[] = [];
  let activeContactName = 'Super Admin';
  let activeContactSubtitle = 'Support coordination';

  if (isPreview) {
    const adminProfile = getPreviewProfile('super_admin');
    const negotiator = getPreviewProfile('negotiator');

    const assignedDossiers = devStore.dossiers.filter(
      (d) => d.negotiator_id === negotiator.id || d.statut === 'mediation_en_cours'
    );

    contacts = [
      {
        id: 'admin',
        type: 'admin',
        name: `${adminProfile.prenom} ${adminProfile.nom}`,
        subtitle: 'Support coordination',
        lastMessage: 'Parfait, n\'oublie pas d\'indiquer les actions dans l\'historique.',
        lastTime: 'Il y a 30 min',
        href: '/dashboard/negotiator/messages?contact=admin',
      },
      ...assignedDossiers.map((d) => {
        const client = (d.client as any) || getPreviewProfile('client');
        return {
          id: d.id,
          type: 'client' as const,
          name: `${client.prenom} ${client.nom}`,
          subtitle: d.reference,
          lastMessage: d.statut === 'mediation_en_cours'
            ? 'Avez-vous des nouvelles de l\'organisme ?'
            : 'Merci pour votre accompagnement.',
          lastTime: 'Il y a 2h',
          href: `/dashboard/negotiator/messages?contact=${d.id}`,
        };
      }),
    ];

    if (activeContactId === 'admin') {
      activeContactName = `${adminProfile.prenom} ${adminProfile.nom}`;
      messages = [
        { id: '1', sender: 'other', name: `${adminProfile.prenom} ${adminProfile.nom}`, text: 'Bonjour Samir, tu as deux nouveaux dossiers assignés ce matin.', time: 'Il y a 2h' },
        { id: '2', sender: 'me', name: 'Vous', text: 'Entendu. Je lance la prise de contact avec les clients dans l\'après-midi.', time: 'Il y a 1h' },
        { id: '3', sender: 'other', name: `${adminProfile.prenom} ${adminProfile.nom}`, text: 'Parfait, n\'oublie pas d\'indiquer les actions dans l\'historique.', time: 'Il y a 30 min' },
      ];
    } else {
      const dossier = assignedDossiers.find((d) => d.id === activeContactId);
      const client = dossier ? ((dossier.client as any) || getPreviewProfile('client')) : getPreviewProfile('client');
      activeContactName = `${client.prenom} ${client.nom}`;
      activeContactSubtitle = dossier?.reference || 'Client';
      messages = [
        { id: 'c1', sender: 'other', name: `${client.prenom} ${client.nom}`, text: 'Bonjour, avez-vous reçu mes documents ?', time: 'Il y a 3h' },
        { id: 'c2', sender: 'me', name: 'Vous', text: 'Bonjour, oui tout est bien reçu. Je commence l\'analyse cette semaine.', time: 'Il y a 2h' },
        { id: 'c3', sender: 'other', name: `${client.prenom} ${client.nom}`, text: 'Parfait, merci pour le retour.', time: 'Il y a 1h' },
      ];
    }
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: dossiers } = await supabase
        .from('dossiers')
        .select('id, reference, statut, client:profiles!dossiers_client_id_fkey(nom, prenom)')
        .eq('negotiator_id', session.user.id)
        .order('date_creation', { ascending: false });

      contacts = [
        {
          id: 'admin',
          type: 'admin',
          name: 'Super Admin',
          subtitle: 'Support coordination',
          lastMessage: 'Contactez l\'administration pour tout dossier sensible.',
          lastTime: '',
          href: '/dashboard/negotiator/messages?contact=admin',
        },
        ...(dossiers || []).map((d: any) => ({
          id: d.id,
          type: 'client' as const,
          name: `${d.client.prenom} ${d.client.nom}`,
          subtitle: d.reference,
          lastMessage: 'Conversation liée au dossier',
          lastTime: '',
          href: `/dashboard/negotiator/messages?contact=${d.id}`,
        })),
      ];

      if (activeContactId === 'admin') {
        messages = [
          { id: '1', sender: 'other' as const, name: 'Super Admin', text: 'Bienvenue dans la messagerie interne.', time: 'Aujourd\'hui' },
        ];
      } else {
        const dossier = (dossiers || []).find((d: any) => d.id === activeContactId);
        if (dossier) {
          const clientData = dossier.client as any;
          activeContactName = `${clientData?.prenom || ''} ${clientData?.nom || ''}`.trim() || 'Client';
          activeContactSubtitle = dossier.reference;

          const { data: actions } = await supabase
            .from('historique_actions')
            .select('*')
            .eq('dossier_id', activeContactId)
            .order('created_at', { ascending: true })
            .limit(20);

          messages = (actions || []).map((a, i) => ({
            id: a.id,
            sender: a.action.includes('client') ? ('other' as const) : ('me' as const),
            name: a.action.includes('client') ? activeContactName : 'Vous',
            text: a.details?.message || a.action,
            time: new Date(a.created_at).toLocaleString('fr-FR'),
          }));
        }
      }
    }
  }

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  return (
    <DashboardLayout allowedRoles={['negotiator', 'super_admin']}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Messagerie</h1>
          <p className="mt-1 text-gray-500">Échangez avec vos clients et la coordination</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/10">
          <div className="flex h-[600px]">
            {/* Contacts sidebar */}
            <div className={cn("w-full border-r border-gray-100 md:w-80 md:block", hasContactParam ? "hidden" : "block")}>
              <div className="border-b border-gray-50 p-4">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un contact..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="h-[calc(100%-73px)] overflow-y-auto">
                {contacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={contact.href}
                    className={cn(
                      "flex items-start gap-3 border-b border-gray-50 p-4 transition-colors hover:bg-gray-50",
                      activeContact?.id === contact.id ? "bg-primary-50/60" : ""
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <User size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-bold text-gray-900">{contact.name}</p>
                        <span className="shrink-0 text-[10px] text-gray-400">{contact.lastTime}</span>
                      </div>
                      <p className="text-xs text-gray-500">{contact.subtitle}</p>
                      <p className="mt-1 truncate text-xs text-gray-400">{contact.lastMessage}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Chat area */}
            <div className={cn("flex-1 flex-col md:flex", hasContactParam ? "flex" : "hidden")}>
              {/* Back to contacts button on mobile */}
              {hasContactParam && (
                <Link
                  href="/dashboard/negotiator/messages"
                  className="flex md:hidden items-center gap-1 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-primary-600 uppercase tracking-wider"
                >
                  <ArrowLeft size={14} />
                  Retour aux contacts
                </Link>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-50 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{activeContactName}</p>
                  <p className="text-xs text-gray-500">{activeContactSubtitle}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/30 p-6">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                          msg.sender === 'me'
                            ? 'rounded-tr-none bg-primary-600 text-white'
                            : 'rounded-tl-none bg-white text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="mb-1 text-xs font-bold opacity-80">{msg.name}</p>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`mt-1 text-right text-[10px] opacity-60 ${msg.sender === 'me' ? 'text-primary-100' : 'text-gray-400'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-400">Aucun message pour ce contact.</p>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-50 p-4">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Écrivez votre message..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    disabled
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  L\'envoi de messages sera activé prochainement. En attendant, utilisez le suivi client.
                </p>
              </div>
            </div>

            {/* Mobile placeholder */}
            <div className="flex flex-1 items-center justify-center md:hidden">
              <p className="text-sm text-gray-400">Sélectionnez un contact pour voir la conversation.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
