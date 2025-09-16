-- =====================================================
-- NETTOYAGE DES CHAMPS REDONDANTS
-- Date: 2025-09-16
-- Objectif: Supprimer les redondances identifiées entre TypeScript et BDD
-- =====================================================

-- ==============================================
-- 1. NETTOYAGE TABLE RECIPES - Unification Calories
-- ==============================================

-- Les calories sont maintenant uniquement dans nutritional_info (JSONB)
-- On garde le champ calories pour la rétro-compatibilité mais on le déprécie

-- Commentaire de dépréciation
COMMENT ON COLUMN recipes.calories IS 'DEPRECATED: Utilisez nutritional_info.calories à la place. Ce champ sera supprimé dans une future version.';
COMMENT ON COLUMN recipes.estimated_calories IS 'DEPRECATED: Redondant avec nutritional_info.calories. Sera supprimé.';

-- Mise à jour des données existantes : synchroniser calories vers nutritional_info
DO $$
BEGIN
  -- Si nutritional_info est NULL mais calories existe, créer la structure
  UPDATE recipes
  SET nutritional_info = jsonb_build_object('calories', calories)
  WHERE nutritional_info IS NULL AND calories IS NOT NULL;

  -- Si nutritional_info existe mais pas de calories, ajouter les calories
  UPDATE recipes
  SET nutritional_info = nutritional_info || jsonb_build_object('calories', calories)
  WHERE nutritional_info IS NOT NULL
    AND NOT nutritional_info ? 'calories'
    AND calories IS NOT NULL;

  -- Si estimated_calories existe et est différent, utiliser estimated_calories comme priorité
  UPDATE recipes
  SET nutritional_info = nutritional_info || jsonb_build_object('calories', estimated_calories)
  WHERE estimated_calories IS NOT NULL
    AND (NOT nutritional_info ? 'calories' OR (nutritional_info->>'calories')::int != estimated_calories);

  RAISE NOTICE '✅ Calories unifiées dans nutritional_info';
END $$;

-- ==============================================
-- 2. NETTOYAGE USER_NUTRITION_PREFERENCES - Goals
-- ==============================================

-- Renommer primary_nutrition_goals vers nutrition_goals (selon interface TS)
DO $$
BEGIN
  -- Vérifier si la colonne primary_nutrition_goals existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_nutrition_preferences'
    AND column_name = 'primary_nutrition_goals'
  ) THEN
    -- Ajouter la nouvelle colonne nutrition_goals
    ALTER TABLE user_nutrition_preferences
    ADD COLUMN IF NOT EXISTS nutrition_goals TEXT[];

    -- Migrer les données primary_nutrition_goals -> nutrition_goals
    UPDATE user_nutrition_preferences
    SET nutrition_goals = primary_nutrition_goals
    WHERE nutrition_goals IS NULL AND primary_nutrition_goals IS NOT NULL;

    -- Si goals et primary_nutrition_goals coexistent, fusionner intelligemment
    UPDATE user_nutrition_preferences
    SET nutrition_goals = array_cat(
      COALESCE(primary_nutrition_goals, '{}'),
      COALESCE(goals, '{}')
    )
    WHERE primary_nutrition_goals IS NOT NULL AND goals IS NOT NULL
    AND nutrition_goals IS NULL;

    RAISE NOTICE '✅ Colonnes nutrition goals unifiées';
  END IF;
END $$;

-- ==============================================
-- 3. NETTOYAGE USER_ACTIVITY_TRACKING - Alias
-- ==============================================

-- Supprimer les colonnes alias si elles existent (rétro-compatibilité TypeScript seulement)
DO $$
BEGIN
  -- Les alias energy_before, energy_after, notes ne doivent exister QUE dans l'interface TS
  -- Pas besoin de colonnes BDD pour ces alias

  -- Vérifier que les colonnes principales existent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_activity_tracking'
    AND column_name = 'pre_energy_level'
  ) THEN
    RAISE NOTICE '⚠️  Colonne pre_energy_level manquante - appliquer d''abord la migration de cohérence';
  END IF;

  RAISE NOTICE '✅ user_activity_tracking: Alias maintenus uniquement en TypeScript';
