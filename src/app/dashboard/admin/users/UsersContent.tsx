'use client';

import { useMemo, useState } from 'react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import {
  ArrowDownUp,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SquareCheck,
  Trash2,
} from 'lucide-react';

interface UsersContentProps {
  data: any;
}

export default function UsersContent({ data }: UsersContentProps) {
  const allUsers = data?.users || [];

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Client' | 'Negociateur'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'lastActive'>('name');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = useMemo(() => {
    let result = [...allUsers];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (user: any) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((user: any) => user.role === roleFilter);
    }

    result.sort((a: any, b: any) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'role') return a.role.localeCompare(b.role);
      return a.lastActive.localeCompare(b.lastActive);
    });

    return result;
  }, [allUsers, search, roleFilter, sortBy]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredUsers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredUsers.map((u: any) => u.id)));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500">Gestion des clients et negociateurs</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => alert('Ajouter un utilisateur (demo)')}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-primary-600 px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition-colors ${
              showFilters ? 'border-primary-200 bg-primary-50 text-primary-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
          </button>
          <button
            onClick={() => setSortBy((s) => (s === 'name' ? 'role' : s === 'role' ? 'lastActive' : 'name'))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            title={`Trier par ${sortBy}`}
          >
            <ArrowDownUp size={18} />
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => {
                alert(`Supprimer ${selected.size} utilisateur(s) (demo)`);
                setSelected(new Set());
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 size={16} />
              <span>({selected.size})</span>
            </button>
          )}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="h-9 rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold text-gray-400">Role :</span>
          {(['all', 'Client', 'Negociateur'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                roleFilter === role
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {role === 'all' ? 'Tous' : role}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-4">
                <button
                  onClick={toggleSelectAll}
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    selected.size === filteredUsers.length && filteredUsers.length > 0
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected.size === filteredUsers.length && filteredUsers.length > 0 && <SquareCheck size={10} />}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">ID</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Utilisateur</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Role</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Dossiers</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Actif</th>
              <th className="w-12 px-4 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user: any) => {
              const initials = user.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase();
              const isSelected = selected.has(user.id);
              return (
                <tr key={user.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleSelect(user.id)}
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <SquareCheck size={10} />}
                    </button>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs font-bold text-gray-700">{user.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600 shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">{user.role}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">{user.assigned}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${statusDotColor(user.status)}`} />
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <SquareCheck size={14} className="text-gray-400" />
                      {user.lastActive}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => alert(`Actions pour ${user.name} (demo)`)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                  Aucun utilisateur trouve.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function statusDotColor(status: string): string {
  const colors: Record<string, string> = {
    Actif: 'bg-green-500',
    Livre: 'bg-blue-500',
    Pieces_attendues: 'bg-amber-500',
    Sature: 'bg-red-500',
    Mediation: 'bg-purple-500',
    Analyse: 'bg-indigo-500',
  };
  return colors[status] || 'bg-gray-400';
}
