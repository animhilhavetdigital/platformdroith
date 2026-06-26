import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { CreditCard, UserPlus, Mail, AlertCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function AdminClientsPayesPage() {
  const isPreview = isDevAccessEnabled();
  let clientsPayes: any[] = [];

  if (isPreview) {
    clientsPayes = devStore.clientsPayes.filter(c => c.platform_status === 'to_create');
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('payments') // If payments table exists
      .select('*')
      .eq('platform_status', 'to_create');
    clientsPayes = data || [];
  }

  async function handleAddClient(formData: FormData) {
    'use server';

    const paymentId = formData.get('paymentId') as string;

    if (isDevAccessEnabled()) {
      const payment = devStore.clientsPayes.find(p => p.id === paymentId);
      if (payment) {
        // 1. Create client profile
        const newClientId = 'client-' + Math.random().toString(36).substr(2, 9);
        devStore.profiles.push({
          id: newClientId,
          role: 'client',
          nom: payment.client_last_name,
          prenom: payment.client_first_name,
          téléphone: payment.client_phone,
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // 2. Create dossier
        const newDossierId = 'dos-' + Math.random().toString(36).substr(2, 9);
        devStore.dossiers.push({
          id: newDossierId,
          reference: 'DH-2026-' + Math.floor(100000 + Math.random() * 900000),
          statut: 'formulaire_en_cours',
          offre: payment.offer_type,
          client_id: newClientId,
          negotiator_id: null,
          formulaire_data: {},
          scoring_verdict: null,
          scoring_confiance: null,
          scoring_justification: null,
          montant_paye: payment.amount,
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

        // 3. Log sent email
        devStore.emails.push({
          id: 'mail-' + Math.random().toString(36).substr(2, 9),
          email: payment.client_email,
          prenom: payment.client_first_name,
          subject: 'Votre espace client est pret',
          type: 'acces_client',
          status: 'sent',
          created_at: new Date().toISOString(),
        });

        // 4. Update payment status
        payment.platform_status = 'account_created';
        payment.user_id = newClientId;
        payment.dossier_id = newDossierId;
      }
      revalidatePath('/dashboard/admin/clients-payes');
      redirect('/dashboard/admin/clients-payes?success=Compte cree avec succes');
    } else {
      const supabase = createServerSupabaseClient();
      // Fetch payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (payment) {
        // Create user in Supabase auth (typically you'd invite them, here we insert profile for simplicity/matching schema trigger)
        // Wait, for Supabase production, we can call auth signup/invite.
        // We will insert in profiles and dossiers:
        const { data: userProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert({
            nom: payment.client_last_name,
            prenom: payment.client_first_name,
            telephone: payment.client_phone,
            role: 'client'
          })
          .select()
          .single();

        if (userProfile) {
          // Create dossier
          await supabase.from('dossiers').insert({
            client_id: userProfile.id,
            offre: payment.offer_type,
            statut: 'formulaire_en_cours',
            montant_paye: payment.amount,
          });

          // Update payment status
          await supabase
            .from('payments')
            .update({ platform_status: 'account_created', user_id: userProfile.id })
            .eq('id', paymentId);
        }
      }
      revalidatePath('/dashboard/admin/clients-payes');
    }
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Clients payés</h1>
          <p className="mt-1 text-gray-500">Ajoutez à la plateforme les clients ayant validé leur paiement externe</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date Paiement</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut Paiement</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientsPayes.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{client.client_first_name} {client.client_last_name}</p>
                      <p className="text-xs text-gray-400">{client.client_email} • {client.client_phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {client.offer_type === '1' ? 'Diagnostic' : client.offer_type === '2' ? 'Médiation' : client.offer_type === '3' ? 'Accompagnement complet' : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{client.amount} €</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                      Complété
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={handleAddClient}>
                      <input type="hidden" name="paymentId" value={client.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
                      >
                        <UserPlus size={14} />
                        Ajouter à la plateforme
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {clientsPayes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} className="text-gray-300" />
                      <span>Aucun paiement en attente de création de compte.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
