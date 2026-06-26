'use client';

import { useMemo, useState } from 'react';
import { Profile } from '@/types';
import { toggleNegotiatorStatus, deleteNegotiator, createNegotiator } from './actions';
import {
  Handshake,
  Phone,
  Mail,
  UserCheck,
  Search,
  UserPlus,
  X,
  Save,
  AlertTriangle,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';

interface NegotiatorWithCount extends Profile {
  dossierCount: number;
}

interface Props {
  negotiators: NegotiatorWithCount[];
}

export default function NegociateursContent({ negotiators }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<NegotiatorWithCount | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return negotiators;
    const q = search.toLowerCase();
    return negotiators.filter(
      (n) =>
        `${n.prenom} ${n.nom}`.toLowerCase().includes(q) ||
        (n.email || '').toLowerCase().includes(q) ||
        (n.téléphone || '').toLowerCase().includes(q)
    );
  }, [negotiators, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Négociateurs</h1>
          <p className="mt-1 text-gray-500">Gérez les négociateurs et conseillers assignés aux dossiers clients</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-primary-600 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          <UserPlus size={16} />
          Ajouter un négociateur
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un négociateur..."
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Négociateur</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Dossiers assignés</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((neg) => (
              <tr
                key={neg.id}
                onClick={() => setSelected(neg)}
                className="cursor-pointer transition-colors hover:bg-gray-50/60"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {`${neg.prenom[0]}${neg.nom[0]}`.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {neg.prenom} {neg.nom}
                      </p>
                      <p className="text-xs text-gray-400">ID : {neg.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-400" />
                      <span className="truncate max-w-[160px]">{neg.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400" />
                      <span>{neg.téléphone || (neg as any).telephone || '—'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {neg.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 border border-green-100">
                      <UserCheck size={10} />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 border border-red-100">
                      <PowerOff size={10} />
                      Suspendu
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">{neg.dossierCount}</td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(neg.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(neg);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  Aucun négociateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {`${selected.prenom[0]}${selected.nom[0]}`.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selected.prenom} {selected.nom}
                  </h2>
                  <p className="text-xs text-gray-500">Négociateur</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <span>{selected.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span>{selected.téléphone || (selected as any).telephone || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Handshake size={14} className="text-gray-400" />
                <span>{selected.dossierCount} dossier{selected.dossierCount > 1 ? 's' : ''} assigné{selected.dossierCount > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <form
                action={toggleNegotiatorStatus.bind(null, selected.id, selected.status || 'active')}
              >
                <button
                  type="submit"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-sm transition-colors ${
                    selected.status === 'active'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {selected.status === 'active' ? <PowerOff size={14} /> : <Power size={14} />}
                  {selected.status === 'active' ? 'Suspendre le compte' : 'Réactiver le compte'}
                </button>
              </form>

              <form action={deleteNegotiator.bind(null, selected.id)}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  <Trash2 size={14} />
                  Supprimer le compte
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Ajouter un négociateur</h2>
                  <p className="text-xs text-gray-400">Un compte auth sera créé avec ce mot de passe</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={createNegotiator}
              onSubmit={() => setShowAddModal(false)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    required
                    placeholder="ex: Samir"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    required
                    placeholder="ex: Bennani"
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
                    placeholder="negociateur@domaine.com"
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Mot de passe temporaire</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.01]"
              >
                <Save size={16} />
                Créer le compte négociateur
              </button>

              <p className="flex items-start gap-2 text-xs text-gray-400">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                En production, un utilisateur Supabase Auth est créé avec confirmation d&apos;e-mail activée.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
