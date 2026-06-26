'use client';

import { useMemo, useState } from 'react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { Dossier } from '@/types';
import {
  Receipt,
  Search,
  X,
  Calendar,
  FolderOpen,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

interface Payment {
  id: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone?: string;
  amount: number;
  offer_type: '1' | '2' | '3';
  payment_type: 'initial_offer' | 'negotiator_option';
  payment_status: 'paid' | 'failed' | 'pending';
  platform_status: 'to_create' | 'account_created';
  dossier_id?: string;
  user_id?: string;
  created_at: string;
}

interface Props {
  payments: Payment[];
  dossierMap: Map<string, Dossier>;
}

function offerLabel(offer: '1' | '2' | '3'): string {
  if (offer === '1') return 'Diagnostic';
  if (offer === '2') return 'Médiation';
  return 'Accompagnement complet';
}

function paymentStatusBadge(status: string) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
        <CheckCircle2 size={10} />
        Réussi
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 border border-red-100">
        <XCircle size={10} />
        Échoué
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 border border-amber-100">
      <Clock size={10} />
      En attente
    </span>
  );
}

export default function PaiementsContent({ payments, dossierMap }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        `${p.client_first_name} ${p.client_last_name}`.toLowerCase().includes(q) ||
        p.client_email.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [payments, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Historique des paiements</h1>
        <p className="mt-1 text-gray-500">Supervision financière des transactions et abonnements d&apos;offre</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un paiement..."
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut paiement</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut dossier</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((pay) => {
              const dossier = pay.dossier_id ? dossierMap.get(pay.dossier_id) : undefined;
              return (
                <tr key={pay.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {pay.client_first_name} {pay.client_last_name}
                      </p>
                      <p className="text-xs text-gray-400">{pay.client_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{offerLabel(pay.offer_type)}</td>
                  <td className="px-6 py-4 text-sm font-extrabold text-gray-900">{pay.amount.toFixed(2)} €</td>
                  <td className="px-6 py-4">{paymentStatusBadge(pay.payment_status)}</td>
                  <td className="px-6 py-4">
                    {dossier ? (
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dossier.statut)}`}>
                        {getStatusLabel(dossier.statut)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(pay.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelected(pay)}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  Aucun paiement enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Receipt size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Détail du paiement</h2>
                  <p className="text-xs text-gray-400">{selected.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Client</span>
                  <p className="text-sm font-bold text-gray-900">
                    {selected.client_first_name} {selected.client_last_name}
                  </p>
                  <p className="text-xs text-gray-500">{selected.client_email}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Téléphone</span>
                  <p className="text-sm text-gray-700">{selected.client_phone || '—'}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Offre</span>
                  <p className="text-sm font-bold text-gray-900">{offerLabel(selected.offer_type)}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Montant</span>
                  <p className="text-sm font-bold text-gray-900">{selected.amount.toFixed(2)} €</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Type</span>
                  <p className="text-sm text-gray-700">
                    {selected.payment_type === 'initial_offer' ? 'Offre initiale' : 'Option négociateur'}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Plateforme</span>
                  <p className="text-sm text-gray-700">
                    {selected.platform_status === 'to_create' ? 'Compte à créer' : 'Compte créé'}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Paiement</span>
                  <p className="text-sm text-gray-700">{paymentStatusBadge(selected.payment_status)}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Date</span>
                  <p className="text-sm text-gray-700 flex items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    {new Date(selected.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {selected.dossier_id && dossierMap.get(selected.dossier_id) && (
                <div className="border-t border-gray-50 pt-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <FolderOpen size={16} className="text-gray-400" />
                    Dossier lié
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">Référence</span>
                      <p className="font-mono font-bold text-gray-900">
                        {dossierMap.get(selected.dossier_id)?.reference}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">Statut</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(
                          dossierMap.get(selected.dossier_id)?.statut || ''
                        )}`}
                      >
                        {getStatusLabel(dossierMap.get(selected.dossier_id)?.statut || '')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
