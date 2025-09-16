-- =====================================================
-- HARMONISATION activity_sessions avec types TypeScript
-- Date: 2025-09-16
-- Objectif: Appliquer les règles de cohérence BDD/TypeScript
-- =====================================================

-- RÈGLE 2: Renommer les colonnes pour correspondre aux noms TypeScript
ALTER TABLE activity_sessions
  RENAME COLUMN difficulty_level TO difficulty;

-- Changer le type de difficulty de INTEGER vers VARCHAR pour les valeurs string
ALTER TABLE activity_sessions
  ALTER COLUMN difficulty TYPE VARCHAR(20);

-- Mettre à jour les valeurs existantes
UPDATE activity_sessions
SET difficulty = CASE
  WHEN difficulty::text = '1' THEN 'beginner'
  WHEN difficulty::text = '2' THEN 'easy'
  WHEN difficulty::text = '3' THEN 'medium'
  ELSE 'beginner'
END;

-- RÈGLE 2: Renommer les autres colonnes
ALTER TABLE activity_sessions
  RENAME COLUMN audio_url TO audio_guide_url;

ALTER TABLE activity_sessions
  RENAME COLUMN thumbnail_url TO video_preview_url;

ALTER TABLE activity_sessions
  RENAME COLUMN sopk_symptoms TO symptom_targets;

ALTER TABLE activity_sessions
  RENAME COLUMN benefits TO sopk_benefits;

-- RÈGLE 1: Ajouter les colonnes manquantes en BDD
ALTER TABLE activity_sessions
  ADD COLUMN intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  ADD COLUMN contraindications TEXT[],
  ADD COLUMN easy_modifications TEXT[],
  ADD COLUMN advanced_variations TEXT[];

-- Mettre à jour les index après renommage des colonnes
DROP INDEX IF EXISTS idx_activity_sessions_sopk_symptoms;
CREATE INDEX idx_activity_sessions_symptom_targets ON activity_sessions USING GIN(symptom_targets);
CREATE INDEX idx_activity_sessions_sopk_benefits ON activity_sessions USING GIN(sopk_benefits);
CREATE INDEX idx_activity_sessions_difficulty ON activity_sessions(difficulty);

-- Mettre à jour les commentaires
COMMENT ON COLUMN activity_sessions.difficulty IS 'Niveau de difficulté: beginner, easy, medium, advanced';
COMMENT ON COLUMN activity_sessions.intensity_level IS 'Niveau d''intensité de 1 (très léger) à 5 (intense)';
COMMENT ON COLUMN activity_sessions.symptom_targets IS 'Symptômes SOPK ciblés par cette session';
COMMENT ON COLUMN activity_sessions.sopk_benefits IS 'Bénéfices spécifiques pour le SOPK';
COMMENT ON COLUMN activity_sessions.contraindications IS 'Contre-indications ou précautions à prendre';
COMMENT ON COLUMN activity_sessions.easy_modifications IS 'Modifications pour rendre l''exercice plus facile';
COMMENT ON COLUMN activity_sessions.advanced_variations IS 'Variations pour augmenter la difficulté';

-- Vérification finale
DO $$
BEGIN
  RAISE NOTICE 'Harmonisation terminée:';
  RAISE NOTICE '✅ difficulty_level → difficulty (VARCHAR)';
  RAISE NOTICE '✅ audio_url → audio_guide_url';
  RAISE NOTICE '✅ thumbnail_url → video_preview_url';
  RAISE NOTICE '✅ sopk_symptoms → symptom_targets';
  RAISE NOTICE '✅ benefits → sopk_benefits';
  RAISE NOTICE '✅ Ajout: intensity_level, contraindications, easy_modifications, advanced_variations';
END $$;