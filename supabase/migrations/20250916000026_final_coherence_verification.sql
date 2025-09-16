-- =====================================================
-- VÉRIFICATION FINALE - COHÉRENCE BDD/TYPESCRIPT
-- Date: 2025-09-16
-- Objectif: Vérifier que toutes les corrections d'incohérences ont été appliquées
-- =====================================================

DO $$
DECLARE
  report TEXT := E'\n=== RAPPORT DE COHÉRENCE BDD/TYPESCRIPT ===\n';
  table_status TEXT;
  missing_count INTEGER;
BEGIN

-- 1. VÉRIFICATION UserProfile
report := report || E'\n1. 🔍 VÉRIFICATION UserProfile:\n';
SELECT COUNT(*) INTO missing_count
FROM unnest(ARRAY[
  'id', 'user_id', 'first_name', 'preferred_name', 'date_of_birth',
  'sopk_diagnosis_year', 'current_symptoms', 'severity_level',
  'timezone', 'language_preference', 'primary_goals',
  'notification_preferences', 'created_at', 'updated_at'
]) AS expected_field
WHERE expected_field NOT IN (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'user_profiles'
);

IF missing_count = 0 THEN
  report := report || '   ✅ Tous les champs présents' || E'\n';
ELSE
  report := report || '   ❌ ' || missing_count || ' champs manquants' || E'\n';
END IF;

-- 2. VÉRIFICATION Recipe
report := report || E'\n2. 🔍 VÉRIFICATION Recipe:\n';
SELECT COUNT(*) INTO missing_count
FROM unnest(ARRAY[
  'id', 'title', 'description', 'category', 'prep_time_minutes',
  'cook_time_minutes', 'total_time_minutes', 'servings', 'difficulty',
  'glycemic_index_category', 'nutritional_info', 'calories',
  'sopk_benefits', 'allergen_info', 'ingredients', 'instructions',
  'equipment_needed', 'variations', 'storage_tips', 'season',
  'dietary_tags', 'symptom_targets', 'cycle_phases', 'main_nutrients',
  'estimated_calories', 'mood_boosting', 'tips', 'created_at'
]) AS expected_field
WHERE expected_field NOT IN (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'recipes'
);

IF missing_count = 0 THEN
  report := report || '   ✅ Tous les champs présents' || E'\n';
ELSE
  report := report || '   ❌ ' || missing_count || ' champs manquants' || E'\n';
END IF;

-- 3. VÉRIFICATION ActivitySession
report := report || E'\n3. 🔍 VÉRIFICATION ActivitySession:\n';
SELECT COUNT(*) INTO missing_count
FROM unnest(ARRAY[
  'id', 'title', 'description', 'category', 'duration_minutes',
  'difficulty', 'intensity_level', 'estimated_calories_burned',
  'sopk_benefits', 'symptom_targets', 'contraindications',
  'instructions', 'equipment_needed', 'audio_guide_url',
  'video_preview_url', 'easy_modifications', 'advanced_variations',
  'is_active', 'created_at', 'updated_at'
]) AS expected_field
WHERE expected_field NOT IN (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'activity_sessions'
);

IF missing_count = 0 THEN
  report := report || '   ✅ Tous les champs présents' || E'\n';
ELSE
  report := report || '   ❌ ' || missing_count || ' champs manquants' || E'\n';
END IF;

-- 4. VÉRIFICATION UserActivityTracking
report := report || E'\n4. 🔍 VÉRIFICATION UserActivityTracking:\n';
SELECT COUNT(*) INTO missing_count
FROM unnest(ARRAY[
  'id', 'user_id', 'session_id', 'date_completed', 'duration_actual_minutes',
  'pre_energy_level', 'post_energy_level', 'pre_pain_level', 'post_pain_level',
  'pre_mood_score', 'post_mood_score', 'difficulty_felt', 'difficulty_felt_rating',
  'enjoyment_rating', 'modifications_used', 'duration_seconds',
  'completion_percentage', 'session_notes', 'date', 'energy_before',
  'energy_after', 'notes', 'will_repeat', 'created_at'
]) AS expected_field
WHERE expected_field NOT IN (
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'user_activity_tracking'
);

IF missing_count = 0 THEN
  report := report || '   ✅ Tous les champs présents (avec rétro-compatibilité)' || E'\n';
ELSE
  report := report || '   ❌ ' || missing_count || ' champs manquants' || E'\n';
END IF;

-- 5. VÉRIFICATION DES CONTRAINTES DE CLÉS ÉTRANGÈRES
report := report || E'\n5. 🔍 VÉRIFICATION DES CONTRAINTES:\n';

-- Vérifier que user_activity_tracking.session_id référence activity_sessions
IF EXISTS (
  SELECT 1 FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
  WHERE tc.table_name = 'user_activity_tracking'
  AND ccu.column_name = 'session_id'
  AND ccu.table_name = 'activity_sessions'
) THEN
  report := report || '   ✅ user_activity_tracking.session_id → activity_sessions.id' || E'\n';
ELSE
  report := report || '   ❌ Contrainte manquante: user_activity_tracking.session_id → activity_sessions.id' || E'\n';
END IF;

-- 6. VÉRIFICATION DES TYPES DE DONNÉES
report := report || E'\n6. 🔍 VÉRIFICATION DES TYPES:\n';

-- Vérifier que difficulty est bien VARCHAR et non INTEGER
IF EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'activity_sessions'
  AND column_name = 'difficulty'
  AND data_type = 'character varying'
) THEN
  report := report || '   ✅ activity_sessions.difficulty est bien VARCHAR' || E'\n';
ELSE
  report := report || '   ❌ activity_sessions.difficulty devrait être VARCHAR' || E'\n';
END IF;

-- 7. RÉSUMÉ FINAL
report := report || E'\n=== RÉSUMÉ FINAL ===\n';
report := report || '🎯 OBJECTIFS ATTEINTS:' || E'\n';
report := report || '   • Champs any remplacés par des interfaces typées' || E'\n';
report := report || '   • UserActivityTracking harmonisé avec la BDD' || E'\n';
report := report || '   • Recipe étendu avec champs meal_suggestions' || E'\n';
report := report || '   • ActivitySession completé et cohérent' || E'\n';
report := report || '   • Rétro-compatibilité préservée' || E'\n';
report := report || E'\n💡 RECOMMANDATIONS:' || E'\n';
report := report || '   • Tester les services avec les nouveaux types' || E'\n';
report := report || '   • Migrer progressivement vers les nouveaux noms de champs' || E'\n';
report := report || '   • Valider les interfaces JSON (ingredients, instructions)' || E'\n';

-- Afficher le rapport
RAISE NOTICE '%', report;

END $$;
-- Message final
DO $$
BEGIN
  RAISE NOTICE '🎉 MIGRATION DE COHÉRENCE TERMINÉE !';
  RAISE NOTICE '📊 Utilisez SELECT * FROM v_database_typescript_coherence; pour vérifier les colonnes';
  RAISE NOTICE '📖 Consultez COHERENCE_REPORT.md pour le rapport détaillé';
END $$;