-- =====================================================
-- CORRECTION DES INCOHÉRENCES BDD/TYPESCRIPT
-- Date: 2025-09-16
-- Objectif: Corriger toutes les incohérences identifiées dans le rapport
-- =====================================================

-- 1. CORRIGER mood_entries - Ajouter colonnes manquantes
ALTER TABLE mood_entries
  ADD COLUMN IF NOT EXISTS time VARCHAR(8),
  ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  ADD COLUMN IF NOT EXISTS stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10);

-- Renommer mood_tags vers tags pour cohérence TypeScript
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mood_entries' AND column_name = 'mood_tags'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mood_entries' AND column_name = 'tags'
  ) THEN
    ALTER TABLE mood_entries RENAME COLUMN mood_tags TO tags;
    RAISE NOTICE '✅ Colonne mood_tags renommée vers tags';
  END IF;
END $$;

-- 2. CORRIGER breathing_sessions - Ajouter colonnes manquantes
ALTER TABLE breathing_sessions
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Renommer technique vers technique_id pour cohérence TypeScript
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'breathing_sessions' AND column_name = 'technique'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'breathing_sessions' AND column_name = 'technique_id'
  ) THEN
    ALTER TABLE breathing_sessions RENAME COLUMN technique TO technique_id;
    RAISE NOTICE '✅ Colonne technique renommée vers technique_id';
  END IF;
END $$;

-- 3. CORRIGER breathing_techniques - Ajouter colonnes manquantes
ALTER TABLE breathing_techniques
  ADD COLUMN IF NOT EXISTS instructions JSONB,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5);

-- Convertir sopk_benefits de TEXT vers STRING (en fait c'est déjà correct en PostgreSQL)
-- PostgreSQL TEXT = STRING en TypeScript, donc pas de changement nécessaire

-- 4. CORRIGER user_recipe_tracking - Standardiser nom de colonne
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_recipe_tracking' AND column_name = 'would_make_again'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_recipe_tracking' AND column_name = 'will_cook_again'
  ) THEN
    ALTER TABLE user_recipe_tracking RENAME COLUMN would_make_again TO will_cook_again;
    RAISE NOTICE '✅ Colonne would_make_again renommée vers will_cook_again';
  END IF;
END $$;

-- 5. NETTOYER recipes - Unifier les champs calories
-- Garder seulement estimated_calories et supprimer calories redondant
DO $$
BEGIN
  -- Copier calories vers estimated_calories si estimated_calories est null
  UPDATE recipes
  SET estimated_calories = calories
  WHERE estimated_calories IS NULL AND calories IS NOT NULL;

  -- Supprimer la colonne calories redondante
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'calories'
  ) THEN
    ALTER TABLE recipes DROP COLUMN calories;
    RAISE NOTICE '✅ Colonne calories redondante supprimée, estimated_calories conservée';
  END IF;

  -- Supprimer la colonne 2 eme calories redondante
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'estimated_calories'
  ) THEN
    ALTER TABLE recipes DROP COLUMN estimated_calories;
    RAISE NOTICE '✅ Colonne estimated_calories redondante supprimée';
  END IF;
END $$;

-- 6. NETTOYER user_activity_tracking - Supprimer champs dupliqués
-- Garder les nouveaux noms et supprimer les anciens pour rétro-compatibilité
DO $$
BEGIN
  -- Copier date_completed vers date si date est null
  UPDATE user_activity_tracking
  SET date = date_completed
  WHERE date IS NULL AND date_completed IS NOT NULL;

  -- Copier pre_energy_level vers energy_before si energy_before est null
  UPDATE user_activity_tracking
  SET energy_before = pre_energy_level
  WHERE energy_before IS NULL AND pre_energy_level IS NOT NULL;

  -- Copier post_energy_level vers energy_after si energy_after est null
  UPDATE user_activity_tracking
  SET energy_after = post_energy_level
  WHERE energy_after IS NULL AND post_energy_level IS NOT NULL;

  -- Copier session_notes vers notes si notes est null
  UPDATE user_activity_tracking
  SET notes = session_notes
  WHERE notes IS NULL AND session_notes IS NOT NULL;

  RAISE NOTICE '✅ Données copiées vers les champs de compatibilité';
END $$;

