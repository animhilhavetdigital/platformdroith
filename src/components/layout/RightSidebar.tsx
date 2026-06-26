'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import {
  AlertCircle,
  Bell,
  Bug,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  UserPlus,
  X,
} from 'lucide-react';

interface RightSidebarProps {
  role?: UserRole;
}

const roleData: Record<
  UserRole,
  {
    notifications: Array<{ id: number; icon: React.ReactNode; color: string; title: string; time: string }>;
    activities: Array<{ id: number; avatar: string; color: string; title: string; time: string }>;
    contacts: Array<{ id: number; name: string; initials: string; color: string }>;
  }
> = {
  super_admin: {
    notifications: [
      { id: 1, icon: <UserPlus size={14} />, color: 'bg-primary-50 text-primary-600', title: 'Nouvel utilisateur inscrit', time: 'Il y a 5 min' },
      { id: 2, icon: <FileText size={14} />, color: 'bg-blue-50 text-blue-600', title: 'Nouveau dossier DH-2026-005 cree', time: 'Il y a 12 min' },
      { id: 3, icon: <AlertCircle size={14} />, color: 'bg-amber-50 text-amber-600', title: 'Webhooks a surveiller', time: 'Il y a 1 h' },
      { id: 4, icon: <CheckCircle size={14} />, color: 'bg-green-50 text-green-600', title: 'Paiement valide pour DH-2026-002', time: 'Il y a 2 h' },
    ],
    activities: [
      { id: 1, avatar: 'SB', color: 'bg-primary-100 text-primary-700', title: 'Sara Benjelloun a cree un dossier', time: 'A l\'instant' },
      { id: 2, avatar: 'SN', color: 'bg-purple-100 text-purple-700', title: 'Samir Bennani a assigne un dossier', time: 'Il y a 25 min' },
      { id: 3, avatar: 'MT', color: 'bg-green-100 text-green-700', title: 'Meriem Tazi a termine le formulaire', time: 'Il y a 1 h' },
      { id: 4, avatar: 'YH', color: 'bg-orange-100 text-orange-700', title: 'Youssef Haddad a depose des pieces', time: 'Il y a 3 h' },
    ],
    contacts: [
      { id: 1, name: 'Sara Benjelloun', initials: 'SB', color: 'bg-primary-500' },
      { id: 2, name: 'Youssef Haddad', initials: 'YH', color: 'bg-purple-500' },
      { id: 3, name: 'Meriem Tazi', initials: 'MT', color: 'bg-green-500' },
      { id: 4, name: 'Loubna Azzam', initials: 'LA', color: 'bg-orange-500' },
      { id: 5, name: 'Samir Bennani', initials: 'SN', color: 'bg-pink-500' },
    ],
  },
  negotiator: {
    notifications: [
      { id: 1, icon: <AlertCircle size={14} />, color: 'bg-red-50 text-red-600', title: 'Dossier urgent a relancer : DH-2026-002', time: 'A l\'instant' },
      { id: 2, icon: <MessageSquare size={14} />, color: 'bg-primary-50 text-primary-600', title: 'Nouveau message du client DH-2026-001', time: 'Il y a 15 min' },
      { id: 3, icon: <Clock size={14} />, color: 'bg-amber-50 text-amber-600', title: 'Rendez-vous mediation demain 14h', time: 'Il y a 1 h' },
      { id: 4, icon: <CheckCircle size={14} />, color: 'bg-green-50 text-green-600', title: 'Accord trouve pour DH-2026-004', time: 'Il y a 3 h' },
    ],
    activities: [
      { id: 1, avatar: 'LA', color: 'bg-orange-100 text-orange-700', title: 'Loubna Azzam a envoye un document', time: 'A l\'instant' },
      { id: 2, avatar: 'SB', color: 'bg-primary-100 text-primary-700', title: 'Sara Benjelloun a repondu au questionnaire', time: 'Il y a 30 min' },
      { id: 3, avatar: 'YH', color: 'bg-purple-100 text-purple-700', title: 'Youssef Haddad a accepte la proposition', time: 'Il y a 2 h' },
      { id: 4, avatar: 'MT', color: 'bg-green-100 text-green-700', title: 'Meriem Tazi a signe le rapport', time: 'Hier' },
    ],
    contacts: [
      { id: 1, name: 'Sara Benjelloun', initials: 'SB', color: 'bg-primary-500' },
      { id: 2, name: 'Youssef Haddad', initials: 'YH', color: 'bg-purple-500' },
      { id: 3, name: 'Meriem Tazi', initials: 'MT', color: 'bg-green-500' },
      { id: 4, name: 'Loubna Azzam', initials: 'LA', color: 'bg-orange-500' },
    ],
  },
  client: {
    notifications: [
      { id: 1, icon: <FileText size={14} />, color: 'bg-primary-50 text-primary-600', title: 'Votre rapport est disponible', time: 'A l\'instant' },
      { id: 2, icon: <CheckCircle size={14} />, color: 'bg-green-50 text-green-600', title: 'Documents recus et valides', time: 'Il y a 2 h' },
      { id: 3, icon: <Clock size={14} />, color: 'bg-amber-50 text-amber-600', title: 'Analyse en cours, delai 72h', time: 'Il y a 5 h' },
      { id: 4, icon: <MessageSquare size={14} />, color: 'bg-blue-50 text-blue-600', title: 'Message de votre negociateur', time: 'Hier' },
    ],
    activities: [
      { id: 1, avatar: 'DH', color: 'bg-primary-100 text-primary-700', title: 'Vous avez consulte votre rapport', time: 'A l\'instant' },
      { id: 2, avatar: 'DH', color: 'bg-green-100 text-green-700', title: 'Vous avez depose 3 documents', time: 'Il y a 1 j' },
      { id: 3, avatar: 'DH', color: 'bg-amber-100 text-amber-700', title: 'Vous avez complete le formulaire', time: 'Il y a 3 j' },
      { id: 4, avatar: 'SN', color: 'bg-purple-100 text-purple-700', title: 'Samir Bennani a mis a jour votre dossier', time: 'Il y a 4 j' },
    ],
    contacts: [
      { id: 1, name: 'Samir Bennani', initials: 'SN', color: 'bg-primary-500' },
      { id: 2, name: 'Support Droit Habitat', initials: 'SH', color: 'bg-green-500' },
    ],
  },
};

