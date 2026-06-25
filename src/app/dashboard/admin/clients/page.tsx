import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Users, Search, ArrowRight, UserPlus, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default async function AdminClientsPage() {
  const isPreview = isDevAccessEnabled();
  let clients: any[] = [];

  if (isPreview) {
    clients = devStore.profiles.filter(p => p.role === 'client');
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('profiles')
      .select('*, dossiers(count)')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    
    clients = (data || []).map(c => ({
      ...c,
      assigned: c.dossiers?.[0]?.count || 0
    }));
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Clients</h1>
            <p className="mt-1 text-gray-500">Liste des clients enregistrés sur la plateforme</p>
          </div>
          <Link
            href="/dashboard/super-admin/clients/nouveau"
            className="flex h-10 items-center gap-1.5 rounded-xl bg-primary-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <UserPlus size={16} />
            Créer un client
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Téléphone</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Dossiers</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date d&apos;inscription</th>
                <th className="w-12 px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600 shadow-sm">
                        {`${client.prenom[0]}${client.nom[0]}`.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{client.prenom} {client.nom}</p>
                        <p className="text-xs text-gray-400">ID : {client.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{client.telephone || client.téléphone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client.email || 'client@preview.local'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{client.assigned ?? 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Find client's dossier id to link to detail page */}
                    <Link
                      href={`/dashboard/super-admin/dossiers`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun client créé.
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
