-- Migration pour corriger les politiques RLS mood_entries en développement
-- Créé le 13 décembre 2024

-- Supprimer les politiques existantes pour mood_entries
DROP POLICY IF EXISTS "Users can view own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can insert own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can update own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can delete own mood entries" ON mood_entries;

-- Créer des politiques plus permissives pour le développement
-- En production, ces politiques devront être resserrées

-- Permettre la lecture des données mood pour les utilisateurs authentifiés ou utilisateur de test
CREATE POLICY "Allow mood entries read" ON mood_entries
  FOR SELECT USING (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Permettre l'insertion pour les utilisateurs authentifiés ou pour l'utilisateur de test
CREATE POLICY "Allow mood entries insert" ON mood_entries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Permettre la modification pour les utilisateurs authentifiés ou pour l'utilisateur de test
CREATE POLICY "Allow mood entries update" ON mood_entries
  FOR UPDATE USING (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

-- Permettre la suppression pour les utilisateurs authentifiés ou pour l'utilisateur de test
CREATE POLICY "Allow mood entries delete" ON mood_entries
  FOR DELETE USING (
    auth.uid() IS NOT NULL OR
    user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

COMMENT ON POLICY "Allow mood entries read" ON mood_entries
  IS 'Politique de développement - permettre la lecture pour utilisateur de test';
COMMENT ON POLICY "Allow mood entries insert" ON mood_entries
  IS 'Politique de développement - permettre insertion pour utilisateur de test';
COMMENT ON POLICY "Allow mood entries update" ON mood_entries
  IS 'Politique de développement - permettre modification pour utilisateur de test';
COMMENT ON POLICY "Allow mood entries delete" ON mood_entries
  IS 'Politique de développement - permettre suppression pour utilisateur de test';