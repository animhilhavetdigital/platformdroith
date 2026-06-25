import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewClientData } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { FolderOpen, Calendar, Shield, CreditCard, User, Phone, Mail, Clock } from 'lucide-react';

export default async function ClientDossierPage() {
  const isPreview = isDevAccessEnabled();
  let dossier: any = null;
  let clientProfile: any = null;

  if (isPreview) {
    dossier = devStore.dossiers[0] || getPreviewClientData('mediation').dossier;
    clientProfile = devStore.profiles.find(p => p.id === dossier.client_id) || {
      prenom: 'Nadia',
      nom: 'Alaoui',
      telephone: '+33 6 77 88 99 11',
    };
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data } = await supabase
        .from('dossiers')
        .select('*, client:profiles!dossiers_client_id_fkey(*)')
        .eq('client_id', session.user.id)
        .order('date_creation', { ascending: false })
        .limit(1)
        .single();
      
      dossier = data;
      clientProfile = data?.client;
    }
  }

  const formattedDate = dossier?.date_creation
    ? new Date(dossier.date_creation).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mon dossier</h1>
          <p className="mt-1 text-gray-500">Informations générales et état d&apos;avancement de votre procédure</p>
        </div>

        {dossier ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Dossier info */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <FolderOpen size={22} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Détails du dossier</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Référence</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 font-mono">{dossier.reference}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Statut</p>
                  <div className="mt-1">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(dossier.statut)}`}>
                      {getStatusLabel(dossier.statut)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Offre</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Médiation' : dossier.offre === '3' ? 'Relais Avocat' : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Date de création</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Client profile */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <User size={22} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Profil propriétaire</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {clientProfile ? `${clientProfile.prenom[0]}${clientProfile.nom[0]}`.toUpperCase() : 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{clientProfile ? `${clientProfile.prenom} ${clientProfile.nom}` : 'Client Preview'}</p>
                    <p className="text-xs text-gray-400">Rôle : Client plateforme</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Phone size={12} className="text-gray-400" />
                      Téléphone
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{clientProfile?.telephone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Mail size={12} className="text-gray-400" />
                      Email
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 truncate">{clientProfile?.email || 'client@preview.local'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* History logs */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6 md:col-span-2">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Clock size={22} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Historique d&apos;activité</h2>
              </div>

              <div className="flow-root">
                <ul className="-mb-8">
                  {[
                    { title: 'Création du dossier', desc: 'Dossier initialisé sur la plateforme', date: dossier.date_creation },
                    ...(dossier.date_formulaire_complete ? [{ title: 'Formulaire complété', desc: 'Réponses enregistrées et validées', date: dossier.date_formulaire_complete }] : []),
                    ...(dossier.date_upload_complete ? [{ title: 'Documents envoyés', desc: 'Pièces d\'identité et contrats transmis pour analyse', date: dossier.date_upload_complete }] : []),
                    ...(dossier.date_analyse_debut ? [{ title: 'Début d\'analyse', desc: 'Notre IA examine les documents', date: dossier.date_analyse_debut }] : []),
                    ...(dossier.date_livraison ? [{ title: 'Rapport d\'analyse livré', desc: 'Le mémoire juridique est prêt', date: dossier.date_livraison }] : []),
                    ...(dossier.statut === 'mediation_en_cours' ? [{ title: 'Médiation engagée', desc: 'Prise en charge par le négociateur', date: daysAgo(2) }] : []),
                    ...(dossier.date_cloture ? [{ title: 'Dossier clôturé', desc: 'Fin de la procédure de contestation', date: dossier.date_cloture }] : []),
                  ]
                    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
                    .map((item, idx) => (
                      <li key={idx}>
                        <div className="relative pb-8">
                          {idx !== 6 && (
                            <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 ring-8 ring-white text-primary-600 font-bold">
                                ✓
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between gap-4">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                              </div>
                              <div className="text-right text-xs whitespace-nowrap text-gray-400">
                                {item.date ? new Date(item.date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }) : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Aucun dossier actif trouvé.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
