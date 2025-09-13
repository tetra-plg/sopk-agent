-- =====================================================
-- SOPK Agent - Correction Alignement Service Layer
-- Migration pour aligner la BDD avec les services existants
-- Les services font foi sur les noms de colonnes
-- =====================================================

-- 1. CORRIGER user_recipe_tracking pour correspondre au recipeTrackingService.js
-- Le service utilise date_made dans la requête getRecipeHistory (ligne 139)
-- mais date_cooked ailleurs - on standardise sur date_cooked

-- Vérifier si la colonne date_made existe et la renommer si nécessaire
DO $$
BEGIN
    -- Si date_made existe, la renommer en date_cooked
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'user_recipe_tracking'
               AND column_name = 'date_made') THEN
        ALTER TABLE user_recipe_tracking RENAME COLUMN date_made TO date_cooked;
        RAISE NOTICE 'Colonne date_made renommée en date_cooked';
    END IF;

    -- Ajouter date_cooked si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_recipe_tracking'
                   AND column_name = 'date_cooked') THEN
        ALTER TABLE user_recipe_tracking ADD COLUMN date_cooked DATE NOT NULL DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Colonne date_cooked ajoutée';
    END IF;
END $$;

-- 2. S'assurer que les colonnes utilisées par recipeTrackingService existent
ALTER TABLE user_recipe_tracking
ADD COLUMN IF NOT EXISTS would_make_again BOOLEAN,
ADD COLUMN IF NOT EXISTS preparation_time_actual INTEGER;

-- Migrer les anciennes colonnes si elles existent
UPDATE user_recipe_tracking SET
    would_make_again = will_cook_again,
    preparation_time_actual = prep_time_actual
WHERE would_make_again IS NULL AND will_cook_again IS NOT NULL;

-- 3. NETTOYER les colonnes obsolètes qui ne sont pas utilisées par les services
-- Garder seulement les colonnes utilisées dans recipeTrackingService.js:
-- - id, user_id, recipe_id, date_cooked, servings_made
-- - difficulty_rating, taste_rating, would_make_again, preparation_time_actual, notes

-- Supprimer les colonnes non utilisées par le service
ALTER TABLE user_recipe_tracking
DROP COLUMN IF EXISTS will_cook_again,
DROP COLUMN IF EXISTS prep_time_actual;

-- 4. CORRIGER les index pour correspondre aux requêtes du service
DROP INDEX IF EXISTS idx_user_recipe_tracking_user_date;
CREATE INDEX IF NOT EXISTS idx_user_recipe_tracking_user_date
ON user_recipe_tracking(user_id, date_cooked DESC);

-- 5. VÉRIFIER que les tables correspondent aux services

-- Pour recipeService.js - table recipes (semble déjà correcte)
-- Pour moodService.js - table mood_entries (semble déjà correcte)
-- Pour activityService.js - table user_activity_tracking (déjà corrigée dans migration précédente)
-- Pour userProfileService.js - table user_profiles (semble déjà correcte)

-- 6. AJOUTER les contraintes manquantes selon les services
DO $$
BEGIN
    -- Ajouter contraintes seulement si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'check_difficulty_rating'
                   AND table_name = 'user_recipe_tracking') THEN
        ALTER TABLE user_recipe_tracking
        ADD CONSTRAINT check_difficulty_rating
        CHECK (difficulty_rating IS NULL OR (difficulty_rating >= 1 AND difficulty_rating <= 5));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'check_taste_rating'
                   AND table_name = 'user_recipe_tracking') THEN
        ALTER TABLE user_recipe_tracking
        ADD CONSTRAINT check_taste_rating
        CHECK (taste_rating IS NULL OR (taste_rating >= 1 AND taste_rating <= 5));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'check_servings_made'
                   AND table_name = 'user_recipe_tracking') THEN
        ALTER TABLE user_recipe_tracking
        ADD CONSTRAINT check_servings_made
        CHECK (servings_made > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'check_preparation_time_actual'
                   AND table_name = 'user_recipe_tracking') THEN
        ALTER TABLE user_recipe_tracking
        ADD CONSTRAINT check_preparation_time_actual
        CHECK (preparation_time_actual IS NULL OR preparation_time_actual > 0);
    END IF;
END $$;

-- 7. MISE À JOUR des commentaires pour refléter l'alignement
COMMENT ON TABLE user_recipe_tracking IS 'Suivi des recettes cuisinées - aligné avec recipeTrackingService.js';
COMMENT ON COLUMN user_recipe_tracking.date_cooked IS 'Date de préparation de la recette (utilisée par le service)';
COMMENT ON COLUMN user_recipe_tracking.would_make_again IS 'Intention de refaire la recette (utilisée par le service)';
COMMENT ON COLUMN user_recipe_tracking.preparation_time_actual IS 'Temps de préparation réel en minutes (utilisé par le service)';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '=== CORRECTION ALIGNEMENT SERVICE LAYER COMPLETÉE ===';
  RAISE NOTICE 'Base de données alignée avec les services existants:';
  RAISE NOTICE '✅ recipeTrackingService - colonnes standardisées';
  RAISE NOTICE '✅ date_cooked utilisé comme référence';
  RAISE NOTICE '✅ would_make_again et preparation_time_actual alignés';
  RAISE NOTICE '✅ Index optimisés pour les requêtes du service';
  RAISE NOTICE '========================================================';
END $$;