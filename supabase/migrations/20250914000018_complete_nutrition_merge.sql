-- Migration complète: Fusion des tables de nutrition et tracking
-- Créée le: 2025-09-14
-- Description: Fusionner meal_suggestions dans recipes ET user_meal_tracking dans user_recipe_tracking

-- ==============================================
-- ÉTAPE 1: Enrichir la table recipes
-- ==============================================

-- Ajouter les champs de meal_suggestions manquants dans recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS symptom_targets TEXT[];
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cycle_phases TEXT[];
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS main_nutrients TEXT[];
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS estimated_calories INTEGER;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS mood_boosting BOOLEAN DEFAULT false;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tips TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_simple_suggestion BOOLEAN DEFAULT false;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients_simple TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS preparation_steps_simple TEXT;

-- ==============================================
-- ÉTAPE 2: Enrichir la table user_recipe_tracking
-- ==============================================

-- Ajouter les champs de user_meal_tracking manquants dans user_recipe_tracking
ALTER TABLE user_recipe_tracking ADD COLUMN IF NOT EXISTS meal_type VARCHAR(20);

-- ==============================================
-- ÉTAPE 3: Migrer les données meal_suggestions → recipes
-- ==============================================

DO $$
BEGIN
  -- Migrer meal_suggestions vers recipes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_suggestions') THEN
    INSERT INTO recipes (
      title,
      category,
      difficulty,
      prep_time_minutes,
      cook_time_minutes,
      servings,
      glycemic_index_category,
      sopk_benefits,
      dietary_tags,
      symptom_targets,
      cycle_phases,
      main_nutrients,
      estimated_calories,
      mood_boosting,
      season,
      ingredients_simple,
      preparation_steps_simple,
      tips,
      is_simple_suggestion,
      created_at,
      -- Champs obligatoires avec valeurs par défaut
      ingredients,
      instructions
    )
    SELECT
      ms.name as title,
      ms.category,
      ms.difficulty,
      ms.prep_time_minutes,
      0 as cook_time_minutes,
      1 as servings,
      ms.glycemic_index_category,
      ms.sopk_benefits,
      ms.dietary_restrictions as dietary_tags,
      ms.symptom_targets,
      ms.cycle_phases,
      ms.main_nutrients,
      ms.estimated_calories,
      ms.mood_boosting,
      ms.season,
      ms.ingredients_simple,
      ms.preparation_steps as preparation_steps_simple,
      ms.tips,
      true as is_simple_suggestion,
      ms.created_at,
      '[]'::jsonb as ingredients,
      '[]'::jsonb as instructions
    FROM meal_suggestions ms
    WHERE NOT EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.title = ms.name
      AND r.category = ms.category
      AND r.is_simple_suggestion = true
    );

    RAISE NOTICE '✅ meal_suggestions migrées vers recipes';
  END IF;
END $$;

-- ==============================================
-- ÉTAPE 4: Migrer les données user_meal_tracking → user_recipe_tracking
-- ==============================================

DO $$
BEGIN
  -- Migrer user_meal_tracking vers user_recipe_tracking
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_meal_tracking')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_suggestions') THEN

    INSERT INTO user_recipe_tracking (
      user_id,
      recipe_id,
      date_cooked,
      servings_made,
      difficulty_rating,
      taste_rating,
      would_make_again,
      meal_type,
      notes,
      created_at
    )
    SELECT
      umt.user_id,
      r.id as recipe_id,
      umt.date as date_cooked,
      1 as servings_made,
      -- Mapper difficulty_felt vers difficulty_rating (1-5)
      CASE
        WHEN umt.difficulty_felt = 'easier' THEN 5
        WHEN umt.difficulty_felt = 'as_expected' THEN 3
        WHEN umt.difficulty_felt = 'harder' THEN 1
        ELSE NULL
      END as difficulty_rating,
      umt.satisfaction_rating as taste_rating,
      umt.will_remake as would_make_again,
      umt.meal_type,
      CONCAT('Satisfaction: ', COALESCE(umt.satisfaction_rating::text, 'N/A'),
             ', Difficulté ressentie: ', COALESCE(umt.difficulty_felt, 'N/A')) as notes,
      umt.created_at
    FROM user_meal_tracking umt
    JOIN meal_suggestions ms ON umt.meal_id = ms.id
    JOIN recipes r ON r.title = ms.name
                  AND r.category = ms.category
                  AND r.is_simple_suggestion = true
    WHERE NOT EXISTS (
      SELECT 1 FROM user_recipe_tracking urt
      WHERE urt.user_id = umt.user_id
      AND urt.recipe_id = r.id
      AND urt.date_cooked = umt.date
      AND urt.created_at = umt.created_at
    );

    RAISE NOTICE '✅ user_meal_tracking migrées vers user_recipe_tracking';
  END IF;
END $$;

-- ==============================================
-- ÉTAPE 5: Supprimer les anciennes tables (dans l'ordre des FK)
-- ==============================================

-- D'abord user_meal_tracking (qui dépend de meal_suggestions)
DROP TABLE IF EXISTS user_meal_tracking CASCADE;
-- Puis meal_suggestions
DROP TABLE IF EXISTS meal_suggestions CASCADE;

-- ==============================================
-- ÉTAPE 6: Créer les index pour les performances
-- ==============================================

-- Index pour recipes
CREATE INDEX IF NOT EXISTS idx_recipes_symptom_targets ON recipes USING GIN(symptom_targets) WHERE symptom_targets IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_cycle_phases ON recipes USING GIN(cycle_phases) WHERE cycle_phases IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_main_nutrients ON recipes USING GIN(main_nutrients) WHERE main_nutrients IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_is_simple_suggestion ON recipes(is_simple_suggestion);
CREATE INDEX IF NOT EXISTS idx_recipes_mood_boosting ON recipes(mood_boosting) WHERE mood_boosting = true;

-- Index pour user_recipe_tracking
CREATE INDEX IF NOT EXISTS idx_user_recipe_tracking_meal_type ON user_recipe_tracking(meal_type) WHERE meal_type IS NOT NULL;

-- ==============================================
-- ÉTAPE 7: Commentaires et documentation
-- ==============================================

COMMENT ON TABLE recipes IS 'Table unifiée pour les recettes détaillées et suggestions simples SOPK (fusion de meal_suggestions + recipes)';
COMMENT ON COLUMN recipes.is_simple_suggestion IS 'true = suggestion simple (ex-meal_suggestions), false = recette détaillée';
COMMENT ON COLUMN recipes.ingredients_simple IS 'Version courte des ingrédients pour les suggestions simples';
COMMENT ON COLUMN recipes.preparation_steps_simple IS 'Instructions courtes pour les suggestions simples';
COMMENT ON COLUMN recipes.symptom_targets IS 'Symptômes SOPK ciblés par cette recette/suggestion';
COMMENT ON COLUMN recipes.cycle_phases IS 'Phases du cycle menstruel adaptées';
COMMENT ON COLUMN recipes.main_nutrients IS 'Nutriments principaux apportés';

COMMENT ON TABLE user_recipe_tracking IS 'Table unifiée pour le tracking des recettes/repas consommés (fusion de user_meal_tracking + user_recipe_tracking)';
COMMENT ON COLUMN user_recipe_tracking.meal_type IS 'Type de repas: breakfast, lunch, dinner, snack (hérité de user_meal_tracking)';

DO $$ BEGIN
  RAISE NOTICE '✅ Migration complète terminée - Tables de nutrition unifiées';
END $$;