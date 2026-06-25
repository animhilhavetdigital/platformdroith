'use client';

import { useMemo, useState } from 'react';
import {
  buildPreviewHref,
  PreviewAdminScenario,
} from '@/lib/dev-access';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { ArrowRight, Filter, MoreHorizontal, Search, SquareCheck } from 'lucide-react';

interface DossiersContentProps {
  data: any;
  scenario: PreviewAdminScenario;
}

export default function DossiersContent({ data, scenario }: DossiersContentProps) {
  const allDossiers = data?.dossiers || [];

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    allDossiers.forEach((d: any) => set.add(d.statut));
    return Array.from(set);
  }, [allDossiers]);

  const filteredDossiers = useMemo(() => {
    let result = [...allDossiers];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d: any) => {
        const clientName = `${d.client?.prenom || ''} ${d.client?.nom || ''}`.toLowerCase();
        return d.reference.toLowerCase().includes(q) || clientName.includes(q);
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter((d: any) => d.statut === statusFilter);
    }

    return result;
  }, [allDossiers, search, statusFilter]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredDossiers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredDossiers.map((d: any) => d.id)));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tous les dossiers</h1>
          <p className="text-sm text-gray-500">Vision admin des dossiers et de leur avancement.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold shadow-sm transition-colors ${
              showFilters ? 'border-primary-200 bg-primary-50 text-primary-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filtrer
          </button>
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
          <span className="text-xs font-bold text-gray-400">Statut :</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === 'all' ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tous
          </button>
          {statuses.map((statut: string) => (
            <button
              key={statut}
              onClick={() => setStatusFilter(statut)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === statut ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {getStatusLabel(statut)}
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
                    selected.size === filteredDossiers.length && filteredDossiers.length > 0
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected.size === filteredDossiers.length && filteredDossiers.length > 0 && <SquareCheck size={10} />}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Reference</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Score</th>
              <th className="w-12 px-4 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDossiers.map((dossier: any) => {
              const clientName = `${dossier.client?.prenom || ''} ${dossier.client?.nom || ''}`.trim() || 'Client demo';
              const initials = `${dossier.client?.prenom?.[0] || ''}${dossier.client?.nom?.[0] || ''}`.toUpperCase() || 'CD';
              const score = dossier.scoring_confiance ? Math.min(10, Math.max(0, Number(dossier.scoring_confiance))) : null;
              const isSelected = selected.has(dossier.id);
              return (
                <tr key={dossier.id} className="transition-colors hover:bg-gray-50/60">
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleSelect(dossier.id)}
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <SquareCheck size={10} />}
                    </button>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs font-bold text-gray-700">{dossier.reference}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-bold text-primary-600 shadow-sm shadow-primary-100/50">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{clientName}</p>
                        <p className="text-xs text-gray-400">{dossier.client?.email || 'client@droithabitat.fr'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                    {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Mediation' : 'Relais avocat'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dossier.statut)}`}>
                      {getStatusLabel(dossier.statut)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {score ? (
                      <div className="w-full min-w-[80px]">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">{score}/10</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-primary-500" style={{ width: `${score * 10}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={buildPreviewHref(`/dashboard/negotiator/dossiers/${dossier.id}`, scenario)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                      >
                        Voir
                        <ArrowRight size={12} />
                      </a>
                      <button
                        onClick={() => alert(`Actions pour ${dossier.reference} (demo)`)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredDossiers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                  Aucun dossier trouve.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
