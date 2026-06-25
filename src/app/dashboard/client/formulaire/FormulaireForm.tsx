'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveFormulaire } from './actions';
import { FileText, Building, Calendar, Hash, AlignLeft, ArrowRight, Loader2 } from 'lucide-react';

const FIELDS = [
  { name: 'type_problème', label: 'Type de problème', type: 'select', options: ['Taux usuraire', 'Vice caché / Conformité', 'Assurance forcée', 'Fraude / Démarchage abusif', 'Autre'], icon: <FileText size={18} /> },
  { name: 'montant_crédit', label: 'Montant du crédit (€)', type: 'number', icon: <Hash size={18} /> },
  { name: 'organisme', label: 'Organisme de crédit', type: 'text', icon: <Building size={18} /> },
  { name: 'date_survenance', label: 'Date de survenance', type: 'date', icon: <Calendar size={18} /> },
  { name: 'numéro_dossier', label: 'Numéro de dossier / contrat', type: 'text', icon: <Hash size={18} /> },
  { name: 'description', label: 'Description détaillée du problème', type: 'textarea', icon: <AlignLeft size={18} /> },
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <label htmlFor={field.name} className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="text-gray-400">{field.icon}</span>
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                required
                rows={4}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="Décrivez votre situation en détail..."
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                required
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Sélectionnez...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            )}
          </div>
        ))}
      </div>

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
