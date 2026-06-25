-- ============================================================
-- SEED DE TEST — Cas concret : Médiation offre 2
-- ============================================================
-- 
-- INSTRUCTIONS :
-- 1. Dans Supabase Dashboard > Authentication > Users :
--    - Créer un utilisateur "client" (email: client@test.com, password: test1234)
--    - Créer un utilisateur "négociateur" (email: negociateur@test.com, password: test1234)
--    - Noter les UUID générés pour chaque user.
--
-- 2. Remplacer les 2 UUID ci-dessous par les vrais IDs :
--    - :client_id
--    - :negotiator_id
--
-- 3. Exécuter ce script dans l'éditeur SQL Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Mettre à jour les rôles (si le trigger n'a pas mis le bon)
-- ------------------------------------------------------------
UPDATE profiles SET role = 'client'      WHERE id = ':client_id';
UPDATE profiles SET role = 'negotiator'  WHERE id = ':negotiator_id';

-- ------------------------------------------------------------
-- 2. Créer le dossier (offre 2 = médiation)
-- ------------------------------------------------------------
INSERT INTO dossiers (
  id,
  statut,
  offre,
  client_id,
  negotiator_id,
  formulaire_data,
  date_formulaire_complete,
  date_upload_complete,
  montant_paye,
  date_creation
)
VALUES (
  gen_random_uuid(),
  'mediation_en_cours',
  '2',
  ':client_id',
  ':negotiator_id',
  '{"type_bien": "Maison", "organisme": "Banque Pop", "montant": "150000", "description": "Problème de vice caché"}',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '8 days',
  990.00,
  NOW() - INTERVAL '12 days'
)
RETURNING id;

-- ⚠️ Note l'UUID du dossier retourné ci-dessus (dossier_id)

-- ------------------------------------------------------------
-- 3. Créer les étapes de médiation (checkpoints)
-- ------------------------------------------------------------
-- Remplace :dossier_id par l'UUID du dossier créé juste au-dessus

INSERT INTO mediation_etapes (dossier_id, label, ordre, complete, completed_at, completed_by)
VALUES
  (':dossier_id', 'Envoi de la mise en demeure', 0, true, NOW() - INTERVAL '5 days', ':negotiator_id'),
  (':dossier_id', 'Prise de contact avec la partie prenante', 1, true, NOW() - INTERVAL '3 days', ':negotiator_id'),
  (':dossier_id', 'Analyse des pieces complementaires', 2, false, null, null),
  (':dossier_id', 'Proposition d''accord amiable', 3, false, null, null),
  (':dossier_id', 'Cloture de la mediation', 4, false, null, null);
