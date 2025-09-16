-- =====================================================
-- COHÉRENCE FINALE activity_sessions avec types TypeScript
-- Date: 2025-09-16
-- Objectif: S'assurer que tous les champs TypeScript sont présents en BDD
-- =====================================================

-- RÈGLE 1: Ajouter les champs manquants selon l'interface ActivitySession
ALTER TABLE activity_sessions
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- RÈGLE 2: S'assurer que estimated_calories_burned existe (normalement ajouté par migration précédente)
-- Vérification de sécurité
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_sessions'
    AND column_name = 'estimated_calories_burned'
  ) THEN
    ALTER TABLE activity_sessions
    ADD COLUMN estimated_calories_burned INTEGER;
    RAISE NOTICE 'Champ estimated_calories_burned ajouté à activity_sessions';
  ELSE
    RAISE NOTICE 'Champ estimated_calories_burned déjà présent dans activity_sessions';
  END IF;
END $$;

-- RÈGLE 3: Mettre à jour les valeurs par défaut
UPDATE activity_sessions
SET is_active = true
WHERE is_active IS NULL;

UPDATE activity_sessions
SET updated_at = created_at
WHERE updated_at IS NULL;

-- RÈGLE 4: Créer une fonction trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_activity_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS update_activity_sessions_updated_at ON activity_sessions;
CREATE TRIGGER update_activity_sessions_updated_at
  BEFORE UPDATE ON activity_sessions
  FOR EACH ROW EXECUTE PROCEDURE update_activity_sessions_updated_at();

-- Ajouter des commentaires
COMMENT ON COLUMN activity_sessions.is_active IS 'Session active et disponible pour les utilisateurs';
COMMENT ON COLUMN activity_sessions.updated_at IS 'Dernière mise à jour de la session (automatique)';
COMMENT ON COLUMN activity_sessions.estimated_calories_burned IS 'Calories estimées brûlées - important pour équilibre SOPK';

-- Créer des index pour les nouveaux champs
CREATE INDEX IF NOT EXISTS idx_activity_sessions_is_active ON activity_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_activity_sessions_updated_at ON activity_sessions(updated_at DESC);

-- Vérification finale
DO $$
DECLARE
  missing_fields TEXT[];
  field_name TEXT;
BEGIN
  -- Vérifier que tous les champs de l'interface TypeScript sont présents
  missing_fields := ARRAY[]::TEXT[];

  -- Liste des champs attendus selon l'interface ActivitySession
  FOREACH field_name IN ARRAY ARRAY[
    'id', 'title', 'description', 'category', 'duration_minutes',
    'difficulty', 'intensity_level', 'estimated_calories_burned',
    'sopk_benefits', 'symptom_targets', 'contraindications',
    'instructions', 'equipment_needed', 'audio_guide_url',
    'video_preview_url', 'easy_modifications', 'advanced_variations',
    'is_active', 'created_at', 'updated_at'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'activity_sessions'
      AND column_name = field_name
    ) THEN
      missing_fields := array_append(missing_fields, field_name);
    END IF;
  END LOOP;

  IF array_length(missing_fields, 1) > 0 THEN
    RAISE WARNING 'Champs manquants dans activity_sessions: %', array_to_string(missing_fields, ', ');
  ELSE
    RAISE NOTICE '✅ Tous les champs de l''interface ActivitySession sont présents en BDD';
  END IF;

  RAISE NOTICE '✅ Cohérence activity_sessions terminée';
  RAISE NOTICE '✅ Trigger updated_at configuré';
END $$;