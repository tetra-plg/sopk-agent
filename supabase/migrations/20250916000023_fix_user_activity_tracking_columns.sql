-- =====================================================
-- CORRECTION user_activity_tracking - Harmonisation BDD/TypeScript
-- Date: 2025-09-16
-- Objectif: Appliquer les règles de cohérence pour user_activity_tracking
-- =====================================================

-- RÈGLE 1: Ajouter les colonnes manquantes en BDD (présentes dans les types TS)
ALTER TABLE user_activity_tracking
  ADD COLUMN IF NOT EXISTS enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  ADD COLUMN IF NOT EXISTS will_repeat BOOLEAN;

-- RÈGLE 2: Renommer date_completed vers date pour correspondre aux types TS
-- (Note: Gardons les deux pour compatibilité, mais utilisons date comme principale)
ALTER TABLE user_activity_tracking
  ADD COLUMN IF NOT EXISTS date DATE;

-- Migrer les données existantes
UPDATE user_activity_tracking
SET date = date_completed
WHERE date IS NULL AND date_completed IS NOT NULL;

-- RÈGLE 3: Ajouter les colonnes pour rétro-compatibilité avec les anciens noms TS
-- (Permet une migration progressive du code)
ALTER TABLE user_activity_tracking
  ADD COLUMN IF NOT EXISTS energy_before INTEGER CHECK (energy_before >= 1 AND energy_before <= 10),
  ADD COLUMN IF NOT EXISTS energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 10),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migrer les données vers les anciens noms pour compatibilité
UPDATE user_activity_tracking
SET
  energy_before = pre_energy_level,
  energy_after = post_energy_level,
  notes = session_notes
WHERE energy_before IS NULL;

-- RÈGLE 4: S'assurer que session_id référence la bonne table
-- Vérifier si la contrainte existe et la corriger si nécessaire
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte si elle référence activity_sessions_complete
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'user_activity_tracking'
    AND ccu.column_name = 'session_id'
    AND ccu.table_name = 'activity_sessions_complete'
  ) THEN
    ALTER TABLE user_activity_tracking
    DROP CONSTRAINT user_activity_tracking_session_id_fkey;

    RAISE NOTICE 'Ancienne contrainte vers activity_sessions_complete supprimée';
  END IF;

  -- Ajouter la nouvelle contrainte vers activity_sessions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'user_activity_tracking'
    AND ccu.column_name = 'session_id'
    AND ccu.table_name = 'activity_sessions'
  ) THEN
    ALTER TABLE user_activity_tracking
    ADD CONSTRAINT user_activity_tracking_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES activity_sessions(id);

    RAISE NOTICE 'Nouvelle contrainte vers activity_sessions ajoutée';
  END IF;
END $$;

-- Mettre à jour les commentaires
COMMENT ON COLUMN user_activity_tracking.date IS 'Date de la session (compatible TypeScript)';
COMMENT ON COLUMN user_activity_tracking.energy_before IS 'Niveau énergie avant (rétro-compatibilité TS)';
COMMENT ON COLUMN user_activity_tracking.energy_after IS 'Niveau énergie après (rétro-compatibilité TS)';
COMMENT ON COLUMN user_activity_tracking.notes IS 'Notes de session (rétro-compatibilité TS)';
COMMENT ON COLUMN user_activity_tracking.enjoyment_rating IS 'Note de satisfaction (1-5)';
COMMENT ON COLUMN user_activity_tracking.will_repeat IS 'Utilisateur souhaite refaire cette session';

-- Vérification finale
DO $$
BEGIN
  RAISE NOTICE '✅ Colonnes ajoutées: enjoyment_rating, will_repeat, date, energy_before/after, notes';
  RAISE NOTICE '✅ Contrainte session_id mise à jour vers activity_sessions';
  RAISE NOTICE '✅ Migration user_activity_tracking terminée';
END $$;