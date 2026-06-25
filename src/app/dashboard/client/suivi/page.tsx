import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewClientData } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { MessageSquare, Calendar, User, ArrowRight } from 'lucide-react';

export default async function ClientSuiviPage() {
  const isPreview = isDevAccessEnabled();
  let events: any[] = [];

  if (isPreview) {
    const dossier = devStore.dossiers[0] || getPreviewClientData('mediation').dossier;
    events = [
      { id: '1', title: 'Analyse IA lancée', desc: 'Les documents d\'identité, de crédit et de facturation ont été chargés avec succès.', date: daysAgo(5), user: 'IA Classifier' },
      { id: '2', title: 'Mémoire juridique édité', desc: 'Le rapport d\'éligibilité a été rédigé avec un verdict favorable d\'action.', date: daysAgo(2), user: 'IA Expert' },
      ...(dossier.statut === 'mediation_en_cours' ? [
        { id: '3', title: 'Négociateur assigné', desc: 'Le négociateur Samir Bennani a pris en charge votre dossier pour entamer les recours amiables.', date: daysAgo(2), user: 'Système' },
        { id: '4', title: 'Appel d\'introduction', desc: 'Premier échange téléphonique pour cadrer les préjudices subis.', date: daysAgo(1), user: 'Samir Bennani' },
      ] : []),
    ];
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: dossier } = await supabase
        .from('dossiers')
        .select('id')
        .eq('client_id', session.user.id)
        .order('date_creation', { ascending: false })
        .limit(1)
        .single();

      if (dossier) {
        const { data: actions } = await supabase
          .from('historique_actions')
          .select('*')
          .eq('dossier_id', dossier.id)
          .order('created_at', { ascending: false });

        events = (actions || []).map(a => ({
          id: a.id,
          title: a.action,
          desc: a.details?.message || a.action,
          date: a.created_at,
          user: 'Système',
        }));
      }
    }
  }

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Suivi &amp; Messages</h1>
          <p className="mt-1 text-gray-500">Consultez les dernières notes et étapes franchies par notre équipe sur votre dossier</p>
        </div>

        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-start gap-4 transition-all hover:border-gray-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <MessageSquare size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-gray-900">{event.title}</h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{event.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 pt-2">
                    <User size={12} />
                    <span>Auteur : {event.user}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <p className="text-gray-500">Aucun message d&apos;activité pour le moment.</p>
            </div>
          )}
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
