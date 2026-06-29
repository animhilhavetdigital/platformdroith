'use client';

import { Mail, RefreshCw, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { resendEmail } from './actions';

interface Email {
  id: string;
  prenom: string;
  email: string;
  subject: string;
  type: string;
  created_at: string;
}

interface Props {
  emails: Email[];
}

export default function EmailsList({ emails }: Props) {
  const [expandedMobile, setExpandedMobile] = useState<Set<string>>(new Set());

  const toggleMobileExpand = (id: string) => {
    const next = new Set(expandedMobile);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMobile(next);
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/10">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Destinataire</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Sujet</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Type de mail</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date d&apos;envoi</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut de réception</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {emails.map((mail) => (
              <tr key={mail.id} className="transition-colors hover:bg-gray-50/60">
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                  {mail.prenom} ({mail.email})
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{mail.subject}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {mail.type === 'acces_client' ? 'Création de compte' : 'Notification Rapport'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(mail.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                    <CheckCircle size={10} />
                    Délivré
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={resendEmail}>
                    <input type="hidden" name="emailId" value={mail.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw size={12} />
                      Renvoyer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {emails.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  Aucun e-mail envoyé dans le journal d&apos;historique.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {emails.map((mail) => {
          const isExpanded = expandedMobile.has(mail.id);
          return (
            <div key={mail.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-black/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMobileExpand(mail.id)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <ChevronDown size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{mail.prenom}</p>
                  <p className="text-xs text-gray-500 truncate">{mail.email}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                  <CheckCircle size={10} />
                  Délivré
                </span>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Sujet</span>
                      <span className="mt-0.5 block font-medium text-gray-700">{mail.subject}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Type</span>
                        <span className="mt-0.5 block font-bold text-slate-500 uppercase tracking-wider">
                          {mail.type === 'acces_client' ? 'Création de compte' : 'Notification Rapport'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</span>
                        <span className="mt-0.5 block font-medium text-gray-600">
                          {new Date(mail.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <form action={resendEmail}>
                      <input type="hidden" name="emailId" value={mail.id} />
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw size={12} />
                        Renvoyer
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {emails.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Aucun e-mail envoyé dans le journal d&apos;historique.
          </div>
        )}
      </div>
    </>
  );
}
