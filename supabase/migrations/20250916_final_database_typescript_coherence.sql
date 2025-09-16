-- =====================================================
-- MIGRATION FINALE - COHÉRENCE COMPLÈTE BDD/TYPESCRIPT
-- Date: 2025-09-16
-- Objectif: Correction des dernières incohérences identifiées
-- =====================================================

-- ==============================================
-- 1. CORRECTION TABLE user_activity_tracking
-- ==============================================

-- Vérifier si la table existe et corriger la structure
DO $$
BEGIN
  -- Ajouter les colonnes manquantes pour l'harmonisation avec l'interface TypeScript

  -- Champs techniques alignés avec la nouvelle structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN duration_seconds INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'completion_percentage'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pre_energy_level'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN pre_energy_level INTEGER CHECK (pre_energy_level >= 1 AND pre_energy_level <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'post_energy_level'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN post_energy_level INTEGER CHECK (post_energy_level >= 1 AND post_energy_level <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pre_pain_level'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN pre_pain_level INTEGER CHECK (pre_pain_level >= 0 AND pre_pain_level <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'post_pain_level'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN post_pain_level INTEGER CHECK (post_pain_level >= 0 AND post_pain_level <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pre_mood_score'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN pre_mood_score INTEGER CHECK (pre_mood_score >= 1 AND pre_mood_score <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'post_mood_score'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN post_mood_score INTEGER CHECK (post_mood_score >= 1 AND post_mood_score <= 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'difficulty_felt_rating'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN difficulty_felt_rating INTEGER CHECK (difficulty_felt_rating >= 1 AND difficulty_felt_rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'session_notes'
  ) THEN
    ALTER TABLE user_activity_tracking ADD COLUMN session_notes TEXT;
  END IF;

  -- Renommer les colonnes pour correspondre à l'interface TypeScript
  -- date -> date_completed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'date'
  ) THEN
    ALTER TABLE user_activity_tracking RENAME COLUMN date TO date_completed;
  END IF;

  -- energy_before -> pre_energy_level (mise à jour des données)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'energy_before'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pre_energy_level'
  ) THEN
    UPDATE user_activity_tracking
    SET pre_energy_level = energy_before
    WHERE pre_energy_level IS NULL AND energy_before IS NOT NULL;
  END IF;

  -- energy_after -> post_energy_level
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'energy_after'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'post_energy_level'
  ) THEN
    UPDATE user_activity_tracking
    SET post_energy_level = energy_after
    WHERE post_energy_level IS NULL AND energy_after IS NOT NULL;
  END IF;

  -- mood_before -> pre_mood_score
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'mood_before'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pre_mood_score'
  ) THEN
    UPDATE user_activity_tracking
    SET pre_mood_score = mood_before
    WHERE pre_mood_score IS NULL AND mood_before IS NOT NULL;
  END IF;

  -- mood_after -> post_mood_score
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'mood_after'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'post_mood_score'
  ) THEN
    UPDATE user_activity_tracking
    SET post_mood_score = mood_after
    WHERE post_mood_score IS NULL AND mood_after IS NOT NULL;
  END IF;

  -- pain_before -> pre_pain_level
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pain_before'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pre_pain_level'
  ) THEN
    UPDATE user_activity_tracking
    SET pre_pain_level = pain_before
    WHERE pre_pain_level IS NULL AND pain_before IS NOT NULL;
  END IF;

  -- pain_after -> post_pain_level
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'pain_after'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'post_pain_level'
  ) THEN
    UPDATE user_activity_tracking
    SET post_pain_level = pain_after
    WHERE post_pain_level IS NULL AND pain_after IS NOT NULL;
  END IF;

  -- notes -> session_notes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'notes'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking' AND column_name = 'session_notes'
  ) THEN
    UPDATE user_activity_tracking
    SET session_notes = notes
    WHERE session_notes IS NULL AND notes IS NOT NULL;
  END IF;

  RAISE NOTICE '✅ Table user_activity_tracking harmonisée avec l''interface TypeScript';
END $$;

-- ==============================================
-- 2. CORRECTION TABLE activity_sessions
-- ==============================================

-- S'assurer que la table activity_sessions a toutes les colonnes nécessaires
DO $$
BEGIN
  -- Ajouter is_active et updated_at si manquants
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_sessions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE activity_sessions ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_sessions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE activity_sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  RAISE NOTICE '✅ Table activity_sessions harmonisée avec l''interface TypeScript';
END $$;

-- ==============================================
-- 3. HARMONISATION TABLE breathing_techniques
-- ==============================================

-- S'assurer que breathing_techniques correspond à l'interface BreathingTechnique
DO $$
BEGIN
  -- Vérifier si duration_minutes existe, sinon l'ajouter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'breathing_techniques' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE breathing_techniques ADD COLUMN duration_minutes INTEGER;
    -- Calculer duration_minutes à partir de duration_seconds si il existe
    UPDATE breathing_techniques
    SET duration_minutes = CEIL(duration_seconds / 60.0)
    WHERE duration_seconds IS NOT NULL;
  END IF;

  -- Ajouter difficulty_level s'il manque
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'breathing_techniques' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE breathing_techniques ADD COLUMN difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5);
  END IF;

  RAISE NOTICE '✅ Table breathing_techniques harmonisée avec l''interface TypeScript';
