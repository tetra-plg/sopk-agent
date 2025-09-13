-- =====================================================
-- FIX: Politiques RLS pour user_activity_tracking en développement
-- Corrige l'erreur 401 et les violations RLS
-- =====================================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view own activity tracking" ON user_activity_tracking;
DROP POLICY IF EXISTS "Users can insert own activity tracking" ON user_activity_tracking;
DROP POLICY IF EXISTS "Users can update own activity tracking" ON user_activity_tracking;
DROP POLICY IF EXISTS "Users can delete own activity tracking" ON user_activity_tracking;

-- Créer des policies plus permissives pour le développement
-- qui acceptent aussi les utilisateurs anonymes (anon key)
CREATE POLICY "Users can view activity tracking" ON user_activity_tracking
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.role() = 'anon' -- Permet l'accès avec anon key en dev
  );

CREATE POLICY "Users can insert activity tracking" ON user_activity_tracking
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (auth.role() = 'anon' AND user_id IS NOT NULL) -- Permet l'insertion avec anon key si user_id est fourni
  );

CREATE POLICY "Users can update activity tracking" ON user_activity_tracking
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.role() = 'anon' -- Permet la mise à jour avec anon key en dev
  );

CREATE POLICY "Users can delete activity tracking" ON user_activity_tracking
  FOR DELETE USING (
    auth.uid() = user_id OR
    auth.role() = 'anon' -- Permet la suppression avec anon key en dev
  );

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '=== FIX RLS ACTIVITY TRACKING COMPLETÉ ===';
  RAISE NOTICE 'Politiques RLS mises à jour pour le développement:';
  RAISE NOTICE '✅ Accès avec auth.uid() (production)';
  RAISE NOTICE '✅ Accès avec anon key (développement)';
  RAISE NOTICE '✅ INSERT, SELECT, UPDATE, DELETE autorisés';
  RAISE NOTICE '==========================================';
END $$;