END $$;

-- ==============================================
-- 4. VALIDATION POST-NETTOYAGE
-- ==============================================

-- Fonction de validation des nettoyages
CREATE OR REPLACE FUNCTION validate_redundancy_cleanup()
RETURNS TABLE (
  table_name text,
  field_name text,
  status text,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY

  -- Vérifier recipes.nutritional_info
  SELECT
    'recipes'::text,
    'nutritional_info'::text,
    CASE
      WHEN (SELECT COUNT(*) FROM recipes WHERE nutritional_info ? 'calories') > 0
      THEN '✅ CORRECT'
      ELSE '❌ MANQUANT'
    END::text,
    'Les calories doivent être dans nutritional_info.calories'::text

  UNION ALL

  -- Vérifier user_nutrition_preferences.nutrition_goals
  SELECT
    'user_nutrition_preferences'::text,
    'nutrition_goals'::text,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_nutrition_preferences'
        AND column_name = 'nutrition_goals'
      )
      THEN '✅ CORRECT'
      ELSE '❌ MANQUANT'
    END::text,
    'Colonne nutrition_goals doit remplacer primary_nutrition_goals + goals'::text

  UNION ALL

  -- Vérifier user_activity_tracking structure propre
  SELECT
    'user_activity_tracking'::text,
    'pre_energy_level'::text,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_activity_tracking'
        AND column_name = 'pre_energy_level'
      )
      THEN '✅ CORRECT'
      ELSE '❌ MANQUANT'
    END::text,
    'Colonnes principales pre_/post_ doivent exister (alias seulement en TS)'::text;

END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 5. INDEX ET COMMENTAIRES FINAUX
-- ==============================================

-- Index sur nutritional_info pour recherche calories
CREATE INDEX IF NOT EXISTS idx_recipes_nutritional_calories
ON recipes USING GIN ((nutritional_info->'calories'))
WHERE nutritional_info ? 'calories';

-- Index sur nutrition_goals
CREATE INDEX IF NOT EXISTS idx_user_nutrition_goals
ON user_nutrition_preferences USING GIN(nutrition_goals)
WHERE nutrition_goals IS NOT NULL;

-- Commentaires finaux
COMMENT ON TABLE recipes IS 'Recettes SOPK - calories unifiées dans nutritional_info';
COMMENT ON TABLE user_nutrition_preferences IS 'Préférences nutrition - goals unifiés dans nutrition_goals';
COMMENT ON TABLE user_activity_tracking IS 'Tracking activité - structure nettoyée, alias en TypeScript seulement';

-- ==============================================
-- 6. RAPPORT FINAL
-- ==============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 NETTOYAGE DES REDONDANCES TERMINÉ';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ CHAMPS UNIFIÉS:';
  RAISE NOTICE '   • recipes: calories → nutritional_info.calories';
  RAISE NOTICE '   • user_nutrition_preferences: goals → nutrition_goals';
  RAISE NOTICE '   • user_activity_tracking: alias supprimés de la BDD';
  RAISE NOTICE '';
  RAISE NOTICE '📋 VÉRIFICATION:';
  RAISE NOTICE '   Exécuter: SELECT * FROM validate_redundancy_cleanup();';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  CHAMPS DÉPRÉCIÉS (à supprimer dans v2.0):';
  RAISE NOTICE '   • recipes.calories';
  RAISE NOTICE '   • recipes.estimated_calories';
  RAISE NOTICE '   • user_nutrition_preferences.primary_nutrition_goals';
  RAISE NOTICE '   • user_nutrition_preferences.goals';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 INTERFACES TYPESCRIPT NETTOYÉES!';
  RAISE NOTICE '==========================================';
END $$;

-- Exécuter la validation
SELECT * FROM validate_redundancy_cleanup();