import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, MessageSquare, Sparkles, UserCheck } from 'lucide-react';
import PreviewScenarioNav from '@/components/client/PreviewScenarioNav';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  buildPreviewHref,
  getPreviewClientData,
  isDevAccessEnabled,
  normalizePreviewClientScenario,
  PreviewClientScenario,
} from '@/lib/dev-access';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getStatusLabel } from '@/lib/utils';
import { choisirOrientation } from './actions';

interface Props {
  searchParams?: { scenario?: string };
}

export default async function ClientOrientationPage({ searchParams }: Props) {
  let dossier: any = null;
  const isPreview = isDevAccessEnabled();
  const previewScenario = normalizePreviewClientScenario(searchParams?.scenario);

  if (isPreview) {
    dossier = getPreviewClientData(previewScenario).dossier;
  } else {
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) redirect('/auth/login');

    const { data } = await supabase
      .from('dossiers')
      .select('*')
      .eq('client_id', session.user.id)
      .order('date_creation', { ascending: false })
      .limit(1)
      .single();

    dossier = data;
  }

  const options: Array<{
    id: 'autonomie' | 'mediation';
    icon: React.ReactNode;
    title: string;
    desc: string;
    highlight: boolean;
    previewScenario: PreviewClientScenario;
  }> = [
    {
      id: 'autonomie',
      icon: <UserCheck size={28} />,
      title: 'Autonomie',
      desc: "J'agis seul avec mon dossier et mon rapport.",
      highlight: false,
      previewScenario: 'autonomy',
    },
    {
      id: 'mediation',
      icon: <MessageSquare size={28} />,
      title: 'Mediation',
      desc: 'Droit Habitat prend le relais pour une conciliation amiable.',
      highlight: true,
      previewScenario: 'mediation',
    },
  ];

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="w-full space-y-8">
        {isPreview && (
          <PreviewScenarioNav
            currentPath="/dashboard/client/orientation"
            currentScenario={previewScenario}
          />
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
            <Sparkles size={14} />
            Etape finale
          </div>
          <h1 className="mt-5 text-3xl font-extrabold text-gray-900">Choisissez la suite</h1>
          <p className="mt-2 text-gray-500">Que voulez-vous faire de votre dossier ?</p>
        </div>

        {dossier && (
          <div className="rounded-xl bg-gray-50 px-6 py-3 text-center text-sm text-gray-600">
            Dossier <span className="font-mono font-bold text-gray-900">{dossier.reference}</span>{' '}
            - {getStatusLabel(dossier.statut)}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {options.map((opt) =>
            isPreview ? (
              <Link
                key={opt.id}
                href={buildPreviewHref('/dashboard/client', opt.previewScenario)}
                className={`group flex h-full flex-col items-center rounded-2xl border p-8 text-center transition-all hover:-translate-y-1 ${
                  opt.highlight
                    ? 'border-primary-500 bg-gradient-to-b from-primary-50/50 to-white shadow-xl shadow-primary-200/30'
                    : 'border-gray-100 bg-white shadow-lg shadow-gray-100/50 hover:border-primary-200'
                }`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${opt.highlight ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                  {opt.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{opt.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{opt.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary-700 transition-transform group-hover:translate-x-1">
                  Voir ce scenario <ArrowRight size={16} />
                </span>
              </Link>
            ) : (
              <form
                key={opt.id}
                action={async () => {
                  'use server';
                  await choisirOrientation(dossier?.id || 'preview', opt.id);
                }}
              >
                <button
                  type="submit"
                  className={`group flex h-full w-full flex-col items-center rounded-2xl border p-8 text-center transition-all hover:-translate-y-1 ${
                    opt.highlight
                      ? 'border-primary-500 bg-gradient-to-b from-primary-50/50 to-white shadow-xl shadow-primary-200/30'
                      : 'border-gray-100 bg-white shadow-lg shadow-gray-100/50 hover:border-primary-200'
                  }`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${opt.highlight ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                    {opt.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{opt.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{opt.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary-700 transition-transform group-hover:translate-x-1">
                    Choisir <ArrowRight size={16} />
                  </span>
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
