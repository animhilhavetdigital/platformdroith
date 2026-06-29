'use client';

import { useMemo, useState } from 'react';
import { UnifiedClientRow } from './page';
import { addClientFromPayment, createClient, updateClient, deleteClient } from './actions';
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  AlertCircle,
  X,
  Save,
  ArrowRight,
  Lock,
  Trash2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';


interface Props {
  rows: UnifiedClientRow[];
}

function offerLabel(offre: '1' | '2' | '3' | null): string {
  if (offre === '1') return 'Diagnostic';
  if (offre === '2') return 'Médiation';
  return 'N/A';
}

export default function ClientsContent({ rows }: Props) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<UnifiedClientRow | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<Set<string>>(new Set());

  const toggleMobileExpand = (id: string) => {
    const next = new Set(expandedMobile);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMobile(next);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        `${r.prenom} ${r.nom}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Clients</h1>
          <p className="mt-1 text-gray-500">Clients payés en attente et comptes déjà créés</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-primary-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          <UserPlus size={16} />
          Créer un client
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, e-mail ou téléphone..."
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/10">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((row) => (
              <tr key={`${row.type}-${row.id}`} className="transition-colors hover:bg-gray-50/60">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600 shadow-sm">
                      {`${row.prenom[0]}${row.nom[0]}`.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {row.prenom} {row.nom}
                      </p>
                      <p className="text-xs text-gray-400">ID : {row.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-400" />
                      <span className="truncate max-w-[160px]">{row.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400" />
                      <span>{row.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">{offerLabel(row.offer)}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.amount.toFixed(2)} €</td>
                <td className="px-6 py-4">
                  {row.status === 'pending' && (
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 border border-amber-100">
                      En attente
                    </span>
                  )}
                  {row.status === 'added' && (
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 border border-blue-100">
                      Ajouté
                    </span>
                  )}
                  {row.status === 'active' && (
                    <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                      Actif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(row.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                  {row.type === 'pending' ? (
                    <form action={addClientFromPayment.bind(null, row.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
                      >
                        <UserPlus size={14} />
                        Ajouter à la plateforme
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedClient(row)}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      Détails
                      <ArrowRight size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="text-gray-300" />
                    <span>Aucun client trouvé.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((row) => {
          const isExpanded = expandedMobile.has(row.id);
          const statusBadge =
            row.status === 'pending' ? (
              <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 border border-amber-100">
                En attente
              </span>
            ) : row.status === 'added' ? (
              <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 border border-blue-100">
                Ajouté
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                Actif
              </span>
            );
          return (
            <div key={`${row.type}-${row.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-black/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMobileExpand(row.id)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <ChevronDown size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {row.prenom} {row.nom}
                  </p>
                  <p className="text-xs text-gray-500 truncate">ID : {row.id.slice(0, 8)}…</p>
                </div>
                {statusBadge}
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-400" />
                        <span className="truncate font-medium text-gray-600">{row.email}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Téléphone</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-600">{row.phone}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</span>
                      <span className="mt-1 block font-semibold text-gray-700">{offerLabel(row.offer)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Montant</span>
                      <span className="mt-1 block font-bold text-gray-900">{row.amount.toFixed(2)} €</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</span>
                      <span className="mt-1 block font-medium text-gray-600">{new Date(row.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {row.type === 'pending' ? (
                      <form action={addClientFromPayment.bind(null, row.id)}>
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
                        >
                          <UserPlus size={14} />
                          Ajouter à la plateforme
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedClient(row)}
                        className="flex w-full items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      >
                        Détails
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Aucun client trouvé.
          </div>
        )}
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600">
                  {`${selectedClient.prenom[0]}${selectedClient.nom[0]}`.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedClient.prenom} {selectedClient.nom}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedClient.status === 'active' ? 'Actif' : 'Ajouté'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form action={updateClient.bind(null, selectedClient.id)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedClient.email}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="telephone"
                    defaultValue={selectedClient.phone}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nouveau mot de passe <span className="font-normal normal-case text-gray-400">(optionnel)</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    minLength={6}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-10 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Offre</span>
                  <span className="font-bold text-gray-900">{offerLabel(selectedClient.offer)}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Montant payé</span>
                  <span className="font-bold text-gray-900">{selectedClient.amount.toFixed(2)} €</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
                >
                  <Save size={16} />
                  Enregistrer les modifications
                </button>
              </div>
            </form>

            <form action={deleteClient.bind(null, selectedClient.id)} className="mt-3 space-y-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                <Trash2 size={16} />
                Supprimer le compte
              </button>

              <p className="flex items-start gap-2 text-xs text-gray-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                La suppression efface le compte, le profil et les dossiers liés.
              </p>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Créer un client</h2>
                  <p className="text-xs text-gray-400">Un e-mail d&apos;accès lui sera envoyé</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={createClient}
              onSubmit={() => setShowModal(false)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    required
                    placeholder="ex: Youssef"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    required
                    placeholder="ex: Benjelloun"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="client@domaine.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    required
                    placeholder="+33 6 …"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Offre achetée</label>
                <select
                  name="offre"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="1">Offre 1 : Diagnostic (99 €)</option>
                  <option value="2">Offre 2 : Médiation (199 €)</option>

                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.01]"
              >
                <Save size={16} />
                Créer le client &amp; envoyer l&apos;e-mail
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
