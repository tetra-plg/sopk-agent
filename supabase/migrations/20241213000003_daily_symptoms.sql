-- =====================================================
-- SOPK Companion - Schema Base de Données
-- Module: Journal Quotidien des Symptômes
-- =====================================================

-- Table principale pour le journal quotidien
CREATE TABLE daily_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Données spécifiques au journal quotidien
  period_flow INTEGER CHECK (period_flow >= 0 AND period_flow <= 4),
  fatigue_level INTEGER CHECK (fatigue_level >= 0 AND fatigue_level <= 5),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 5),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_emoji VARCHAR(10),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte unique pour éviter les doublons par utilisateur/date
  UNIQUE(user_id, date)
);

-- Index pour les performances
CREATE INDEX idx_daily_symptoms_user_date ON daily_symptoms(user_id, date DESC);
CREATE INDEX idx_daily_symptoms_date ON daily_symptoms(date);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_daily_symptoms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_daily_symptoms_updated_at
BEFORE UPDATE ON daily_symptoms
FOR EACH ROW EXECUTE PROCEDURE update_daily_symptoms_updated_at();

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Activer RLS
ALTER TABLE daily_symptoms ENABLE ROW LEVEL SECURITY;

-- Policies pour daily_symptoms
CREATE POLICY "Users can view own symptoms" ON daily_symptoms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms" ON daily_symptoms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms" ON daily_symptoms
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy pour supprimer ses propres données
CREATE POLICY "Users can delete own symptoms" ON daily_symptoms
    FOR DELETE USING (auth.uid() = user_id);