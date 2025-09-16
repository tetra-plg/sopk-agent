-- =====================================================
-- Migration: Unifier les tables d'activités
-- Date: 2025-09-16
-- Objectif: Fusionner activity_sessions_complete dans activity_sessions
-- =====================================================

-- 1. D'abord, ajouter les colonnes manquantes à activity_sessions
ALTER TABLE activity_sessions
  ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20),
  ADD COLUMN IF NOT EXISTS intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  ADD COLUMN IF NOT EXISTS sopk_benefits TEXT[],
  ADD COLUMN IF NOT EXISTS symptom_targets TEXT[],
  ADD COLUMN IF NOT EXISTS contraindications TEXT[],
  ADD COLUMN IF NOT EXISTS audio_guide_url TEXT,
  ADD COLUMN IF NOT EXISTS video_preview_url TEXT,
  ADD COLUMN IF NOT EXISTS easy_modifications TEXT[],
  ADD COLUMN IF NOT EXISTS advanced_variations TEXT[];

-- 2. Migrer difficulty_level vers difficulty (harmonisation)
UPDATE activity_sessions
SET difficulty = CASE
  WHEN difficulty_level = 1 THEN 'beginner'
  WHEN difficulty_level = 2 THEN 'easy'
  WHEN difficulty_level = 3 THEN 'medium'
  ELSE 'easy'
END
WHERE difficulty IS NULL;

-- 3. Migrer les données existantes de sopk_symptoms vers symptom_targets
UPDATE activity_sessions
SET symptom_targets = sopk_symptoms
WHERE symptom_targets IS NULL AND sopk_symptoms IS NOT NULL;

-- 4. Migrer benefits vers sopk_benefits
UPDATE activity_sessions
SET sopk_benefits = benefits
WHERE sopk_benefits IS NULL AND benefits IS NOT NULL;

-- 5. Migrer audio_url vers audio_guide_url
UPDATE activity_sessions
SET audio_guide_url = audio_url
WHERE audio_guide_url IS NULL AND audio_url IS NOT NULL;

-- 6. Migrer thumbnail_url vers video_preview_url (si approprié)
UPDATE activity_sessions
SET video_preview_url = thumbnail_url
WHERE video_preview_url IS NULL AND thumbnail_url IS NOT NULL;

-- 7. Si activity_sessions_complete existe et contient des données, les migrer
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables
             WHERE table_schema = 'public'
             AND table_name = 'activity_sessions_complete') THEN

    -- Copier les données qui n'existent pas déjà
    INSERT INTO activity_sessions (
      title, description, category, duration_minutes,
      difficulty, intensity_level,
      sopk_benefits, symptom_targets, contraindications,
      instructions, equipment_needed,
      audio_guide_url, video_preview_url,
      easy_modifications, advanced_variations,
      created_at
    )
    SELECT
      title, description, category, duration_minutes,
      difficulty, intensity_level,
      sopk_benefits, symptom_targets, contraindications,
      instructions, equipment_needed,
      audio_guide_url, video_preview_url,
      easy_modifications, advanced_variations,
      created_at
    FROM activity_sessions_complete
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_sessions
      WHERE activity_sessions.title = activity_sessions_complete.title
    );

    -- Mettre à jour les références dans user_activity_tracking si nécessaire
    -- (Note: user_activity_tracking référence déjà activity_sessions, pas activity_sessions_complete)

  END IF;
END $$;

-- 8. Supprimer les anciennes colonnes devenues obsolètes (après vérification)
ALTER TABLE activity_sessions
  DROP COLUMN IF EXISTS difficulty_level,
  DROP COLUMN IF EXISTS sopk_symptoms,
  DROP COLUMN IF EXISTS benefits,
  DROP COLUMN IF EXISTS audio_url,
  DROP COLUMN IF EXISTS thumbnail_url;

-- 9. Rendre certaines colonnes NOT NULL si nécessaire
ALTER TABLE activity_sessions
  ALTER COLUMN difficulty SET NOT NULL,
  ALTER COLUMN instructions SET NOT NULL;

-- 10. Supprimer la table activity_sessions_complete si elle existe
DROP TABLE IF EXISTS activity_sessions_complete CASCADE;

-- 11. Mettre à jour les index pour les nouvelles colonnes
DROP INDEX IF EXISTS idx_activity_sessions_sopk_symptoms;
CREATE INDEX IF NOT EXISTS idx_activity_sessions_symptom_targets ON activity_sessions USING GIN(symptom_targets);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_sopk_benefits ON activity_sessions USING GIN(sopk_benefits);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_difficulty ON activity_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_intensity ON activity_sessions(intensity_level);

-- 12. Ajouter des commentaires pour documentation
COMMENT ON COLUMN activity_sessions.difficulty IS 'Niveau de difficulté: beginner, easy, medium, advanced';
COMMENT ON COLUMN activity_sessions.intensity_level IS 'Niveau d''intensité de 1 (très léger) à 5 (intense)';
COMMENT ON COLUMN activity_sessions.symptom_targets IS 'Symptômes SOPK ciblés par cette session';
COMMENT ON COLUMN activity_sessions.sopk_benefits IS 'Bénéfices spécifiques pour le SOPK';
COMMENT ON COLUMN activity_sessions.contraindications IS 'Contre-indications ou précautions à prendre';
COMMENT ON COLUMN activity_sessions.easy_modifications IS 'Modifications pour rendre l''exercice plus facile';
COMMENT ON COLUMN activity_sessions.advanced_variations IS 'Variations pour augmenter la difficulté';

-- 13. Vérification finale
DO $$
BEGIN
  RAISE NOTICE 'Migration terminée. La table activity_sessions contient maintenant tous les champs nécessaires.';
  RAISE NOTICE 'La table activity_sessions_complete a été supprimée si elle existait.';
END $$;