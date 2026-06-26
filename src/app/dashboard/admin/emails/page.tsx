import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Mail, Search, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminEmailsPage() {
  const isPreview = isDevAccessEnabled();
  let emails: any[] = [];

  if (isPreview) {
    emails = devStore.emails || [];
  } else {
    // If no emails table exists in SQL, we fallback to a mock/simulation in production too
    emails = devStore.emails || [];
  }

  async function handleResendEmail(formData: FormData) {
    'use server';
    // Simulate resend
    revalidatePath('/dashboard/admin/emails');
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">E-mails envoyés</h1>
          <p className="mt-1 text-gray-500">Journal d&apos;activité des invitations, notifications et réinitialisations d&apos;accès</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Destinataire</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Sujet</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Type de mail</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date d&apos;envoi</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut de réception</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {emails.map((mail) => (
                <tr key={mail.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {mail.prenom} ({mail.email})
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{mail.subject}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {mail.type === 'acces_client' ? 'Création de compte' : 'Notification Rapport'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(mail.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                      <CheckCircle size={10} />
                      Délivré
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={handleResendEmail}>
                      <input type="hidden" name="emailId" value={mail.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw size={12} />
                        Renvoyer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {emails.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun e-mail envoyé dans le journal d&apos;historique.
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
