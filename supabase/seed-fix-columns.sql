-- =====================================================
-- CORRECTION DES SEEDS - Alignement avec schéma BDD
-- Adapte les données seeds aux colonnes finales
-- =====================================================

-- Ce script corrige les incohérences entre les fichiers seed
-- et le schéma final de la base de données après migrations

-- VÉRIFICATION ET CORRECTIONS AUTOMATIQUES
DO $$
BEGIN
  -- 1. Vérifier si activity_sessions_complete a les bonnes colonnes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'activity_sessions_complete'
                 AND column_name = 'is_active') THEN
    ALTER TABLE activity_sessions_complete ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'activity_sessions_complete'
                 AND column_name = 'sopk_symptoms') THEN
    ALTER TABLE activity_sessions_complete ADD COLUMN sopk_symptoms TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'activity_sessions_complete'
                 AND column_name = 'thumbnail_url') THEN
    ALTER TABLE activity_sessions_complete ADD COLUMN thumbnail_url TEXT;
  END IF;

  -- 2. Vérifier si user_recipe_tracking a les bonnes colonnes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_recipe_tracking'
                 AND column_name = 'would_make_again') THEN
    ALTER TABLE user_recipe_tracking ADD COLUMN would_make_again BOOLEAN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_recipe_tracking'
                 AND column_name = 'preparation_time_actual') THEN
    ALTER TABLE user_recipe_tracking ADD COLUMN preparation_time_actual INTEGER;
  END IF;

  -- 3. Vérifier si user_activity_tracking a les bonnes colonnes (post migration)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_activity_tracking'
                 AND column_name = 'pre_energy_level') THEN
    ALTER TABLE user_activity_tracking ADD COLUMN pre_energy_level INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_activity_tracking'
                 AND column_name = 'post_energy_level') THEN
    ALTER TABLE user_activity_tracking ADD COLUMN post_energy_level INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_activity_tracking'
                 AND column_name = 'duration_seconds') THEN
    ALTER TABLE user_activity_tracking ADD COLUMN duration_seconds INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_activity_tracking'
                 AND column_name = 'completion_percentage') THEN
    ALTER TABLE user_activity_tracking ADD COLUMN completion_percentage INTEGER DEFAULT 100;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_activity_tracking'
                 AND column_name = 'session_notes') THEN
    ALTER TABLE user_activity_tracking ADD COLUMN session_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_activity_tracking'
                 AND column_name = 'difficulty_felt_rating') THEN
    ALTER TABLE user_activity_tracking ADD COLUMN difficulty_felt_rating INTEGER;
  END IF;

  RAISE NOTICE '✅ Vérification des colonnes terminée - schéma aligné avec les services';

END $$;

-- MISE À JOUR DES DONNÉES EXISTANTES POUR COHÉRENCE
UPDATE activity_sessions_complete
SET is_active = true
WHERE is_active IS NULL;

-- MESSAGE DE CONFIRMATION
DO $$
BEGIN
  RAISE NOTICE '=== CORRECTION SEEDS TERMINÉE ===';
  RAISE NOTICE 'Tables vérifiées et corrigées:';
  RAISE NOTICE '✅ activity_sessions_complete - colonnes alignées';
  RAISE NOTICE '✅ user_recipe_tracking - colonnes services';
  RAISE NOTICE '✅ user_activity_tracking - colonnes services';
  RAISE NOTICE '';
  RAISE NOTICE 'Les fichiers seed sont maintenant compatibles';
  RAISE NOTICE 'avec le schéma final de la base de données';
  RAISE NOTICE '=====================================';
END $$;