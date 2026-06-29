import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Settings, User, Mail, Phone, Lock, Save, ShieldAlert } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ClientParametresPage() {
  const isPreview = isDevAccessEnabled();
  let profile: any = null;

  if (isPreview) {
    profile = devStore.profiles.find((p) => p.role === 'client') || {
      prenom: 'Nadia',
      nom: 'Alaoui',
      telephone: '+33 6 77 88 99 11',
      email: 'client@preview.local',
    };
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      profile = data;
    }
  }

  async function handleUpdateProfile(formData: FormData) {
    'use server';

    const prenom = formData.get('prenom') as string;
    const nom = formData.get('nom') as string;
    const telephone = formData.get('telephone') as string;

    if (isDevAccessEnabled()) {
      const client = devStore.profiles.find((p) => p.role === 'client');
      if (client) {
        client.prenom = prenom;
        client.nom = nom;
        client.téléphone = telephone; // Wait, key can be téléphone or telephone
      }
      revalidatePath('/dashboard/client/parametres');
    } else {
      const supabase = createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await supabase
          .from('profiles')
          .update({ prenom, nom, telephone })
          .eq('id', session.user.id);
        revalidatePath('/dashboard/client/parametres');
      }
    }
  }

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Paramètres</h1>
          <p className="mt-1 text-gray-500">Gérez vos informations personnelles et vos préférences de sécurité</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-black/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Profil Utilisateur</h2>
              <p className="text-xs text-gray-400">Ces informations sont partagées avec votre négociateur</p>
            </div>
          </div>

          <form action={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  required
                  defaultValue={profile?.prenom || ''}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</label>
                <input
                  type="text"
                  name="nom"
                  required
                  defaultValue={profile?.nom || ''}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
              <div className="relative">
                <input
                  type="tel"
                  name="telephone"
                  defaultValue={profile?.telephone || profile?.téléphone || ''}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-11 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2 opacity-75">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email (Non modifiable)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  defaultValue={profile?.email || 'client@preview.local'}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 pl-11 text-sm cursor-not-allowed outline-none"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {isPreview && (
              <div className="rounded-xl bg-amber-50 p-4 flex gap-3 text-xs text-amber-800 items-start">
                <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Vous êtes en mode Aperçu (Demo). Les modifications sont sauvegardées temporairement en mémoire vive locale.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white shadow-md shadow-primary-500/10 transition-all hover:bg-primary-700 hover:scale-[1.01]"
            >
              <Save size={16} />
              Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