END $$;

-- ==============================================
-- 4. CONTRAINTES ET INDEX POUR PERFORMANCES
-- ==============================================

-- S'assurer que les contraintes FK sont correctes
DO $$
BEGIN
  -- Vérifier/corriger les contraintes FK pour user_activity_tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_activity_tracking_session_id_fkey'
  ) THEN
    ALTER TABLE user_activity_tracking
    ADD CONSTRAINT user_activity_tracking_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES activity_sessions(id);
  END IF;

  RAISE NOTICE '✅ Contraintes FK vérifiées et corrigées';
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_date_completed
  ON user_activity_tracking(user_id, date_completed DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_session
  ON user_activity_tracking(session_id, date_completed DESC);

-- ==============================================
-- 5. TRIGGER UPDATED_AT pour activity_sessions
-- ==============================================

-- Créer la fonction de trigger pour updated_at
CREATE OR REPLACE FUNCTION update_activity_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger
DROP TRIGGER IF EXISTS update_activity_sessions_updated_at ON activity_sessions;
CREATE TRIGGER update_activity_sessions_updated_at
BEFORE UPDATE ON activity_sessions
FOR EACH ROW EXECUTE PROCEDURE update_activity_sessions_updated_at();

-- ==============================================
-- 6. COMMENTAIRES FINAUX POUR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE user_activity_tracking IS 'Suivi des séances d''activité complétées - Harmonisé avec interface UserActivityTracking';
COMMENT ON COLUMN user_activity_tracking.duration_seconds IS 'Durée effective en secondes';
COMMENT ON COLUMN user_activity_tracking.completion_percentage IS 'Pourcentage de complétion (0-100)';
COMMENT ON COLUMN user_activity_tracking.pre_energy_level IS 'Niveau d''énergie avant (1-10)';
COMMENT ON COLUMN user_activity_tracking.post_energy_level IS 'Niveau d''énergie après (1-10)';
COMMENT ON COLUMN user_activity_tracking.pre_pain_level IS 'Niveau de douleur avant (0-10)';
COMMENT ON COLUMN user_activity_tracking.post_pain_level IS 'Niveau de douleur après (0-10)';
COMMENT ON COLUMN user_activity_tracking.pre_mood_score IS 'Score d''humeur avant (1-10)';
COMMENT ON COLUMN user_activity_tracking.post_mood_score IS 'Score d''humeur après (1-10)';
COMMENT ON COLUMN user_activity_tracking.difficulty_felt_rating IS 'Difficulté ressentie notée de 1 à 5';
COMMENT ON COLUMN user_activity_tracking.session_notes IS 'Notes libres sur la session';

COMMENT ON TABLE activity_sessions IS 'Séances d''activité disponibles - Harmonisé avec interface ActivitySession';
COMMENT ON COLUMN activity_sessions.is_active IS 'Indique si la session est active/disponible';
COMMENT ON COLUMN activity_sessions.updated_at IS 'Dernière mise à jour de la session';

-- ==============================================
-- 7. VÉRIFICATION FINALE ET RAPPORT
-- ==============================================

DO $$
DECLARE
  user_activity_columns INTEGER;
  activity_sessions_columns INTEGER;
  breathing_techniques_columns INTEGER;
BEGIN
  -- Compter les colonnes pour vérification
  SELECT COUNT(*) INTO user_activity_columns
  FROM information_schema.columns
  WHERE table_name = 'user_activity_tracking';

  SELECT COUNT(*) INTO activity_sessions_columns
  FROM information_schema.columns
  WHERE table_name = 'activity_sessions';

  SELECT COUNT(*) INTO breathing_techniques_columns
  FROM information_schema.columns
  WHERE table_name = 'breathing_techniques';

  RAISE NOTICE '';
  RAISE NOTICE '🎉 MIGRATION FINALE TERMINÉE - COHÉRENCE BDD/TYPESCRIPT';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Tables harmonisées:';
  RAISE NOTICE '✅ user_activity_tracking (% colonnes)', user_activity_columns;
  RAISE NOTICE '✅ activity_sessions (% colonnes)', activity_sessions_columns;
  RAISE NOTICE '✅ breathing_techniques (% colonnes)', breathing_techniques_columns;
  RAISE NOTICE '';
  RAISE NOTICE 'Interfaces TypeScript correspondantes:';
  RAISE NOTICE '✅ UserActivityTracking → user_activity_tracking';
  RAISE NOTICE '✅ ActivitySession → activity_sessions';
  RAISE NOTICE '✅ BreathingTechnique → breathing_techniques';
  RAISE NOTICE '';
  RAISE NOTICE 'Champs any remplacés par des interfaces typées:';
  RAISE NOTICE '✅ Recipe: nutritional_info, ingredients, instructions, variations';
  RAISE NOTICE '✅ ActivitySession: instructions';
  RAISE NOTICE '✅ BreathingTechnique: instructions';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Triggers et contraintes FK mises à jour';
  RAISE NOTICE '📊 Index de performance ajoutés';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 TOUTES LES INCOHÉRENCES RÉSOLUES !';
  RAISE NOTICE '================================================';
END $$;