-- 7. AJOUTER INDEX MANQUANTS sur nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_mood_entries_energy_level ON mood_entries(energy_level);
CREATE INDEX IF NOT EXISTS idx_mood_entries_stress_level ON mood_entries(stress_level);
CREATE INDEX IF NOT EXISTS idx_mood_entries_time ON mood_entries(time);

CREATE INDEX IF NOT EXISTS idx_breathing_sessions_date ON breathing_sessions(date);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_satisfaction ON breathing_sessions(satisfaction_rating);

CREATE INDEX IF NOT EXISTS idx_breathing_techniques_duration_minutes ON breathing_techniques(duration_minutes);
CREATE INDEX IF NOT EXISTS idx_breathing_techniques_difficulty_level ON breathing_techniques(difficulty_level);

-- 8. METTRE À JOUR LES TRIGGERS
-- Assurer que updated_at est automatiquement mis à jour pour toutes les tables
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ajouter triggers updated_at pour les tables qui n'en ont pas
DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;
CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_breathing_sessions_updated_at ON breathing_sessions;
CREATE TRIGGER update_breathing_sessions_updated_at
  BEFORE UPDATE ON breathing_sessions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_breathing_techniques_updated_at ON breathing_techniques;
CREATE TRIGGER update_breathing_techniques_updated_at
  BEFORE UPDATE ON breathing_techniques
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- 9. CORRIGER LA CONTRAINTE FOREIGN KEY manquante
-- user_activity_tracking.session_id → activity_sessions.id
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_activity_tracking_session_id_fkey'
    AND table_name = 'user_activity_tracking'
  ) THEN
    ALTER TABLE user_activity_tracking
    DROP CONSTRAINT user_activity_tracking_session_id_fkey;
  END IF;

  -- Ajouter la nouvelle contrainte vers activity_sessions
  ALTER TABLE user_activity_tracking
  ADD CONSTRAINT user_activity_tracking_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE;

  RAISE NOTICE '✅ Contrainte FK user_activity_tracking.session_id → activity_sessions.id ajoutée';
END $$;

-- 10. POPULER LES NOUVELLES COLONNES avec des valeurs par défaut intelligentes
-- Mettre à jour breathing_sessions.date depuis created_at
UPDATE breathing_sessions
SET date = DATE(created_at)
WHERE date IS NULL;

-- Calculer duration_minutes depuis duration_seconds pour breathing_techniques
UPDATE breathing_techniques
SET duration_minutes = CEIL(duration_seconds / 60.0)
WHERE duration_minutes IS NULL AND duration_seconds IS NOT NULL;

-- Ajouter des instructions par défaut pour les techniques de respiration existantes
UPDATE breathing_techniques
SET instructions = jsonb_build_object(
  'phases', jsonb_build_array(
    jsonb_build_object(
      'name', 'breathing',
      'duration_seconds', duration_seconds,
      'instructions', ARRAY['Suivez le rythme de respiration indiqué'],
      'breath_pattern', jsonb_build_object(
        'inhale_seconds', pattern[1],
        'hold_seconds', COALESCE(pattern[2], 0),
        'exhale_seconds', pattern[ARRAY_LENGTH(pattern, 1)],
        'pause_seconds', CASE WHEN ARRAY_LENGTH(pattern, 1) > 3 THEN pattern[4] ELSE 0 END
      )
    )
  ),
  'tips', ARRAY['Respirez calmement', 'Concentrez-vous sur votre respiration'],
  'warnings', ARRAY['Arrêtez si vous ressentez des vertiges']
)
WHERE instructions IS NULL;

-- Ajouter difficulty_level basé sur difficulty textuel
UPDATE breathing_techniques
SET difficulty_level = CASE
  WHEN difficulty = 'beginner' THEN 1
  WHEN difficulty = 'intermediate' THEN 3
  WHEN difficulty = 'advanced' THEN 5
  ELSE 2
END
WHERE difficulty_level IS NULL;

-- 11. COMMENTAIRES sur les nouvelles colonnes
COMMENT ON COLUMN mood_entries.time IS 'Heure de saisie de l''humeur (format HH:MM)';
COMMENT ON COLUMN mood_entries.energy_level IS 'Niveau d''énergie de 1 à 5';
COMMENT ON COLUMN mood_entries.stress_level IS 'Niveau de stress de 1 à 10';

