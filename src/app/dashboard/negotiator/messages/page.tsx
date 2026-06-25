import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { MessageCircle, User, Calendar, Send } from 'lucide-react';

export default async function NegotiatorMessagesPage() {
  const isPreview = isDevAccessEnabled();
  let messages: any[] = [];

  if (isPreview) {
    messages = [
      { id: '1', sender: 'Super Admin', text: 'Bonjour Samir, tu as deux nouveaux dossiers d\'arbitrage crédit assignés ce matin.', time: 'Il y a 2h' },
      { id: '2', sender: 'Samir Bennani', text: 'Entendu. Je lance la prise de contact avec les clients dans l\'après-midi.', time: 'Il y a 1h' },
      { id: '3', sender: 'Super Admin', text: 'Parfait, n\'oublie pas d\'indiquer les actions d\'appel dans l\'historique.', time: 'Il y a 30 min' },
    ];
  }

  return (
    <DashboardLayout allowedRoles={['negotiator']}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Messagerie interne</h1>
          <p className="mt-1 text-gray-500">Communiquez en direct avec la coordination de la plateforme</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col h-[500px]">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-success-500" />
            <span className="text-sm font-bold text-gray-800">Support Coordination Admin</span>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAdmin = msg.sender === 'Super Admin';
              return (
                <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-md rounded-2xl p-4 space-y-1 ${
                    isAdmin ? 'bg-slate-100 text-slate-800 rounded-tl-none' : 'bg-primary-600 text-white rounded-tr-none'
                  }`}>
                    <p className="text-xs font-bold uppercase opacity-75">{msg.sender}</p>
                    <p className="text-sm">{msg.text}</p>
                    <span className="block text-right text-[10px] opacity-50">{msg.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-50 flex gap-2">
            <input
              type="text"
              placeholder="Écrivez votre message..."
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
