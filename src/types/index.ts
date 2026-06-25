export type UserRole = 'super_admin' | 'client' | 'negotiator';

export type DossierStatus =
  | 'nouveau'
  | 'éligibilité_en_cours'
  | 'non_eligible'
  | 'attente_offre'
  | 'paiement_en_cours'
  | 'onboarding'
  | 'formulaire_en_cours'
  | 'pieces_attendues'
  | 'analyse_en_cours'
  | 'rapport_genere'
  | 'livre'
  | 'orientation_en_cours'
  | 'autonomie'
  | 'mediation_en_cours'
  | 'avocat'
  | 'mediation_terminée'
  | 'feedback'
  | 'cloture';

export type OffreType = '1' | '2' | '3';

export type DocumentType =
  | 'contrat_credit'
  | 'bon_commande'
  | 'offre_prealable'
  | 'echeancier'
  | 'releve_bancaire'
  | 'courrier_relance'
  | 'mise_en_demeure'
  | 'sms_whatsapp'
  | 'email'
  | 'publicite'
  | 'devis_facture'
  | 'photo_chantier'
  | 'attestation'
  | 'enregistrement'
  | 'autre';

export interface Profile {
  id: string;
  role: UserRole;
  nom: string;
  prenom: string;
  téléphone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Dossier {
  id: string;
  reference: string;
  statut: DossierStatus;
  offre: OffreType | null;
  client_id: string;
  negotiator_id: string | null;
  formulaire_data: Record<string, unknown>;
  scoring_verdict: string | null;
  scoring_confiance: number | null;
  scoring_justification: string | null;
  montant_paye: number | null;
  stripe_payment_id: string | null;
  date_paiement: string | null;
  date_creation: string;
  date_formulaire_complete: string | null;
  date_upload_complete: string | null;
  date_analyse_debut: string | null;
  date_livraison: string | null;
  date_cloture: string | null;
  rapport_url: string | null;
  rapport_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Jointures
  client?: Profile;
  negotiator?: Profile;
  documents?: Document[];
  mediation_etapes?: MediationEtape[];
}

export interface Document {
  id: string;
  dossier_id: string;
  type: DocumentType;
  nom_fichier: string;
  storage_path: string;
  ocr_text: string | null;
  ocr_confidence: number | null;
  taille_octets: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface HistoriqueAction {
  id: string;
  dossier_id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface NoteNégociateur {
  id: string;
  dossier_id: string;
  negotiator_id: string;
  contenu: string;
  visible_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface MédiationSuivi {
  id: string;
  dossier_id: string;
  date_action: string;
  type_action: string;
  destinataire: string | null;
  contenu: string | null;
  document_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MediationEtape {
  id: string;
  dossier_id: string;
  label: string;
  ordre: number;
  complete: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}