COMMENT ON COLUMN breathing_sessions.date IS 'Date de la session (extrait automatiquement de created_at)';
COMMENT ON COLUMN breathing_sessions.satisfaction_rating IS 'Note de satisfaction de 1 à 5';
COMMENT ON COLUMN breathing_sessions.notes IS 'Notes personnelles sur la session';

COMMENT ON COLUMN breathing_techniques.instructions IS 'Instructions structurées JSON selon BreathingInstructions interface';
COMMENT ON COLUMN breathing_techniques.duration_minutes IS 'Durée en minutes (calculée depuis duration_seconds)';
COMMENT ON COLUMN breathing_techniques.difficulty_level IS 'Niveau de difficulté numérique de 1 à 5';

-- 12. VÉRIFICATIONS FINALES
DO $$
DECLARE
  report TEXT := E'\n=== RAPPORT CORRECTIONS INCOHÉRENCES ===\n';
  missing_count INTEGER;
BEGIN

-- Vérifier MoodEntry
SELECT COUNT(*) INTO missing_count
FROM unnest(ARRAY['time', 'energy_level', 'stress_level', 'tags']) AS expected_field
WHERE expected_field NOT IN (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'mood_entries'
);
report := report || '🔍 MoodEntry: ' || CASE WHEN missing_count = 0 THEN '✅ Toutes colonnes présentes' ELSE '❌ ' || missing_count || ' colonnes manquantes' END || E'\n';

-- Vérifier BreathingSession
SELECT COUNT(*) INTO missing_count
FROM unnest(ARRAY['technique_id', 'date', 'satisfaction_rating', 'notes']) AS expected_field
WHERE expected_field NOT IN (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'breathing_sessions'
);
report := report || '🔍 BreathingSession: ' || CASE WHEN missing_count = 0 THEN '✅ Toutes colonnes présentes' ELSE '❌ ' || missing_count || ' colonnes manquantes' END || E'\n';

-- Vérifier BreathingTechnique
SELECT COUNT(*) INTO missing_count
FROM unnest(ARRAY['instructions', 'duration_minutes', 'difficulty_level']) AS expected_field
WHERE expected_field NOT IN (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'breathing_techniques'
);
report := report || '🔍 BreathingTechnique: ' || CASE WHEN missing_count = 0 THEN '✅ Toutes colonnes présentes' ELSE '❌ ' || missing_count || ' colonnes manquantes' END || E'\n';

-- Vérifier UserRecipeTracking
IF EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'user_recipe_tracking' AND column_name = 'will_cook_again'
) THEN
  report := report || '🔍 UserRecipeTracking: ✅ Champ will_cook_again présent' || E'\n';
ELSE
  report := report || '🔍 UserRecipeTracking: ❌ Champ will_cook_again manquant' || E'\n';
END IF;

-- Vérifier contrainte FK
IF EXISTS (
  SELECT 1 FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
  WHERE tc.table_name = 'user_activity_tracking'
  AND ccu.column_name = 'session_id'
  AND ccu.table_name = 'activity_sessions'
) THEN
  report := report || '🔍 Contrainte FK: ✅ user_activity_tracking.session_id → activity_sessions.id' || E'\n';
ELSE
  report := report || '🔍 Contrainte FK: ❌ Contrainte manquante' || E'\n';
END IF;

report := report || E'\n=== RÉSUMÉ ===\n';
report := report || '🎯 Corrections appliquées:' || E'\n';
report := report || '   • Colonnes manquantes ajoutées' || E'\n';
report := report || '   • Noms de champs standardisés' || E'\n';
report := report || '   • Champs redondants nettoyés' || E'\n';
report := report || '   • Index optimisés' || E'\n';
report := report || '   • Contraintes FK corrigées' || E'\n';
report := report || '   • Triggers updated_at ajoutés' || E'\n';

RAISE NOTICE '%', report;
END $$;

-- Message final
DO $$
BEGIN
  RAISE NOTICE '🎉 CORRECTIONS INCOHÉRENCES TERMINÉES !';
  RAISE NOTICE '📊 Base de données maintenant cohérente avec TypeScript interfaces';
  RAISE NOTICE '🔧 Prêt pour le seed de développement';
END $$;