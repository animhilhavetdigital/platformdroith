'use client';

import { MediationEtape } from '@/types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface ProgressionMediationProps {
  etapes: MediationEtape[];
  readOnly?: boolean;
  onToggle?: (id: string, complete: boolean) => void;
}

const DEFAULT_STEPS = [
  'Envoi de la mise en demeure',
  'Prise de contact avec la partie prenante',
  'Analyse des pièces complémentaires',
  'Proposition d\'accord amiable',
  'Clôture de la médiation',
];

export function getDefaultMédiationLabels(): string[] {
  return DEFAULT_STEPS;
}

export default function ProgressionMediation({ etapes, readOnly = false, onToggle }: ProgressionMediationProps) {
  const sorted = [...etapes].sort((a, b) => a.ordre - b.ordre);
  const total = sorted.length;
  const completed = sorted.filter((e) => e.complete).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Progression</span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm font-extrabold text-primary-600">{percent}%</span>
          </div>
        </div>
        <div className="w-full overflow-hidden rounded-full bg-gray-100 h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((étape, index) => (
          <div
            key={étape.id}
            className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
              étape.complete
                ? 'bg-success-50/50 border-success-100 shadow-sm'
                : 'bg-white border-gray-100 hover:border-primary-200 hover:shadow-sm'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${étape.complete ? 'bg-success-500 text-white' : 'bg-gray-100 text-gray-400'}">
              {étape.complete ? (
                <CheckCircle2 size={20} className="text-success-600" />
              ) : readOnly ? (
                <Circle size={20} className="text-gray-300" />
              ) : (
                <button
                  type="button"
                  onClick={() => onToggle?.(étape.id, !étape.complete)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-300 transition-all hover:bg-primary-100 hover:text-primary-600 focus:outline-none"
                  title={étape.complete ? 'Decocher' : 'Cocher'}
                >
                  <span className="text-xs font-bold">{index + 1}</span>
                </button>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${étape.complete ? 'text-success-900 line-through decoration-success-300' : 'text-gray-900'}`}>
                {étape.label}
              </p>
              {étape.completed_at && (
                <p className="mt-1 text-xs text-success-700">
                  Terminé le {new Date(étape.completed_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            {!readOnly && !étape.complete && (
              <button
                type="button"
                onClick={() => onToggle?.(étape.id, true)}
                className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-primary-100"
              >
                Marquer fait
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
