'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { saveFormulaire } from './actions';
import { confirmUploadComplete } from '../documents/actions';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { isDevAccessEnabled } from '@/lib/dev-access';
import { devStore } from '@/lib/dev-store';
import {
  FileText,
  Building,
  Calendar,
  Hash,
  AlignLeft,
  ArrowRight,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Target,
  Banknote,
  Clock,
  Percent,
  Upload,
  CheckCircle,
  File,
  X,
  ClipboardList,
} from 'lucide-react';

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
      { name: 'deja_contacte_organisme', label: "Avez-vous déjà contacté l'organisme ?", type: 'select', options: ['Oui', 'Non'], icon: <FileText size={18} />, required: true },
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

const DOCUMENT_TYPES = [
  { value: 'contrat_credit', label: 'Contrat de crédit' },
  { value: 'bon_commande', label: 'Bon de commande' },
  { value: 'offre_prealable', label: 'Offre préalable' },
  { value: 'echeancier', label: 'Échéancier' },
  { value: 'releve_bancaire', label: 'Relevé bancaire' },
  { value: 'courrier_relance', label: 'Courrier de relance' },
  { value: 'mise_en_demeure', label: 'Mise en demeure' },
  { value: 'sms_whatsapp', label: 'SMS / WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'publicite', label: 'Publicité' },
  { value: 'devis_facture', label: 'Devis / Facture' },
  { value: 'photo_chantier', label: 'Photo chantier' },
  { value: 'attestation', label: 'Attestation' },
  { value: 'enregistrement', label: 'Enregistrement' },
  { value: 'autre', label: 'Autre' },
];

const RECOMMENDED_DOCS: Record<string, string[]> = {
  'Taux usuraire': ['contrat_credit', 'offre_prealable', 'echeancier', 'releve_bancaire'],
  'Vice caché / Conformité': ['contrat_credit', 'bon_commande', 'devis_facture', 'photo_chantier', 'attestation'],
  'Assurance forcée': ['contrat_credit', 'offre_prealable', 'courrier_relance'],
  'Fraude / Démarchage abusif': ['contrat_credit', 'publicite', 'sms_whatsapp', 'email', 'enregistrement'],
  'Erreur de calcul': ['contrat_credit', 'echeancier', 'releve_bancaire'],
  'Modification unilatérale': ['contrat_credit', 'courrier_relance', 'email'],
  'Autre': ['contrat_credit', 'autre'],
};

export default function FormulaireForm({ dossierId, initialData = {} }: { dossierId: string; initialData?: Record<string, unknown> }) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    Object.entries(initialData).forEach(([key, value]) => {
      init[key] = String(value ?? '');
    });
    return init;
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [docType, setDocType] = useState('autre');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileArray = files ? Array.from(files) : [];
  const problemType = formData['type_problème'] || 'Autre';
  const recommended = useMemo(() => RECOMMENDED_DOCS[problemType] || RECOMMENDED_DOCS['Autre'], [problemType]);

  function handleChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function uploadFiles() {
    if (!files || files.length === 0) return true;

    setProgress(0);

    if (isDevAccessEnabled()) {
      const total = files.length;
      let done = 0;

      for (let i = 0; i < files.length; i++) {
        for (let p = 0; p <= 100; p += 25) {
          setProgress(Math.round(((done + p / 100) / total) * 100));
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        const file = files[i];
        const match = devStore.dossiers.find((d) => d.id === dossierId);
        if (match) {
          if (!match.documents) {
            match.documents = [];
          }
          match.documents.push({
            id: `doc-demo-${Date.now()}-${i}`,
            dossier_id: dossierId,
            type: docType as any,
            nom_fichier: file.name,
            storage_path: `preview/${file.name}`,
            ocr_text: null,
            ocr_confidence: null,
            taille_octets: file.size,
            mime_type: file.type,
            created_at: new Date().toISOString(),
          });
        }
        done++;
        setProgress(Math.round((done / total) * 100));
      }
      return true;
    }

    const supabase = createBrowserSupabaseClient();
    const total = files.length;
    let done = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${dossierId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, {
        upsert: false,
      });

      if (uploadError) {
        setError(`Erreur upload ${file.name}: ${uploadError.message}`);
        return false;
      }

      const { error: dbError } = await supabase.from('documents').insert({
        dossier_id: dossierId,
        type: docType,
        nom_fichier: file.name,
        storage_path: path,
        taille_octets: file.size,
        mime_type: file.type,
      });

      if (dbError) {
        setError(`Erreur enregistrement ${file.name}: ${dbError.message}`);
        return false;
      }

      done++;
      setProgress(Math.round((done / total) * 100));
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    setError('');

    const saveResult = await saveFormulaire(dossierId, formData);

    if (!saveResult.ok) {
      setError(saveResult.error || 'Erreur lors de l\'enregistrement du formulaire');
      setLoading(false);
      setUploading(false);
      return;
    }

    const uploadOk = await uploadFiles();
    if (!uploadOk) {
      setLoading(false);
      setUploading(false);
      return;
    }

    const confirmResult = await confirmUploadComplete(dossierId);

    if (!confirmResult.ok) {
      setError(confirmResult.error || 'Erreur lors de la confirmation des documents');
      setLoading(false);
      setUploading(false);
      return;
    }

    setUploading(false);
    setLoading(false);
    router.push('/dashboard/client/analyse?submitted=1');
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

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">Documents justificatifs</h3>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800">
            <ClipboardList size={18} />
            Documents recommandés pour votre situation
          </div>
          <p className="mb-3 text-xs text-amber-700">
            Type de problème déclaré : <strong>{problemType}</strong>
          </p>
          <ul className="space-y-2">
            {recommended.map((docValue) => {
              const label = DOCUMENT_TYPES.find((t) => t.value === docValue)?.label || docValue;
              return (
                <li key={docValue} className="flex items-center gap-2 text-sm text-amber-900">
                  <CheckCircle size={14} className="text-amber-600" />
                  {label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Type de document</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Fichier(s)</label>
            <label className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600">
              <Upload size={18} />
              {fileArray.length > 0 ? `${fileArray.length} fichier(s) sélectionné(s)` : 'Cliquez pour sélectionner'}
              <input type="file" multiple className="sr-only" onChange={(e) => setFiles(e.target.files)} />
            </label>
          </div>
        </div>

        {fileArray.length > 0 && (
          <div className="mt-4 space-y-2">
            {fileArray.map((file, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <File size={16} className="text-gray-400" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} Ko</span>
              </div>
            ))}
          </div>
        )}

        {uploading && progress > 0 && (
          <div className="mt-4 space-y-2 rounded-xl bg-primary-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary-800">
              <Loader2 size={16} className="animate-spin" />
              Envoi en cours... {progress}%
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100">
              <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          Vous pouvez joindre plusieurs documents. Ils seront transmis avec votre formulaire à l&apos;équipe d&apos;analyse.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 p-4 text-sm text-danger-700">
          <X size={16} />
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
