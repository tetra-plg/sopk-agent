-- =====================================================
-- SCRIPT DE VÉRIFICATION - COHÉRENCE BDD/TYPESCRIPT
-- =====================================================
-- Vérifie que la structure de la base de données correspond
-- exactement aux interfaces TypeScript définies

-- Vue de cohérence pour monitoring continu
CREATE OR REPLACE VIEW v_database_typescript_coherence AS
SELECT
  'user_profiles' as table_name,
  ARRAY[
    'id', 'user_id', 'first_name', 'preferred_name', 'date_of_birth',
    'sopk_diagnosis_year', 'current_symptoms', 'severity_level',
    'timezone', 'language_preference', 'primary_goals',
    'notification_preferences', 'created_at', 'updated_at'
  ] as expected_columns,
  ARRAY_AGG(column_name ORDER BY ordinal_position) as actual_columns
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND table_schema = 'public'

UNION ALL

SELECT
  'daily_symptoms' as table_name,
  ARRAY[
    'id', 'user_id', 'date', 'period_flow', 'fatigue_level', 'pain_level',
    'mood_score', 'mood_emoji', 'notes', 'created_at', 'updated_at'
  ] as expected_columns,
  ARRAY_AGG(column_name ORDER BY ordinal_position) as actual_columns
FROM information_schema.columns
WHERE table_name = 'daily_symptoms' AND table_schema = 'public'

UNION ALL

SELECT
  'recipes' as table_name,
  ARRAY[
    'id', 'title', 'description', 'category', 'prep_time_minutes',
    'cook_time_minutes', 'total_time_minutes', 'servings', 'difficulty',
    'glycemic_index_category', 'nutritional_info', 'calories',
    'sopk_benefits', 'allergen_info', 'ingredients', 'instructions',
    'equipment_needed', 'variations', 'storage_tips', 'season',
    'dietary_tags', 'symptom_targets', 'cycle_phases', 'main_nutrients',
    'estimated_calories', 'mood_boosting', 'tips', 'created_at'
  ] as expected_columns,
  ARRAY_AGG(column_name ORDER BY ordinal_position) as actual_columns
FROM information_schema.columns
WHERE table_name = 'recipes' AND table_schema = 'public'

UNION ALL

SELECT
  'user_recipe_tracking' as table_name,
  ARRAY[
    'id', 'user_id', 'recipe_id', 'date_cooked', 'servings_made',
    'difficulty_rating', 'taste_rating', 'would_make_again', 'meal_type',
    'preparation_time_actual', 'notes', 'created_at'
  ] as expected_columns,
  ARRAY_AGG(column_name ORDER BY ordinal_position) as actual_columns
FROM information_schema.columns
WHERE table_name = 'user_recipe_tracking' AND table_schema = 'public'

UNION ALL

SELECT
  'activity_sessions' as table_name,
  ARRAY[
    'id', 'title', 'description', 'category', 'duration_minutes', 'difficulty',
    'intensity_level', 'estimated_calories_burned', 'sopk_benefits',
    'symptom_targets', 'contraindications', 'instructions', 'equipment_needed',
    'audio_guide_url', 'video_preview_url', 'easy_modifications',
    'advanced_variations', 'is_active', 'created_at', 'updated_at'
  ] as expected_columns,
  ARRAY_AGG(column_name ORDER BY ordinal_position) as actual_columns
FROM information_schema.columns
WHERE table_name = 'activity_sessions' AND table_schema = 'public'

UNION ALL

SELECT
  'user_activity_tracking' as table_name,
  ARRAY[
    'id', 'user_id', 'session_id', 'date_completed', 'duration_actual_minutes',
    'pre_energy_level', 'post_energy_level', 'pre_pain_level', 'post_pain_level',
    'pre_mood_score', 'post_mood_score', 'difficulty_felt', 'difficulty_felt_rating',
    'enjoyment_rating', 'modifications_used', 'duration_seconds',
    'completion_percentage', 'session_notes', 'created_at'
  ] as expected_columns,
  ARRAY_AGG(column_name ORDER BY ordinal_position) as actual_columns
FROM information_schema.columns
WHERE table_name = 'user_activity_tracking' AND table_schema = 'public'

GROUP BY table_name, expected_columns;

-- Fonction pour comparer les colonnes
CREATE OR REPLACE FUNCTION check_table_coherence()
RETURNS TABLE (
  table_name text,
  status text,
  missing_columns text[],
  extra_columns text[],
  column_count_expected integer,
  column_count_actual integer
) AS $$
BEGIN
  RETURN QUERY
  WITH coherence_check AS (
    SELECT
      v.table_name,
      v.expected_columns,
      v.actual_columns,
      -- Colonnes manquantes (dans expected mais pas dans actual)
      ARRAY(
        SELECT unnest(v.expected_columns)
        EXCEPT
        SELECT unnest(v.actual_columns)
      ) as missing_cols,
      -- Colonnes supplémentaires (dans actual mais pas dans expected)
      ARRAY(
        SELECT unnest(v.actual_columns)
        EXCEPT
        SELECT unnest(v.expected_columns)
      ) as extra_cols,
      array_length(v.expected_columns, 1) as expected_count,
      array_length(v.actual_columns, 1) as actual_count
    FROM v_database_typescript_coherence v
  )
  SELECT
    cc.table_name::text,
    CASE
      WHEN array_length(cc.missing_cols, 1) = 0 AND array_length(cc.extra_cols, 1) = 0
      THEN '✅ COHÉRENT'
      ELSE '❌ INCOHÉRENT'
    END as status,
    COALESCE(cc.missing_cols, '{}') as missing_columns,
    COALESCE(cc.extra_cols, '{}') as extra_columns,
    cc.expected_count,
    cc.actual_count
  FROM coherence_check cc
  ORDER BY
    CASE WHEN array_length(cc.missing_cols, 1) = 0 AND array_length(cc.extra_cols, 1) = 0 THEN 1 ELSE 0 END,
    cc.table_name;
END;
$$ LANGUAGE plpgsql;

-- Exécution du rapport de cohérence
SELECT * FROM check_table_coherence();