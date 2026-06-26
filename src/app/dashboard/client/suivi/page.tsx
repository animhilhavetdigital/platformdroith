import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewClientData, getPreviewProfile } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { MessageSquare, Send, User, Headphones } from 'lucide-react';

interface Message {
  id: string;
  sender: 'client' | 'support';
  name: string;
  text: string;
  date: string;
}

export default async function ClientSuiviPage() {
  const isPreview = isDevAccessEnabled();
  let messages: Message[] = [];
  let supportName = 'Support Droit Habitat';

  if (isPreview) {
    const dossier = devStore.dossiers[0] || getPreviewClientData('mediation').dossier;
    const negotiator = getPreviewProfile('negotiator');
    supportName = `${negotiator.prenom} ${negotiator.nom}`;

    messages = [
      {
        id: 'msg-1',
        sender: 'support',
        name: supportName,
        text: 'Bonjour, je suis votre négociateur dédié. J\'ai bien pris connaissance de votre dossier et je vais contacter l\'organisme de crédit dans les meilleurs délais.',
        date: daysAgo(3),
      },
      {
        id: 'msg-2',
        sender: 'client',
        name: 'Vous',
        text: 'Bonjour, merci. N\'hésitez pas si vous avez besoin de documents supplémentaires.',
        date: daysAgo(3),
      },
      {
        id: 'msg-3',
        sender: 'support',
        name: supportName,
        text: 'J\'ai effectué la première relance auprès de Finacredit Habitat. Je vous tiens informé dès que j\'ai un retour.',
        date: daysAgo(2),
      },
      ...(dossier.statut === 'mediation_en_cours'
        ? [
            {
              id: 'msg-4',
              sender: 'support' as const,
              name: supportName,
              text: 'L\'organisme a répondu. Nous sommes en phase de négociation sur les modalités d\'accord.',
              date: daysAgo(1),
            },
          ]
        : []),
    ];
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: dossier } = await supabase
        .from('dossiers')
        .select('id, negotiator_id')
        .eq('client_id', session.user.id)
        .order('date_creation', { ascending: false })
        .limit(1)
        .single();

      if (dossier) {
        if (dossier.negotiator_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('prenom, nom')
            .eq('id', dossier.negotiator_id)
            .single();
          if (profile) {
            supportName = `${profile.prenom} ${profile.nom}`;
          }
        }

        const { data: actions } = await supabase
          .from('historique_actions')
          .select('*')
          .eq('dossier_id', dossier.id)
          .order('created_at', { ascending: true });

        messages = (actions || []).map((a) => ({
          id: a.id,
          sender: a.action.includes('client') ? 'client' : 'support',
          name: a.action.includes('client') ? 'Vous' : supportName,
          text: a.details?.message || a.action,
          date: a.created_at,
        }));
      }
    }
  }

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Messages &amp; Suivi</h1>
          <p className="mt-1 text-gray-500">
            Votre conversation avec <span className="font-semibold text-gray-700">{supportName}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Headphones size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{supportName}</p>
              <p className="text-xs text-gray-500">Négociateur Droit Habitat</p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.sender === 'client'
                        ? 'rounded-br-none bg-primary-600 text-white'
                        : 'rounded-bl-none bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-bold opacity-90">
                        {msg.sender === 'client' ? 'Vous' : msg.name}
                      </span>
                      <span className={`text-[10px] opacity-70 ${msg.sender === 'client' ? 'text-primary-100' : 'text-gray-400'}`}>
                        {new Date(msg.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                  <MessageSquare size={24} className="text-gray-300" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">Aucun message pour le moment.</p>
                <p className="mt-1 text-xs text-gray-400">Votre négociateur vous contactera dès que votre dossier aura progressé.</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-50 pt-4">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                disabled
                placeholder="Écrivez votre message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                disabled
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              L\'envoi de messages sera activé prochainement. En attendant, votre négociateur vous contacte directement.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
