'use client';

import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { ChevronDown, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Dossier {
  id: string;
  reference: string;
  statut: string;
  offre: string;
  date_cloture?: string;
  client?: {
    prenom?: string;
    nom?: string;
  };
}

interface Props {
  finishedDossiers: Dossier[];
}

export default function HistoriqueContent({ finishedDossiers }: Props) {
  const [expandedMobile, setExpandedMobile] = useState<Set<string>>(new Set());

  const toggleMobileExpand = (id: string) => {
    const next = new Set(expandedMobile);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMobile(next);
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/10">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Référence</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Statut</th>
              <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Date Clôture</th>
              <th className="w-12 px-4 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {finishedDossiers.map((dossier) => (
              <tr key={dossier.id} className="transition-colors hover:bg-gray-50/60">
                <td className="px-4 py-4 text-sm font-bold text-gray-900 font-mono">{dossier.reference}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      <User size={14} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {dossier.client ? `${dossier.client.prenom} ${dossier.client.nom}` : 'Nadia Alaoui'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                  {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Médiation' : dossier.offre === '3' ? 'Accompagnement complet' : 'Médiation'}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dossier.statut)}`}>
                    {getStatusLabel(dossier.statut)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  {dossier.date_cloture
                    ? new Date(dossier.date_cloture).toLocaleDateString('fr-FR')
                    : 'Récemment'}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/dashboard/negotiator/dossiers/${dossier.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
            {finishedDossiers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  Aucun dossier historique trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {finishedDossiers.map((dossier) => {
          const isExpanded = expandedMobile.has(dossier.id);
          const clientName = dossier.client ? `${dossier.client.prenom} ${dossier.client.nom}` : 'Nadia Alaoui';
          return (
            <div key={dossier.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-black/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMobileExpand(dossier.id)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <ChevronDown size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate font-mono">{dossier.reference}</p>
                  <p className="text-xs text-gray-500 truncate">{clientName}</p>
                </div>
                <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(dossier.statut)}`}>
                  {getStatusLabel(dossier.statut)}
                </span>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Client</span>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          <User size={12} />
                        </div>
                        <span className="font-semibold text-gray-700">{clientName}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</span>
                      <span className="mt-1 block font-semibold text-gray-700">
                        {dossier.offre === '1' ? 'Diagnostic' : dossier.offre === '2' ? 'Médiation' : dossier.offre === '3' ? 'Accompagnement complet' : 'Médiation'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Date clôture</span>
                      <span className="mt-1 block font-medium text-gray-600">
                        {dossier.date_cloture
                          ? new Date(dossier.date_cloture).toLocaleDateString('fr-FR')
                          : 'Récemment'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/dashboard/negotiator/dossiers/${dossier.id}`}
                      className="flex w-full items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      Ouvrir
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {finishedDossiers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Aucun dossier historique trouvé.
          </div>
        )}
      </div>
    </>
  );
}
