import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { ShieldCheck, CreditCard, ArrowRight, Shield } from 'lucide-react';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function ClientPaiementNegociateurPage() {
  async function handlePaymentSubmit() {
    'use server';

    if (isDevAccessEnabled()) {
      // 1. Update mock dossier
      if (devStore.dossiers[0]) {
        devStore.dossiers[0].statut = 'mediation_en_cours'; // Let's set it directly to active negotiator flow so negotiator can see it!
        devStore.dossiers[0].montant_paye = (devStore.dossiers[0].montant_paye || 0) + 199.00;
        
        // Ensure mediation steps exist
        devStore.mediationEtapes[devStore.dossiers[0].id] = [
          { id: 'et-1', dossier_id: devStore.dossiers[0].id, label: 'Prise de contact client', ordre: 1, complete: true, completed_at: new Date().toISOString(), completed_by: 'preview-negotiator', created_at: new Date().toISOString() },
          { id: 'et-2', dossier_id: devStore.dossiers[0].id, label: 'Constitution du dossier de contestation', ordre: 2, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
          { id: 'et-3', dossier_id: devStore.dossiers[0].id, label: 'Notification officielle a l\'organisme', ordre: 3, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
          { id: 'et-4', dossier_id: devStore.dossiers[0].id, label: 'Negociation des conditions d\'accord', ordre: 4, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
          { id: 'et-5', dossier_id: devStore.dossiers[0].id, label: 'Resolution amiable finale', ordre: 5, complete: false, completed_at: null, completed_by: null, created_at: new Date().toISOString() },
        ];
      }

      // 2. Add payment record
      devStore.clientsPayes.push({
        id: 'pay-new-' + Math.random().toString(36).substr(2, 9),
        client_first_name: 'Nadia',
        client_last_name: 'Alaoui',
        client_email: 'client@preview.local',
        client_phone: '+33 6 77 88 99 11',
        amount: 199.00,
        offer_type: '2',
        payment_type: 'negotiator_option',
        payment_status: 'paid',
        platform_status: 'account_created',
        dossier_id: devStore.dossiers[0]?.id,
        user_id: 'preview-client',
        created_at: new Date().toISOString(),
      });

      redirect('/dashboard/client?message=Option negociateur payee avec succes');
    } else {
      const supabase = createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Find latest dossier
        const { data: dossier } = await supabase
          .from('dossiers')
          .select('id')
          .eq('client_id', session.user.id)
          .order('date_creation', { ascending: false })
          .limit(1)
          .single();

        if (dossier) {
          // Update status to mediation_en_cours / paid status
          await supabase
            .from('dossiers')
            .update({
              statut: 'mediation_en_cours',
              montant_paye: 199.00 // option négociateur price
            })
            .eq('id', dossier.id);

          // Initialize mediation steps in SQL
          const steps = [
            { dossier_id: dossier.id, label: 'Prise de contact client', ordre: 1, complete: true, completed_at: new Date().toISOString() },
            { dossier_id: dossier.id, label: 'Constitution du dossier de contestation', ordre: 2, complete: false },
            { dossier_id: dossier.id, label: 'Notification officielle a l\'organisme', ordre: 3, complete: false },
            { dossier_id: dossier.id, label: 'Negociation des conditions d\'accord', ordre: 4, complete: false },
            { dossier_id: dossier.id, label: 'Resolution amiable finale', ordre: 5, complete: false },
          ];

          await supabase.from('mediation_etapes').insert(steps);
        }
        
        revalidatePath('/dashboard/client');
        redirect('/dashboard/client');
      }
    }
  }

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="max-w-xl mx-auto space-y-8 py-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Paiement Sécurisé</h1>
          <p className="text-sm text-gray-500">Activez l&apos;intervention d&apos;un négociateur spécialisé pour votre dossier</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <span className="text-sm font-bold text-gray-600">Option Négociateur Expert</span>
            <span className="text-xl font-extrabold text-primary-600">199,00 €</span>
          </div>

          <form action={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Numéro de carte</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-11 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Paiement de démonstration. En cliquant sur le bouton ci-dessous, la transaction sera validée et le dossier sera immédiatement assigné au négociateur.
              </span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-4 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.01]"
            >
              Payer 199,00 €
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
