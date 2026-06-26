'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payerNegociateur } from './actions';
import { CreditCard, Shield, ArrowRight, Loader2, X } from 'lucide-react';

interface PaymentModalProps {
  dossierId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ dossierId, isOpen, onClose }: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await payerNegociateur(dossierId);

    if (result.ok) {
      router.push('/dashboard/client/negociateur');
    } else {
      setError(result.error || 'Une erreur est survenue lors du paiement');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">Paiement Sécurisé</h2>
          <p className="mt-1 text-sm text-gray-500">Activez l&apos;intervention d&apos;un négociateur spécialisé pour votre dossier</p>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <span className="text-sm font-bold text-gray-600">Option Négociateur Expert</span>
            <span className="text-xl font-extrabold text-primary-600">199,00 €</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            {error && (
              <div className="rounded-xl bg-danger-50 p-4 text-sm text-danger-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-4 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  Payer 199,00 €
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
