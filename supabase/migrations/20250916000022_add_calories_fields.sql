-- =====================================================
-- AJOUT DES CHAMPS CALORIES pour SOPK
-- Date: 2025-09-16
-- Objectif: Ajouter le tracking des calories (essentiel SOPK)
-- =====================================================

-- Ajouter calories à la table recipes
-- (Note: nutritional_info existe déjà mais un champ dédié est plus pratique)
ALTER TABLE recipes
  ADD COLUMN calories INTEGER;

-- Ajouter calories à la table activity_sessions
-- (pour estimer les calories brûlées pendant la session)
ALTER TABLE activity_sessions
  ADD COLUMN estimated_calories_burned INTEGER;

-- Mise à jour des données existantes avec des valeurs par défaut réalistes
UPDATE recipes
SET calories = CASE
  WHEN category = 'breakfast' THEN 350
  WHEN category = 'lunch' THEN 450
  WHEN category = 'dinner' THEN 500
  WHEN category = 'snack' THEN 180
  WHEN category = 'dessert' THEN 250
  ELSE 400
END
WHERE calories IS NULL;

UPDATE activity_sessions
SET estimated_calories_burned = CASE
  WHEN duration_minutes <= 10 THEN duration_minutes * 4
  WHEN duration_minutes <= 20 THEN duration_minutes * 5
  WHEN duration_minutes <= 30 THEN duration_minutes * 6
  ELSE duration_minutes * 7
END
WHERE estimated_calories_burned IS NULL;

-- Ajouter des commentaires explicatifs
COMMENT ON COLUMN recipes.calories IS 'Calories par portion - important pour gestion SOPK';
COMMENT ON COLUMN activity_sessions.estimated_calories_burned IS 'Calories estimées brûlées pendant la session - important pour équilibre énergétique SOPK';

-- Vérification
DO $$
BEGIN
  RAISE NOTICE '✅ Champ calories ajouté à recipes';
  RAISE NOTICE '✅ Champ estimated_calories_burned ajouté à activity_sessions';
  RAISE NOTICE '💡 Important pour la gestion du SOPK !';
END $$;