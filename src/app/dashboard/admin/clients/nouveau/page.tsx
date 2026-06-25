import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function AdminCreateClientPage() {
  async function handleCreateClient(formData: FormData) {
    'use server';

    const prenom = formData.get('prenom') as string;
    const nom = formData.get('nom') as string;
    const email = formData.get('email') as string;
    const telephone = formData.get('telephone') as string;
    const offre = formData.get('offre') as '1' | '2' | '3';

    if (isDevAccessEnabled()) {
      const newClientId = 'client-' + Math.random().toString(36).substr(2, 9);
        devStore.profiles.push({
          id: newClientId,
          role: 'client',
          nom,
          prenom,
          téléphone: telephone,
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        const newDossierId = 'dos-' + Math.random().toString(36).substr(2, 9);
        devStore.dossiers.push({
          id: newDossierId,
          reference: 'DH-2026-' + Math.floor(100000 + Math.random() * 900000),
          statut: 'formulaire_en_cours',
          offre,
          client_id: newClientId,
          negotiator_id: null,
          formulaire_data: {},
          scoring_verdict: null,
          scoring_confiance: null,
          scoring_justification: null,
          montant_paye: offre === '1' ? 99.00 : offre === '2' ? 199.00 : 399.00,
          stripe_payment_id: null,
          date_paiement: new Date().toISOString(),
          date_creation: new Date().toISOString(),
          date_formulaire_complete: null,
          date_upload_complete: null,
          date_analyse_debut: null,
          date_livraison: null,
          date_cloture: null,
          rapport_url: null,
          rapport_data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      devStore.emails.push({
        id: 'mail-' + Math.random().toString(36).substr(2, 9),
        email,
        prenom,
        subject: 'Votre espace client est pret',
        type: 'acces_client',
        status: 'sent',
        created_at: new Date().toISOString(),
      });

      revalidatePath('/dashboard/super-admin/clients');
      redirect('/dashboard/super-admin/clients?message=Client cree avec succes');
    } else {
      const supabase = createServerSupabaseClient();
      
      const { data: userProfile, error: profileErr } = await supabase
        .from('profiles')
        .insert({
          nom,
          prenom,
          telephone,
          role: 'client'
        })
        .select()
        .single();

      if (userProfile) {
        await supabase.from('dossiers').insert({
          client_id: userProfile.id,
          offre,
          statut: 'formulaire_en_cours'
        });
      }
      revalidatePath('/dashboard/super-admin/clients');
      redirect('/dashboard/super-admin/clients');
    }
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/super-admin/clients"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Créer un client</h1>
            <p className="mt-1 text-gray-500">Ajouter manuellement un compte client et son dossier associé</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Nouveau Client</h2>
              <p className="text-xs text-gray-400">Un e-mail d&apos;accès automatique lui sera envoyé</p>
            </div>
          </div>

          <form action={handleCreateClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  required
                  placeholder="ex: Youssef"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</label>
                <input
                  type="text"
                  name="nom"
                  required
                  placeholder="ex: Benjelloun"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="client@domaine.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  required
                  placeholder="+33 6 ..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Offre achetée</label>
              <select
                name="offre"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="1">Offre 1 : Diagnostic (99 €)</option>
                <option value="2">Offre 2 : Médiation (199 €)</option>
                <option value="3">Offre 3 : Relais Avocat (399 €)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.01]"
            >
              <Save size={16} />
              Créer le Client &amp; Envoyer l&apos;e-mail d&apos;accès
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
