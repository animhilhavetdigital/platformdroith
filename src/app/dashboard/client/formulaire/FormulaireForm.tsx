'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveFormulaire } from './actions';
import { FileText, Building, Calendar, Hash, AlignLeft, ArrowRight, Loader2, User, Mail, Phone, MapPin, Target, Banknote, Clock, Percent } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Vos informations',
    fields: [
      { name: 'prenom', label: 'Prénom', type: 'text', icon: <User size={18} />, required: true },
      { name: 'nom', label: 'Nom', type: 'text', icon: <User size={18} />, required: true },
      { name: 'email', label: 'Email', type: 'email', icon: <Mail size={18} />, required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', icon: <Phone size={18} />, required: true },
      { name: 'adresse', label: 'Adresse', type: 'text', icon: <MapPin size={18} />, required: false },
      { name: 'date_naissance', label: 'Date de naissance', type: 'date', icon: <Calendar size={18} />, required: false },
    ],
  },
  {
    title: 'Co-emprunteur (optionnel)',
    fields: [
      { name: 'co_prenom', label: 'Prénom du co-emprunteur', type: 'text', icon: <User size={18} />, required: false },
      { name: 'co_nom', label: 'Nom du co-emprunteur', type: 'text', icon: <User size={18} />, required: false },
      { name: 'co_email', label: 'Email du co-emprunteur', type: 'email', icon: <Mail size={18} />, required: false },
      { name: 'co_telephone', label: 'Téléphone du co-emprunteur', type: 'tel', icon: <Phone size={18} />, required: false },
    ],
  },
  {
    title: 'Détails du crédit',
    fields: [
      { name: 'organisme', label: 'Organisme de crédit', type: 'text', icon: <Building size={18} />, required: true },
      { name: 'type_credit', label: 'Type de crédit', type: 'select', options: ['Crédit immobilier', 'Crédit à la consommation', 'Crédit auto', 'Crédit travaux', 'Autre'], icon: <FileText size={18} />, required: true },
      { name: 'montant_crédit', label: 'Montant du crédit (€)', type: 'number', icon: <Banknote size={18} />, required: true },
      { name: 'duree_credit', label: 'Durée (mois)', type: 'number', icon: <Clock size={18} />, required: true },
      { name: 'mensualite', label: 'Mensualité (€)', type: 'number', icon: <Banknote size={18} />, required: false },
      { name: 'taux_credit', label: 'Taux du crédit (%)', type: 'number', step: '0.01', icon: <Percent size={18} />, required: false },
      { name: 'date_debut_credit', label: 'Date de début du crédit', type: 'date', icon: <Calendar size={18} />, required: false },
      { name: 'numéro_dossier', label: 'Numéro de dossier / contrat', type: 'text', icon: <Hash size={18} />, required: true },
    ],
  },
  {
    title: 'Le problème rencontré',
    fields: [
      { name: 'type_problème', label: 'Type de problème', type: 'select', options: ['Taux usuraire', 'Vice caché / Conformité', 'Assurance forcée', 'Fraude / Démarchage abusif', 'Erreur de calcul', 'Modification unilatérale', 'Autre'], icon: <FileText size={18} />, required: true },
      { name: 'date_survenance', label: 'Date de survenance', type: 'date', icon: <Calendar size={18} />, required: true },
      { name: 'description', label: 'Description détaillée du problème', type: 'textarea', icon: <AlignLeft size={18} />, required: true },
      { name: 'prejudice', label: 'Préjudice subi (€)', type: 'number', icon: <Banknote size={18} />, required: false },
      { name: 'deja_contacte_organisme', label: 'Avez-vous déjà contacté l\'organisme ?', type: 'select', options: ['Oui', 'Non'], icon: <FileText size={18} />, required: true },
      { name: 'reponse_organisme', label: 'Si oui, quelle a été la réponse ?', type: 'textarea', icon: <AlignLeft size={18} />, required: false },
    ],
  },
  {
    title: 'Vos objectifs',
    fields: [
      { name: 'objectif', label: 'Objectif principal', type: 'select', options: ['Annuler le crédit', 'Réduire le taux', 'Obtenir un remboursement', 'Renégocier les termes', 'Obtenir des clarifications', 'Autre'], icon: <Target size={18} />, required: true },
      { name: 'objectif_details', label: 'Précisez vos attentes', type: 'textarea', icon: <AlignLeft size={18} />, required: false },
      { name: 'documents_deja_en_possession', label: 'Documents déjà en votre possession', type: 'textarea', icon: <AlignLeft size={18} />, required: false },
    ],
  },
];

export default function FormulaireForm({ dossierId }: { dossierId: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await saveFormulaire(dossierId, formData);

    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error || 'Une erreur est survenue');
    }

    setLoading(false);
  }

  function renderField(field: any) {
    const baseClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

    if (field.type === 'textarea') {
      return (
        <textarea
          id={field.name}
          name={field.name}
          required={field.required}
          rows={4}
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={baseClass}
          placeholder={field.label}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          id={field.name}
          name={field.name}
          required={field.required}
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={baseClass}
        >
          <option value="">Sélectionnez...</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        id={field.name}
        name={field.name}
        type={field.type}
        step={field.step}
        required={field.required}
        value={formData[field.name] || ''}
        onChange={(e) => handleChange(field.name, e.target.value)}
        className={baseClass}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">{section.title}</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label htmlFor={field.name} className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="text-gray-400">{field.icon}</span>
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="rounded-xl bg-danger-50 p-4 text-sm text-danger-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              Enregistrer et continuer
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
