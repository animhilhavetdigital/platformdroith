-- ============================================================
-- DROIT HABITAT — Schéma Base de Données Supabase
-- Multi-rôles : super_admin | client | negotiator
-- ============================================================

-- Enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'client', 'negotiator');
CREATE TYPE dossier_status AS ENUM (
  'nouveau',
  'eligibilite_en_cours',
  'non_eligible',
  'attente_offre',
  'paiement_en_cours',
  'onboarding',
  'formulaire_en_cours',
  'pieces_attendues',
  'analyse_en_cours',
  'rapport_genere',
  'livre',
  'orientation_en_cours',
  'autonomie',
  'mediation_en_cours',
  'avocat',
  'mediation_terminee',
  'feedback',
  'cloture'
);
CREATE TYPE offre_type AS ENUM ('1', '2', '3');
CREATE TYPE document_type AS ENUM (
  'contrat_credit',
  'bon_commande',
  'offre_prealable',
  'echeancier',
  'releve_bancaire',
  'courrier_relance',
  'mise_en_demeure',
  'sms_whatsapp',
  'email',
  'publicite',
  'devis_facture',
  'photo_chantier',
  'attestation',
  'enregistrement',
  'autre'
);

-- ============================================================
-- TABLE : profiles (étend auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Profil utilisateur étendu — lié à auth.users';
COMMENT ON COLUMN profiles.role IS 'super_admin = accès total | client = son dossier uniquement | negotiator = dossiers assignés';

-- ============================================================
-- TABLE : dossiers
-- ============================================================
CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(20) UNIQUE NOT NULL, -- DH-2024-001247
  statut dossier_status NOT NULL DEFAULT 'nouveau',
  offre offre_type,

  -- Client (FK vers profiles)
  client_id UUID NOT NULL REFERENCES profiles(id),

  -- Négociateur assigné (nullable au départ)
  negotiator_id UUID REFERENCES profiles(id),

  -- Données formulaire (JSON structuré)
  formulaire_data JSONB DEFAULT '{}',

  -- Scoring IA
  scoring_verdict VARCHAR(10),
  scoring_confiance INTEGER CHECK (scoring_confiance BETWEEN 0 AND 10),
  scoring_justification TEXT,

  -- Paiement
  montant_paye DECIMAL(10,2),
  stripe_payment_id VARCHAR(100),
  date_paiement TIMESTAMPTZ,

  -- Dates workflow
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  date_formulaire_complete TIMESTAMPTZ,
  date_upload_complete TIMESTAMPTZ,
  date_analyse_debut TIMESTAMPTZ,
  date_livraison TIMESTAMPTZ,
  date_cloture TIMESTAMPTZ,

  -- Rapport
  rapport_url TEXT,
  rapport_data JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE dossiers IS 'Dossier client — cœur métier de la plateforme';

-- ============================================================
-- TABLE : documents
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  nom_fichier VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  ocr_text TEXT,
  ocr_confidence DECIMAL(5,2),
  taille_octets INTEGER,
  mime_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : historique_actions (audit log)
-- ============================================================
CREATE TABLE historique_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : notes_negociateur
-- ============================================================
CREATE TABLE notes_negociateur (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  negotiator_id UUID NOT NULL REFERENCES profiles(id),
  contenu TEXT NOT NULL,
  visible_client BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : mediation_suivi (offre 2)
-- ============================================================
CREATE TABLE mediation_suivi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  date_action TIMESTAMPTZ DEFAULT NOW(),
  type_action VARCHAR(50) NOT NULL, -- 'envoi_courrier', 'relance', 'reponse_positive', 'reponse_negative', 'passage_avocat'
  destinataire VARCHAR(255),
  contenu TEXT,
  document_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE : mediation_etapes (checkpoints offre 2)
-- ============================================================
CREATE TABLE mediation_etapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0,
  complete BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE mediation_etapes IS 'Étapes de médiation (offre 2) — cochables par le négociateur, visibles par le client';

-- ============================================================
-- INDEX
-- ============================================================
CREATE INDEX idx_dossiers_client ON dossiers(client_id);
CREATE INDEX idx_dossiers_negotiator ON dossiers(negotiator_id);
CREATE INDEX idx_dossiers_statut ON dossiers(statut);
CREATE INDEX idx_documents_dossier ON documents(dossier_id);
CREATE INDEX idx_historique_dossier ON historique_actions(dossier_id);
CREATE INDEX idx_mediation_etapes_dossier ON mediation_etapes(dossier_id);

-- ============================================================
-- FONCTION : Génération référence auto
-- ============================================================
CREATE OR REPLACE FUNCTION generate_dossier_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference := 'DH-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('dossier_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE dossier_seq START 1;

CREATE TRIGGER trg_generate_reference
  BEFORE INSERT ON dossiers
  FOR EACH ROW
  EXECUTE FUNCTION generate_dossier_reference();

-- ============================================================
-- FONCTION : updated_at auto
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dossiers_updated_at
  BEFORE UPDATE ON dossiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON notes_negociateur
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mediation_etapes_updated_at
  BEFORE UPDATE ON mediation_etapes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Politiques par rôle
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_negociateur ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediation_suivi ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- POLITIQUES : profiles
-- ------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

CREATE POLICY "profiles_select_negotiator"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'negotiator'
  ));

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Le super_admin peut tout voir et modifier
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ------------------------------------------------------------
-- POLITIQUES : mediation_etapes
-- ------------------------------------------------------------
CREATE POLICY "mediation_etapes_client_select"
  ON mediation_etapes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = mediation_etapes.dossier_id AND d.client_id = auth.uid()
  ));

