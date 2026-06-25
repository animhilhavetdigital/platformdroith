import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Receipt, Search, CreditCard, DollarSign } from 'lucide-react';

export default async function AdminPaiementsPage() {
  const isPreview = isDevAccessEnabled();
  let payments: any[] = [];

  if (isPreview) {
    payments = devStore.clientsPayes || [];
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    payments = data || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Historique des Paiements</h1>
          <p className="mt-1 text-gray-500">Supervision financière des transactions et abonnements d&apos;offre</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">ID Transaction</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Type d&apos;option</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((pay) => (
                <tr key={pay.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">{pay.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{pay.client_first_name} {pay.client_last_name}</p>
                      <p className="text-xs text-gray-400">{pay.client_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {pay.payment_type === 'initial_offer' ? 'Offre initiale' : 'Option Négociateur 199€'}
                  </td>
                  <td className="px-6 py-4 text-sm font-extrabold text-gray-900">{pay.amount} €</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                      Réussi
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(pay.created_at || pay.date_paiement).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun paiement enregistré.
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
