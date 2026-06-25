import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDevAccessEnabled, getPreviewClientData } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Download, Handshake, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function ClientNegociateurPage() {
  const isPreview = isDevAccessEnabled();
  let dossier: any = null;

  if (isPreview) {
    dossier = devStore.dossiers[0] || getPreviewClientData('report').dossier;
  } else {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data } = await supabase
        .from('dossiers')
        .select('*')
        .eq('client_id', session.user.id)
        .order('date_creation', { ascending: false })
        .limit(1)
        .single();
      dossier = data;
    }
  }

  async function handleAutonomy() {
    'use server';
    if (isDevAccessEnabled()) {
      if (devStore.dossiers[0]) {
        devStore.dossiers[0].statut = 'autonomie';
      }
      redirect('/dashboard/client?message=Mode Autonomie active');
    } else {
      const supabase = createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session && dossier) {
        await supabase
          .from('dossiers')
          .update({ statut: 'autonomie' })
          .eq('id', dossier.id);
        
        revalidatePath('/dashboard/client');
        redirect('/dashboard/client');
      }
    }
  }

  const isAlreadyNegotiation = ['mediation_en_cours', 'mediation_terminee', 'negociation_payment_pending', 'negociation_paid', 'negociation_en_attente_assignation', 'negociation_en_cours', 'negociation_terminee', 'resultat_positif', 'resultat_negatif', 'cloture'].includes(dossier?.statut);

  return (
    <DashboardLayout allowedRoles={['client']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Étape suivante : Négociation</h1>
          <p className="mt-1 text-gray-500">Suite à la livraison de votre rapport, choisissez comment vous souhaitez poursuivre les démarches</p>
        </div>

        {isAlreadyNegotiation ? (
          <div className="rounded-2xl border border-success-100 bg-success-50/40 p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Option Négociateur active</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Vous avez déjà opté pour l&apos;intervention complémentaire d&apos;un négociateur. Suivez les étapes de négociation en temps réel sur votre tableau de bord.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/client"
                className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-6 py-3 font-bold text-white shadow-md shadow-success-500/10 transition-all hover:bg-success-700"
              >
                Retourner au tableau de bord
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Box 1: Autonomie */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                  <Download size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Télécharger mon dossier et continuer seul</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Récupérez votre mémoire juridique d&apos;expertise et toutes vos pièces. Vous pourrez mener vous-même la réclamation amiable ou contentieuse auprès de l&apos;organisme de crédit.
                </p>
                <ul className="space-y-2 text-xs font-semibold text-gray-600">
                  <li className="flex items-center gap-2">✓ Mémoire juridique complet</li>
                  <li className="flex items-center gap-2">✓ Modèles de courriers types</li>
                  <li className="flex items-center gap-2">✓ Sans frais supplémentaires</li>
                </ul>
              </div>

              <form action={handleAutonomy} className="pt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Continuer en autonomie
                </button>
              </form>
            </div>

            {/* Box 2: Negotiator */}
            <div className="relative rounded-2xl border border-primary-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6 transition-all hover:shadow-md">
              <div className="absolute -top-3.5 right-6 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles size={10} />
                Recommandé
              </div>

              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Handshake size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Demander l&apos;intervention d&apos;un négociateur</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Un négociateur expérimenté de notre cabinet prend le relais sur votre dossier. Il contacte directement l&apos;organisme de crédit, gère les échanges officiels et cherche un accord.
                </p>
                <ul className="space-y-2 text-xs font-semibold text-gray-600">
                  <li className="flex items-center gap-2">✓ Négociateur dédié affecté</li>
                  <li className="flex items-center gap-2">✓ Relances et suivi d&apos;accord officiel</li>
                  <li className="flex items-center gap-2">✓ Rapport de médiation final fourni</li>
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-baseline justify-between border-t border-gray-50 pt-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tarif optionnel</span>
                  <span className="text-xl font-extrabold text-primary-600">199 €</span>
                </div>
                <Link
                  href="/dashboard/client/negociateur/paiement"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary-700 hover:scale-[1.01] shadow-md shadow-primary-500/10"
                >
                  Demander un négociateur
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