CREATE POLICY "mediation_etapes_negotiator_all"
  ON mediation_etapes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = mediation_etapes.dossier_id AND d.negotiator_id = auth.uid()
  ));

CREATE POLICY "mediation_etapes_admin_all"
  ON mediation_etapes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ------------------------------------------------------------
-- POLITIQUES : dossiers
-- ------------------------------------------------------------
-- Client : voir uniquement SES dossiers
CREATE POLICY "dossiers_client_select"
  ON dossiers FOR SELECT
  USING (client_id = auth.uid());

-- Client : créer un dossier (lui-même)
CREATE POLICY "dossiers_client_insert"
  ON dossiers FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Client : mettre à jour SES dossiers (formulaire, upload)
CREATE POLICY "dossiers_client_update"
  ON dossiers FOR UPDATE
  USING (client_id = auth.uid());

-- Négociateur : voir les dossiers qui lui sont assignés
CREATE POLICY "dossiers_negotiator_select"
  ON dossiers FOR SELECT
  USING (negotiator_id = auth.uid());

-- Négociateur : modifier les dossiers assignés (notes, statut mediation)
CREATE POLICY "dossiers_negotiator_update"
  ON dossiers FOR UPDATE
  USING (negotiator_id = auth.uid());

-- Super admin : tout voir, tout modifier
CREATE POLICY "dossiers_admin_all"
  ON dossiers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ------------------------------------------------------------
-- POLITIQUES : documents
-- ------------------------------------------------------------
CREATE POLICY "documents_client_select"
  ON documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = documents.dossier_id AND d.client_id = auth.uid()
  ));

CREATE POLICY "documents_client_insert"
  ON documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = documents.dossier_id AND d.client_id = auth.uid()
  ));

CREATE POLICY "documents_negotiator_select"
  ON documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = documents.dossier_id AND d.negotiator_id = auth.uid()
  ));

CREATE POLICY "documents_admin_all"
  ON documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ------------------------------------------------------------
-- POLITIQUES : historique_actions
-- ------------------------------------------------------------
CREATE POLICY "historique_client_select"
  ON historique_actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = historique_actions.dossier_id AND d.client_id = auth.uid()
  ));

CREATE POLICY "historique_admin_all"
  ON historique_actions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ------------------------------------------------------------
-- POLITIQUES : notes_negociateur
-- ------------------------------------------------------------
-- Le client ne voit que les notes marquées visible_client = TRUE
CREATE POLICY "notes_client_select"
  ON notes_negociateur FOR SELECT
  USING (
    visible_client = TRUE
    AND EXISTS (
      SELECT 1 FROM dossiers d WHERE d.id = notes_negociateur.dossier_id AND d.client_id = auth.uid()
    )
  );

-- Le négociateur voit ses propres notes
CREATE POLICY "notes_negotiator_all"
  ON notes_negociateur FOR ALL
  USING (negotiator_id = auth.uid());

-- Super admin voit tout
CREATE POLICY "notes_admin_all"
  ON notes_negociateur FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ------------------------------------------------------------
-- POLITIQUES : mediation_suivi
-- ------------------------------------------------------------
CREATE POLICY "mediation_client_select"
  ON mediation_suivi FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = mediation_suivi.dossier_id AND d.client_id = auth.uid()
  ));

CREATE POLICY "mediation_negotiator_all"
  ON mediation_suivi FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dossiers d WHERE d.id = mediation_suivi.dossier_id AND d.negotiator_id = auth.uid()
  ));

CREATE POLICY "mediation_admin_all"
  ON mediation_suivi FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- ============================================================
-- FONCTION TRIGGER : Création auto du profil à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, nom, prenom, telephone)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'telephone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
