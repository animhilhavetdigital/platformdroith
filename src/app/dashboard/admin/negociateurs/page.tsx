import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Handshake, Phone, Mail, UserCheck } from 'lucide-react';

export default async function AdminNegociateursPage() {
  const isPreview = isDevAccessEnabled();
  let negotiators: any[] = [];

  if (isPreview) {
    negotiators = devStore.profiles.filter(p => p.role === 'negotiator');
  } else {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'negotiator')
      .order('created_at', { ascending: false });
    negotiators = data || [];
  }

  return (
    <DashboardLayout allowedRoles={['super_admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Négociateurs</h1>
          <p className="mt-1 text-gray-500">Gérez les négociateurs et conseillers assignés aux dossiers clients</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {negotiators.map((neg) => (
            <div key={neg.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {`${neg.prenom[0]}${neg.nom[0]}`.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{neg.prenom} {neg.nom}</h3>
                  <span className="inline-flex items-center gap-1 rounded bg-success-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success-700">
                    <UserCheck size={10} />
                    Actif
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-500 border-t border-gray-50 pt-3">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span>{neg.telephone || neg.téléphone || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{neg.email || 'samir.bennani@example.com'}</span>
                </div>
              </div>
            </div>
          ))}
          {negotiators.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm col-span-3">
              <p className="text-gray-500">Aucun négociateur enregistré.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
