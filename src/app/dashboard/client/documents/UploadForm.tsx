'use client';

import { useState, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { confirmUploadComplete } from './actions';
import { Upload, CheckCircle, File, X, Loader2 } from 'lucide-react';

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

export default function UploadForm({ dossierId }: { dossierId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [docType, setDocType] = useState('autre');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fileArray = files ? Array.from(files) : [];

  const handleUpload = useCallback(async () => {
    if (!files || files.length === 0) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);
    setProgress(0);

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
        setUploading(false);
        return;
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
        setUploading(false);
        return;
      }

      done++;
      setProgress(Math.round((done / total) * 100));
    }

    await confirmUploadComplete(dossierId);
    setSuccess(true);
    setFiles(null);
    router.refresh();
    setUploading(false);
  }, [files, docType, dossierId, router]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
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
        <div className="space-y-2">
          {fileArray.map((file, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <File size={16} className="text-gray-400" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} Ko</span>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="space-y-2 rounded-xl bg-primary-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-800">
            <Loader2 size={16} className="animate-spin" />
            Upload en cours... {progress}%
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100">
            <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-danger-50 p-4 text-sm text-danger-700 flex items-center gap-2">
          <X size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-success-50 p-4 text-sm font-bold text-success-700">
          <CheckCircle size={18} />
          Documents envoyés avec succès !
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={uploading || fileArray.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02] disabled:opacity-60"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {uploading ? 'Envoi...' : 'Envoyer les documents'}
        </button>
      </div>
    </div>
  );
}
