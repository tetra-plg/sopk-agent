-- =====================================================
-- HARMONISATION recipes avec meal_suggestions
-- Date: 2025-09-16
-- Objectif: Ajouter les champs manquants dans recipes selon meal_suggestions et types TS
-- =====================================================

-- RÈGLE 1: Ajouter les champs manquants en BDD (présents dans meal_suggestions mais pas dans recipes)
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS symptom_targets TEXT[],
  ADD COLUMN IF NOT EXISTS cycle_phases TEXT[], -- ['menstrual', 'follicular', 'ovulation', 'luteal', 'any']
  ADD COLUMN IF NOT EXISTS main_nutrients TEXT[], -- ['protein', 'fiber', 'omega3']
  ADD COLUMN IF NOT EXISTS estimated_calories INTEGER,
  ADD COLUMN IF NOT EXISTS mood_boosting BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tips TEXT;

-- RÈGLE 2: Migrer les données existantes si possible
UPDATE recipes SET
  estimated_calories = calories,
  main_nutrients = CASE
    WHEN 'protein' = ANY(sopk_benefits) THEN ARRAY['protein']
    WHEN 'fiber' = ANY(dietary_tags) THEN ARRAY['fiber']
    ELSE ARRAY[]::TEXT[]
  END,
  cycle_phases = ARRAY['any']::TEXT[], -- Par défaut, toutes les phases
  mood_boosting = CASE
    WHEN 'stress_reduction' = ANY(sopk_benefits) OR 'mood_balance' = ANY(sopk_benefits) THEN true
    ELSE false
  END
WHERE estimated_calories IS NULL;

-- RÈGLE 3: S'assurer que la contrainte calories existe mais n'est pas en conflit
-- Garder les deux champs calories et estimated_calories pour flexibilité
ALTER TABLE recipes
  ALTER COLUMN calories DROP NOT NULL; -- Permettre NULL pour flexibilité

-- Mettre à jour estimated_calories avec calories si estimated_calories est NULL
UPDATE recipes SET
  estimated_calories = calories
WHERE estimated_calories IS NULL AND calories IS NOT NULL;

-- Ajouter des commentaires explicatifs
COMMENT ON COLUMN recipes.symptom_targets IS 'Symptômes SOPK ciblés par cette recette';
COMMENT ON COLUMN recipes.cycle_phases IS 'Phases du cycle menstruel recommandées: menstrual, follicular, ovulation, luteal, any';
COMMENT ON COLUMN recipes.main_nutrients IS 'Nutriments principaux apportés: protein, fiber, omega3, iron, etc.';
COMMENT ON COLUMN recipes.estimated_calories IS 'Estimation calorique (peut différer de calories calculé)';
COMMENT ON COLUMN recipes.mood_boosting IS 'Recette ayant des propriétés d''amélioration de l''humeur';
COMMENT ON COLUMN recipes.tips IS 'Conseils supplémentaires pour la préparation ou consommation';

-- Créer des index pour les nouveaux champs qui seront souvent interrogés
CREATE INDEX IF NOT EXISTS idx_recipes_symptom_targets ON recipes USING GIN(symptom_targets);
CREATE INDEX IF NOT EXISTS idx_recipes_cycle_phases ON recipes USING GIN(cycle_phases);
CREATE INDEX IF NOT EXISTS idx_recipes_main_nutrients ON recipes USING GIN(main_nutrients);
CREATE INDEX IF NOT EXISTS idx_recipes_mood_boosting ON recipes(mood_boosting) WHERE mood_boosting = true;
CREATE INDEX IF NOT EXISTS idx_recipes_estimated_calories ON recipes(estimated_calories);

-- Vérification finale
DO $$
BEGIN
  RAISE NOTICE '✅ Champs ajoutés à recipes: symptom_targets, cycle_phases, main_nutrients, estimated_calories, mood_boosting, tips';
  RAISE NOTICE '✅ Index créés pour les recherches par symptômes, phases du cycle, et nutriments';
  RAISE NOTICE '✅ Harmonisation recipes/meal_suggestions terminée';
END $$;