-- ============================================================
-- DROIT HABITAT — SQL Migration script for Extended Roles & Spaces
-- ============================================================

-- 1. Table: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_first_name VARCHAR(100) NOT NULL,
  client_last_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  offer_type VARCHAR(10) NOT NULL, -- '1' | '2' | '3'
  payment_type VARCHAR(50) NOT NULL DEFAULT 'initial_offer', -- 'initial_offer' | 'negotiator_option'
  payment_status VARCHAR(50) NOT NULL DEFAULT 'paid', -- 'paid' | 'failed' | 'pending'
  platform_status VARCHAR(50) NOT NULL DEFAULT 'to_create', -- 'to_create' | 'account_created'
  dossier_id UUID, -- FK (optional at first)
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: negotiation_actions (historiser le travail du négociateur)
CREATE TABLE IF NOT EXISTS public.negotiation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  negotiator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'appel' | 'email' | 'relance' | 'reponse_organisme' | 'document_complementaire' | 'note_interne'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: audit_logs (historiser les actions du Super Admin)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL, -- 'client' | 'dossier' | 'paiement'
  target_id UUID,
  action VARCHAR(100) NOT NULL, -- 'creer_client' | 'assigner_negociateur' | 'modifier_statut'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Set RLS Policies
-- Payments Policies
CREATE POLICY "payments_select_admin" ON public.payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "payments_select_client" ON public.payments FOR SELECT
  USING (user_id = auth.uid());

-- Negotiation Actions Policies
CREATE POLICY "negotiation_actions_select_all" ON public.negotiation_actions FOR SELECT
  USING (
    negotiator_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR EXISTS (SELECT 1 FROM public.dossiers d WHERE d.id = negotiation_actions.dossier_id AND d.client_id = auth.uid())
  );

CREATE POLICY "negotiation_actions_insert_neg" ON public.negotiation_actions FOR INSERT
  WITH CHECK (negotiator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Audit Logs Policies
CREATE POLICY "audit_logs_all_admin" ON public.audit_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
