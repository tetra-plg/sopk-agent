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

-- =====================================================
-- Données de base - Techniques de respiration
-- =====================================================

INSERT INTO breathing_techniques (
  id, name, duration_seconds, pattern, description, benefits,
  icon, color, difficulty, sopk_benefits, display_order
) VALUES
  (
    'coherence',
    'Cohérence cardiaque',
    300,
    ARRAY[5, 0, 5, 0],
    'Rythme 5 secondes inspire / 5 secondes expire pour équilibrer le système nerveux',
    ARRAY['Réduit le cortisol', 'Équilibre hormonal', 'Apaise le stress'],
    '🔵',
    '#4FC3F7',
    'beginner',
    'Idéal pour réguler les hormones et réduire l''inflammation',
    1
  ),
  (
    'box',
    'Respiration carrée',
    180,
    ARRAY[4, 4, 4, 4],
    'Technique 4-4-4-4 (inspire-retiens-expire-pause) pour la concentration',
    ARRAY['Améliore la concentration', 'Calme l''esprit', 'Réduit l''anxiété'],
    '⏹️',
    '#81C784',
    'intermediate',
    'Parfait pour gérer l''anxiété liée aux symptômes',
    2
  ),
  (
    'quick',
    'Respiration rapide',
    120,
    ARRAY[4, 2, 6, 1],
    'Technique express pour apaiser rapidement en situation de stress',
    ARRAY['Soulagement immédiat', 'Détente rapide', 'Calme instantané'],
    '⚡',
    '#FFB74D',
    'beginner',
    'Solution rapide pour les pics de stress hormonal',
    3
  );

-- Les techniques de respiration sont publiques (pas de RLS nécessaire)
-- Toutes les utilisatrices peuvent les consulter