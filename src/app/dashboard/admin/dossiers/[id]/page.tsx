import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { ArrowLeft, User, FolderOpen, Calendar, Shield, CreditCard, Clock, UserPlus, Save, Info } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

interface Props {
  params: { id: string };
}

export default async function AdminDossierDetailPage({ params }: Props) {
  const isPreview = isDevAccessEnabled();
  let dossier: any = null;
  let clientProfile: any = null;
  let negotiators: any[] = [];

  if (isPreview) {
    dossier = devStore.dossiers.find(d => d.id === params.id) || devStore.dossiers[0];
    clientProfile = devStore.profiles.find(p => p.id === dossier?.client_id) || {
      prenom: 'Nadia',
      nom: 'Alaoui',
      telephone: '+33 6 77 88 99 11',
      email: 'client@preview.local',
    };
    negotiators = devStore.profiles.filter(p => p.role === 'negotiator');
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('dossiers')
      .select('*, client:profiles!dossiers_client_id_fkey(*)')
      .eq('id', params.id)
      .single();
    
    dossier = data;
    clientProfile = data?.client;

    const { data: negs } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'negotiator');
    negotiators = negs || [];
  }

  async function handleUpdateDossier(formData: FormData) {
    'use server';

    const status = formData.get('status') as string;
    const negotiatorId = formData.get('negotiatorId') as string;

    if (isDevAccessEnabled()) {
      const match = devStore.dossiers.find(d => d.id === params.id) || devStore.dossiers[0];
      if (match) {
        match.statut = status as any;
        match.negotiator_id = negotiatorId || null;
      }
      revalidatePath(`/dashboard/admin/dossiers/${params.id}`);
      redirect(`/dashboard/admin/dossiers/${params.id}?success=Dossier mis a jour`);
    } else {
      const supabase = createServerSupabaseClient();
      await supabase
        .from('dossiers')
        .update({
          statut: status,
          negotiator_id: negotiatorId || null
        })
        .eq('id', params.id);
      
      revalidatePath(`/dashboard/admin/dossiers/${params.id}`);
    }
  }

  const statuses = [
    'nouveau', 'formulaire_en_cours', 'pieces_attendues', 'analyse_en_cours',
    'rapport_genere', 'livre', 'orientation_en_cours', 'autonomie',
    'mediation_en_cours', 'mediation_terminee', 'cloture'
  ];

  const assignedNegotiator = negotiators.find(n => n.id === dossier?.negotiator_id);

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin/dossiers"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Détail du dossier</h1>
            <p className="mt-1 text-sm text-gray-500">Supervision et gestion d&apos;attribution du dossier {dossier?.reference || 'N/A'}</p>
          </div>
        </div>

        {dossier ? (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Col: Main details */}
            <div className="md:col-span-2 space-y-6">
              {/* Dossier status card */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Informations Générales</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase">Référence</span>
                    <span className="text-sm font-bold text-gray-900 font-mono">{dossier.reference}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase">Offre</span>
                    <span className="text-sm font-bold text-gray-900">
                      {dossier.offre === '1' ? 'Diagnostic (99 €)' : dossier.offre === '2' ? 'Médiation (199 €)' : dossier.offre === '3' ? 'Accompagnement complet (399 €)' : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase">Date création</span>
                    <span className="text-sm text-gray-700 font-medium">
                      {new Date(dossier.date_creation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase">Statut actuel</span>
                    <div className="mt-1">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(dossier.statut)}`}>
                        {getStatusLabel(dossier.statut)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form responses info */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Réponses au Formulaire</h2>
                {dossier.formulaire_data && Object.keys(dossier.formulaire_data).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(dossier.formulaire_data).map(([key, val]: any) => (
                      <div key={key} className="border-b border-gray-50 pb-2">
                        <span className="block text-xs font-bold text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-800 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Formulaire non encore rempli par le client.</p>
                )}
              </div>
            </div>

            {/* Right Col: Admin controls & assignment */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <User size={18} className="text-gray-400" />
                  Profil Client
                </h3>
                <div className="text-sm space-y-2">
                  <p className="font-bold text-gray-900">{clientProfile?.prenom} {clientProfile?.nom}</p>
                  <p className="text-gray-500 truncate">{clientProfile?.email}</p>
                  <p className="text-gray-500">{clientProfile?.telephone || clientProfile?.téléphone || '—'}</p>
                </div>
              </div>

              {/* Assignment & Status Controls */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Save size={18} className="text-gray-400" />
                  Gestion &amp; Actions
                </h3>
                
                <form action={handleUpdateDossier} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Changer le statut</label>
                    <select
                      name="status"
                      defaultValue={dossier.statut}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{getStatusLabel(s)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Négociateur Assigné</label>
                    <select
                      name="negotiatorId"
                      defaultValue={dossier.negotiator_id || ''}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2"
                    >
                      <option value="">Non assigné</option>
                      {negotiators.map(n => (
                        <option key={n.id} value={n.id}>{n.prenom} {n.nom}</option>
                      ))}
                    </select>
                  </div>

                  {assignedNegotiator && (
                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                      <p className="font-bold text-slate-700">Assigné à :</p>
                      <p className="mt-0.5">{assignedNegotiator.prenom} {assignedNegotiator.nom} ({assignedNegotiator.telephone || 'Non spécifié'})</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary-500/10 hover:bg-primary-700"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Dossier introuvable.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
