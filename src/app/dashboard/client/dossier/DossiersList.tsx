'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FolderOpen, 
  Calendar, 
  ArrowRight, 
  Info, 
  X, 
  Building, 
  Clock, 
  Banknote, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { getDossierCardTheme, getStatusColor, getStatusLabel } from '@/lib/utils';

interface DossiersListProps {
  dossiers: any[];
}

export default function DossiersList({ dossiers }: DossiersListProps) {
  const router = useRouter();
  const [selectedDossier, setSelectedDossier] = useState<any | null>(null);

  // Helper to determine redirection path for a dossier
  const getDossierHref = (d: any) => {
    const base = `/dashboard/client`;
    if (!d.date_formulaire_complete) {
      return `${base}/formulaire?id=${d.id}`;
    }
    if (d.statut === 'analyse_en_cours') {
      return `${base}/analyse?id=${d.id}`;
    }
    if (['rapport_genere', 'livre'].includes(d.statut)) {
      return `${base}/rapport?id=${d.id}`;
    }
    // Mediation and Negotiator statuses
    if (['mediation_en_cours', 'negociation_payment_pending', 'negociation_paid', 'negociation_en_attente_assignation', 'negociation_en_cours'].includes(d.statut)) {
      return `${base}/negociateur?id=${d.id}`;
    }
    return `${base}/negociateur?id=${d.id}`;
  };

  const getDossierStageLabel = (d: any) => {
    if (!d.date_formulaire_complete) return 'Formulaire à compléter';
    if (d.statut === 'analyse_en_cours') return 'Analyse par l\'IA en cours';
    if (['rapport_genere', 'livre'].includes(d.statut)) return 'Mémoire d\'expertise disponible';
    if (['mediation_en_cours', 'negociation_payment_pending', 'negociation_paid', 'negociation_en_attente_assignation', 'negociation_en_cours'].includes(d.statut)) return 'Conciliation / Médiation en cours';
    return 'Dossier clôturé';
  };

  const getOfferLabel = (offre: string) => {
    switch (offre) {
      case '1': return 'Diagnostic';
      case '2': return 'Médiation';
      case '3': return 'Accompagnement complet';
      default: return 'Standard';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {dossiers.map((d) => {
          const creditDetails = d.formulaire_data?.organisme 
            ? `${d.formulaire_data.organisme} (${d.formulaire_data.type_credit || d.formulaire_data.type_problème || 'Crédit'})`
            : 'Détails non renseignés';
          const createdDate = new Date(d.date_creation).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          const theme = getDossierCardTheme(d.statut);

          return (
            <div 
              key={d.id}
              className={`relative group rounded-2xl border ${theme.border} ${theme.gradient} p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer`}
              onClick={() => router.push(getDossierHref(d))}
            >
              <div className="space-y-4">
                {/* Top row */}
                <div className="flex items-center justify-between border-b border-white/60 pb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Référence</p>
                    <p className="text-sm font-bold text-gray-900 font-mono mt-0.5">{d.reference}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusColor(d.statut)}`}>
                      {getStatusLabel(d.statut)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white/70 px-2 py-0.5 rounded-md">
                      Offre : {getOfferLabel(d.offre)}
                    </span>
                  </div>
                </div>

                {/* Content row */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}>
                      <Building size={14} />
                    </div>
                    <span className="truncate">{creditDetails}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}>
                      <Calendar size={14} />
                    </div>
                    <span>Créé le {createdDate}</span>
                  </div>
                  {d.formulaire_data?.montant_crédit && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText}`}>
                        <Banknote size={14} />
                      </div>
                      <span>Montant : {d.formulaire_data.montant_crédit} €</span>
                    </div>
                  )}
                </div>

                {/* Timeline current step hint */}
                <div className={`rounded-xl border ${theme.border} ${theme.stepBg} p-3 flex items-center gap-2`}>
                  <div className={`h-2 w-2 rounded-full ${theme.stepDot} animate-pulse shrink-0`} />
                  <span className={`text-[11px] font-bold ${theme.stepText} truncate`}>{getDossierStageLabel(d)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div 
                className="mt-6 pt-4 border-t border-white/60 flex items-center justify-between gap-3"
                onClick={(e) => e.stopPropagation()} // Prevent card click redirect when clicking action buttons
              >
                <button
                  onClick={() => setSelectedDossier(d)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border ${theme.border} bg-white text-xs font-bold text-gray-900 py-3 transition-colors hover:bg-slate-50 shadow-sm`}
                >
                  <Info size={14} />
                  Informations générales
                </button>

                <button
                  onClick={() => router.push(getDossierHref(d))}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.arrowBg} ${theme.arrowText} transition-colors`}
                  title="Consulter l'étape"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* General Information Popup Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedDossier(null)}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-2xl transform rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
            {/* Close button */}
            <button
              onClick={() => setSelectedDossier(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <FolderOpen size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Informations générales</h3>
                <p className="text-xs text-slate-500 font-mono">Dossier Référence : {selectedDossier.reference}</p>
              </div>
            </div>

            {/* Form data details */}
            {selectedDossier.formulaire_data && Object.keys(selectedDossier.formulaire_data).length > 0 ? (
              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bank/Organisme */}
                  <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organisme Prêteur</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{selectedDossier.formulaire_data.organisme || 'N/A'}</p>
                  </div>

                  {/* Credit Amount */}
                  <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Montant du crédit</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selectedDossier.formulaire_data.montant_crédit 
                        ? `${Number(selectedDossier.formulaire_data.montant_crédit).toLocaleString('fr-FR')} €` 
                        : 'N/A'}
                    </p>
                  </div>

                  {/* Problem Type */}
                  <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type de litige / Crédit</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{selectedDossier.formulaire_data.type_problème || selectedDossier.formulaire_data.type_credit || 'N/A'}</p>
                  </div>

                  {/* Occurrence Date */}
                  <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date de survenance / Signature</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selectedDossier.formulaire_data.date_survenance 
                        ? new Date(selectedDossier.formulaire_data.date_survenance).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Additional fields if any */}
                {Object.entries(selectedDossier.formulaire_data).map(([key, value]) => {
                  if (['organisme', 'montant_crédit', 'type_problème', 'type_credit', 'date_survenance', 'description'].includes(key)) {
                    return null;
                  }
                  return (
                    <div key={key} className="flex justify-between items-center border-b border-slate-100 pb-2 text-sm">
                      <span className="font-semibold text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-slate-800">{String(value)}</span>
                    </div>
                  );
                })}

                {/* Description */}
                {selectedDossier.formulaire_data.description && (
                  <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-4 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description des faits</p>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{selectedDossier.formulaire_data.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                <p className="text-sm font-bold text-slate-500">Aucune information renseignée</p>
                <p className="text-xs text-slate-400 mt-1">Le formulaire d&apos;éligibilité initial n&apos;a pas encore été complété.</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDossier(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
