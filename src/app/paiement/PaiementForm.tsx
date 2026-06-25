'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Shield, ArrowRight, Lock, CheckCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PaiementForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const offreId = searchParams.get('offre') || '2';

  const offres: Record<string, { nom: string; prix: string; prixNum: string }> = {
    '1': { nom: 'Diagnostic', prix: '99 €', prixNum: '99' },
    '2': { nom: 'Médiation', prix: '199 €', prixNum: '199' },
    '3': { nom: 'Relais Avocat', prix: '399 €', prixNum: '399' },
  };

  const offre = offres[offreId] || offres['2'];
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handlePay() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => router.push('/onboarding'), 1200);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-expertise.png" alt="DroitHabitat" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl items-start gap-8 px-6 pt-32 pb-20">
        {/* Recap */}
        <div className="hidden w-80 shrink-0 lg:block">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-100/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Résumé</h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Offre</span>
              <span className="font-bold text-gray-900">{offre.nom}</span>
            </div>
            <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-primary-600">{offre.prix}</span>
            </div>
            <div className="mt-4 rounded-xl bg-gray-50 p-4 flex items-start gap-3">
              <Shield size={18} className="mt-0.5 shrink-0 text-success-600" />
              <p className="text-xs text-gray-500">Paiement sécurisé par Stripe. Vos données sont chiffrées de bout en bout.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <CreditCard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Paiement sécurisé</h1>
              <p className="text-sm text-gray-500">Offre sélectionnée : <strong className="text-gray-900">{offre.nom}</strong> — {offre.prix}</p>
            </div>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-50">
                <CheckCircle className="text-success-600" size={40} />
              </div>
              <p className="text-xl font-bold text-success-900">Paiement confirmé !</p>
              <p className="text-sm text-gray-500">Redirection vers votre espace...</p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Numéro de carte</label>
                  <div className="mt-2 relative">
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Expiration</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02] disabled:opacity-60"
              >
                <Lock size={18} />
                {loading ? 'Traitement en cours...' : `Payer ${offre.prix}`}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield size={14} />
                Paiement 100% sécurisé — Certification PCI DSS
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
