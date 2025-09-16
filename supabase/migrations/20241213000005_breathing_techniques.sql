-- =====================================================
-- SOPK Companion - Schema Base de Données
-- Module: Techniques de Respiration (Configuration)
-- =====================================================

-- Table des techniques de respiration
CREATE TABLE breathing_techniques (
  id TEXT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  pattern INTEGER[] NOT NULL, -- [inspire, pause, expire, pause] en secondes
  description TEXT NOT NULL,
  benefits TEXT[] NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Code couleur hex
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  sopk_benefits TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_breathing_techniques_difficulty ON breathing_techniques(difficulty);
CREATE INDEX idx_breathing_techniques_active ON breathing_techniques(is_active);
CREATE INDEX idx_breathing_techniques_order ON breathing_techniques(display_order);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_breathing_techniques_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_breathing_techniques_updated_at
BEFORE UPDATE ON breathing_techniques
FOR EACH ROW EXECUTE PROCEDURE update_breathing_techniques_updated_at();
