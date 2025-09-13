-- Migration pour corriger les politiques RLS en développement
-- Créé le 13 décembre 2024

-- Supprimer les politiques existantes pour user_activity_tracking
DROP POLICY IF EXISTS "Users can view own activity tracking" ON user_activity_tracking;
DROP POLICY IF EXISTS "Users can insert own activity tracking" ON user_activity_tracking;
DROP POLICY IF EXISTS "Users can update own activity tracking" ON user_activity_tracking;
DROP POLICY IF EXISTS "Users can delete own activity tracking" ON user_activity_tracking;

-- Créer des politiques plus permissives pour le développement
-- En production, ces politiques devront être resserrées

-- Permettre la lecture des données d'activité pour les utilisateurs authentifiés ou non
CREATE POLICY "Allow activity tracking read" ON user_activity_tracking
  FOR SELECT USING (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Permettre l'insertion pour les utilisateurs authentifiés ou pour l'utilisateur de test
CREATE POLICY "Allow activity tracking insert" ON user_activity_tracking
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Permettre la modification pour les utilisateurs authentifiés ou pour l'utilisateur de test
CREATE POLICY "Allow activity tracking update" ON user_activity_tracking
  FOR UPDATE USING (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Permettre la suppression pour les utilisateurs authentifiés ou pour l'utilisateur de test
CREATE POLICY "Allow activity tracking delete" ON user_activity_tracking
  FOR DELETE USING (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

COMMENT ON POLICY "Allow activity tracking read" ON user_activity_tracking
  IS 'Politique de développement - permettre la lecture pour utilisateur de test';
COMMENT ON POLICY "Allow activity tracking insert" ON user_activity_tracking
  IS 'Politique de développement - permettre insertion pour utilisateur de test';
COMMENT ON POLICY "Allow activity tracking update" ON user_activity_tracking
  IS 'Politique de développement - permettre modification pour utilisateur de test';
COMMENT ON POLICY "Allow activity tracking delete" ON user_activity_tracking
  IS 'Politique de développement - permettre suppression pour utilisateur de test';