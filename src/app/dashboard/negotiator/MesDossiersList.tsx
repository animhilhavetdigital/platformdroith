'use client';

import { useState } from 'react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { buildPreviewHref } from '@/lib/dev-access';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface Dossier {
  id: string;
  reference: string;
  statut: string;
  offre: string;
  client?: {
    prenom?: string;
    nom?: string;
  };
}

interface Props {
  dossiers: Dossier[];
  isPreview: boolean;
  previewScenario?: string;
}

export default function MesDossiersList({ dossiers, isPreview, previewScenario }: Props) {
  const buildHref = (id: string) =>
    isPreview
      ? buildPreviewHref(`/dashboard/negotiator/dossiers/${id}`, previewScenario)
      : `/dashboard/negotiator/dossiers/${id}`;
  const [expandedMobile, setExpandedMobile] = useState<Set<string>>(new Set());

  const toggleMobileExpand = (id: string) => {
    const next = new Set(expandedMobile);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMobile(next);
  };

  if (dossiers.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-medium text-gray-500">Aucun dossier ne vous est assigné pour le moment.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop list */}
      <div className="hidden sm:block divide-y divide-gray-50">
        {dossiers.map((dossier) => (
          <div key={dossier.id} className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-sm font-bold text-primary-700">
                {((dossier.client as any)?.prenom?.[0] || '') + ((dossier.client as any)?.nom?.[0] || '')}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {(dossier.client as any)?.prenom} {(dossier.client as any)?.nom}
                </p>
                <p className="font-mono text-sm text-gray-400">
                  {dossier.reference} - Offre {dossier.offre === '2' ? 'Mediation' : dossier.offre === '3' ? 'Accompagnement complet' : 'Diagnostic'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(dossier.statut)}`}>
                {getStatusLabel(dossier.statut)}
              </span>
              <a
                href={buildHref(dossier.id)}
                className="group flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700"
              >
                Ouvrir
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-50">
        {dossiers.map((dossier) => {
          const isExpanded = expandedMobile.has(dossier.id);
          const clientName = `${(dossier.client as any)?.prenom || ''} ${(dossier.client as any)?.nom || ''}`.trim() || 'Client';
          return (
            <div key={dossier.id} className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMobileExpand(dossier.id)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <ChevronDown size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{clientName}</p>
                  <p className="text-xs text-gray-500 truncate font-mono">{dossier.reference}</p>
                </div>
                <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusColor(dossier.statut)}`}>
                  {getStatusLabel(dossier.statut)}
                </span>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-2 pl-11 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Offre</span>
                    <span className="mt-0.5 block font-semibold text-gray-700">
                      {dossier.offre === '2' ? 'Mediation' : dossier.offre === '3' ? 'Accompagnement complet' : 'Diagnostic'}
                    </span>
                  </div>
                  <a
                    href={buildHref(dossier.id)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-primary-600 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    Ouvrir
                    <ArrowRight size={12} />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
