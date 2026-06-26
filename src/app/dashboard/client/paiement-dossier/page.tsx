import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { ShieldCheck, CreditCard, ArrowRight, Shield } from 'lucide-react';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function generateReference() {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `DH-${year}-${random}`;
}

export default async function ClientPaiementDossierPage() {
  async function handlePaymentSubmit() {
    'use server';

    const reference = generateReference();
    const newDossierId = 'dos-' + Math.random().toString(36).substr(2, 9);

    if (isDevAccessEnabled()) {
      // Create new dossier in devStore
      const newDossier = {
        id: newDossierId,
        reference,
        statut: 'formulaire_en_cours' as const,
        offre: '1' as const,
        client_id: 'preview-client',
        negotiator_id: null,
        formulaire_data: {},
        scoring_verdict: null,
        scoring_confiance: null,
        scoring_justification: null,
        montant_paye: 99.00,
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
      };

      devStore.dossiers.push(newDossier);

      // Add payment record
      devStore.clientsPayes.push({
        id: 'pay-new-' + Math.random().toString(36).substr(2, 9),
        client_first_name: 'Nadia',
        client_last_name: 'Alaoui',
        client_email: 'client@preview.local',
        client_phone: '+33 6 77 88 99 11',
        amount: 99.00,
        offer_type: '1',
        payment_type: 'initial_offer',
        payment_status: 'paid',
        platform_status: 'account_created',
        dossier_id: newDossierId,
        user_id: 'preview-client',
        created_at: new Date().toISOString(),
      });

      revalidatePath('/dashboard/client');
      redirect(`/dashboard/client/formulaire?id=${newDossierId}`);
    } else {
      const supabase = createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        redirect('/auth/login');
      }

      // Insert new dossier into Supabase
      const { data, error } = await supabase
        .from('dossiers')
        .insert({
          client_id: session.user.id,
          offre: '1',
          montant_paye: 99.00,
          date_paiement: new Date().toISOString(),
          statut: 'formulaire_en_cours',
          reference,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du dossier supplémentaire:', error);
        redirect(`/dashboard/client?error=${encodeURIComponent(error.message)}`);
      }

      revalidatePath('/dashboard/client');
      redirect(`/dashboard/client/formulaire?id=${data.id}`);
    }
  }

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="max-w-xl mx-auto space-y-8 py-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Nouveau Dossier d&apos;Expertise</h1>
          <p className="text-sm text-gray-500">Ouvrez un nouveau dossier d&apos;expertise et bénéficiez de notre diagnostic juridique automatisé</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div>
              <span className="text-sm font-bold text-gray-800">Frais d&apos;ouverture de dossier supplémentaire</span>
              <p className="text-xs text-gray-400 mt-0.5">Accès au formulaire, analyse par l&apos;IA et rapport complet</p>
            </div>
            <span className="text-xl font-extrabold text-primary-600">99,00 €</span>
          </div>

          <form action={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">Numéro de carte</label>
              <div className="relative font-sans">
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-11 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Date d&apos;expiration</label>
                <input
                  type="text"
                  required
                  placeholder="MM/AA"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">CVC</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 flex gap-3 text-xs text-gray-500 items-start">
              <Shield size={16} className="text-primary-500 shrink-0 mt-0.5" />
              <span>
                Paiement sécurisé de démonstration. En cliquant sur le bouton ci-dessous, la transaction de 99,00 € sera simulée et vous serez redirigé vers le formulaire à remplir.
              </span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-4 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.01]"
            >
              Payer 99,00 €
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