export default function RightSidebar({ role = 'client' }: RightSidebarProps) {
  const [open, setOpen] = useState(false);
  const data = roleData[role] || roleData.client;

  useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    window.addEventListener('toggle-notifications', handleToggle);
    window.addEventListener('open-notifications', handleOpen);
    window.addEventListener('close-notifications', handleClose);

    return () => {
      window.removeEventListener('toggle-notifications', handleToggle);
      window.removeEventListener('open-notifications', handleOpen);
      window.removeEventListener('close-notifications', handleClose);
    };
  }, []);

  useEffect(() => {
    const sendCount = () => {
      window.dispatchEvent(
        new CustomEvent('update-notification-count', { detail: data.notifications.length })
      );
    };

    sendCount();

    window.addEventListener('request-notification-count', sendCount);
    return () => {
      window.removeEventListener('request-notification-count', sendCount);
    };
  }, [data.notifications.length]);

  if (!open) {
    return null;
  }

  return (
    <>
      {/* Backdrop for mobile/tablet */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        onClick={() => setOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-gray-100 bg-white shadow-xl lg:static lg:z-auto lg:shadow-none lg:flex">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-bold text-white">
            {data.notifications.length}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fermer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <section>
          <div className="space-y-3">
            {data.notifications.map((item) => (
              <div
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-snug text-gray-800">{item.title}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Activites</h3>
          <div className="space-y-3">
            {data.activities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.color}`}>
                  {item.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-snug text-gray-800">{item.title}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Contacts</h3>
          <div className="space-y-2">
            {data.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${contact.color}`}>
                  {contact.initials}
                </div>
                <p className="text-xs font-bold text-gray-800">{contact.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
    </>
  );
}
