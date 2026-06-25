import { redirect } from 'next/navigation';
import { ArrowLeft, Scale, Mail, Phone, Clock, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createServerSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function ClientAvocatPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { data: dossier } = await supabase
    .from('dossiers')
    .select('*')
    .eq('client_id', session.user.id)
    .order('date_creation', { ascending: false })
    .limit(1)
    .single();

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/dashboard/client/rapport"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-500 shadow-sm transition-colors hover:border-gray-200 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Retour au rapport
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Relais avocat</h1>
          <p className="mt-2 text-gray-500">
            Votre dossier a été transmis à un avocat partenaire pour la suite contentieuse.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-8 shadow-xl shadow-purple-100/30">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
              <Scale size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transmission en cours</h2>
              <p className="text-sm text-gray-500">Dossier {dossier?.reference || '—'}</p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-gray-600">
            Après analyse de la médiation, votre situation nécessite une action contentieuse. Un avocat partenaire va étudier votre dossier et vous contacter directement pour vous accompagner dans la suite des démarches judiciaires.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Mail size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Email</h3>
            <p className="mt-2 text-sm font-semibold text-gray-900">avocat@droithabitat.fr</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Phone size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Téléphone</h3>
            <p className="mt-2 text-sm font-semibold text-gray-900">+33 1 23 45 67 89</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Clock size={20} className="text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Prochaines étapes</h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">1</span>
              L&apos;avocat reçoit votre dossier complet et le rapport de médiation.
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">2</span>
              Il vous contacte sous 48h pour un premier échange.
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">3</span>
              Il vous propose une stratégie contentieuse adaptée à votre situation.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <FileText size={20} className="text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Documents partagés</h3>
          </div>
          <p className="text-sm text-gray-600">
            L&apos;avocat a accès à l&apos;ensemble des documents, du formulaire et des rapports que vous avez déposés sur la plateforme.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
