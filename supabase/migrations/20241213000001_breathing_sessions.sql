-- =====================================================
-- SOPK Companion - Schema Base de Données
-- Module: Sessions de Respiration Guidée
-- =====================================================

-- Table pour tracking des sessions de respiration
CREATE TABLE breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Données de session
  technique VARCHAR(50) NOT NULL, -- 'box', 'coherence', 'quick'
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  interruption_reason VARCHAR(100), -- si pas complétée

  -- Feedback utilisateur
  stress_before INTEGER CHECK (stress_before >= 1 AND stress_before <= 10),
  stress_after INTEGER CHECK (stress_after >= 1 AND stress_after <= 10),
  feeling_after VARCHAR(20), -- 'calmer', 'same', 'better'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_breathing_sessions_user_date
ON breathing_sessions(user_id, created_at DESC);

CREATE INDEX idx_breathing_sessions_technique
ON breathing_sessions(technique);

CREATE INDEX idx_breathing_sessions_completed
ON breathing_sessions(completed);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_breathing_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_breathing_sessions_updated_at
BEFORE UPDATE ON breathing_sessions
FOR EACH ROW EXECUTE PROCEDURE update_breathing_sessions_updated_at();

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Activer RLS
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;

-- Policies pour breathing_sessions
CREATE POLICY "Users can view own breathing sessions" ON breathing_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breathing sessions" ON breathing_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own breathing sessions" ON breathing_sessions
    FOR UPDATE USING (auth.uid() = user_id);
