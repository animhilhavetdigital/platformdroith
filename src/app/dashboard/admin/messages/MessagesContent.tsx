'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Profile } from '@/types';
import { sendAdminMessage } from './actions';
import { MessageCircle, User, Search, Send, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageItem {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

interface Props {
  contacts: Profile[];
  messages: MessageItem[];
  activeContactId: string;
  adminId: string;
  hasContactParam?: boolean;
}

export default function MessagesContent({ contacts, messages, activeContactId, adminId, hasContactParam = false }: Props) {
  const activeContact = contacts.find((c) => c.id === activeContactId);

  const filteredContacts = useMemo(() => {
    return contacts;
  }, [contacts]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Messagerie</h1>
        <p className="mt-1 text-gray-500">Échangez avec les clients et les négociateurs</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
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
              {filteredContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/dashboard/admin/messages?contact=${contact.id}`}
                  className={cn(
                    "flex items-start gap-3 border-b border-gray-50 p-4 transition-colors hover:bg-gray-50",
                    activeContactId === contact.id ? "bg-primary-50/60" : ""
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <User size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {contact.prenom} {contact.nom}
                      </p>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                        {contact.role === 'client' ? 'Client' : 'Négociateur'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{contact.email || contact.téléphone || '—'}</p>
                  </div>
                </Link>
              ))}
              {filteredContacts.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">Aucun contact disponible.</div>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={cn("flex-1 flex-col md:flex", hasContactParam ? "flex" : "hidden")}>
            {/* Back to contacts button on mobile */}
            {hasContactParam && (
              <Link
                href="/dashboard/admin/messages"
                className="flex md:hidden items-center gap-1 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-primary-600 uppercase tracking-wider"
              >
                <ArrowLeft size={14} />
                Retour aux contacts
              </Link>
            )}

            {activeContact ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-gray-50 px-6 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {activeContact.prenom} {activeContact.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activeContact.role === 'client' ? 'Client' : 'Négociateur'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/30 p-6">
                  {messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === adminId;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                              isMe
                                ? 'rounded-tr-none bg-primary-600 text-white'
                                : 'rounded-tl-none bg-white text-gray-800 shadow-sm'
                            }`}
                          >
                            <p className="mb-1 text-xs font-bold opacity-80">
                              {isMe ? 'Vous' : `${activeContact.prenom} ${activeContact.nom}`}
                            </p>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p
                              className={`mt-1 text-right text-[10px] opacity-60 ${
                                isMe ? 'text-primary-100' : 'text-gray-400'
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-gray-400">Aucun message pour ce contact.</p>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-50 p-4">
                  <form
                    action={sendAdminMessage}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2"
                  >
                    <input type="hidden" name="recipientId" value={activeContact.id} />
                    <input
                      type="text"
                      name="content"
                      required
                      placeholder="Écrivez votre message..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                    <button
                      type="submit"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-colors hover:bg-primary-700"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-400">Sélectionnez un contact pour démarrer la conversation.</p>
              </div>
            )}
          </div>

          {/* Mobile placeholder */}
          <div className="flex flex-1 items-center justify-center md:hidden">
            <p className="text-sm text-gray-400">Sélectionnez un contact pour voir la conversation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
