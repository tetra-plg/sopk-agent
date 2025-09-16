-- =====================================================
-- SCRIPT DE VÉRIFICATION FINALE - COHÉRENCE BDD/TYPESCRIPT
-- Date: 2025-09-16
-- Usage: Exécuter après toutes les migrations pour vérifier la cohérence
-- =====================================================

\echo '\n=== VERIFICATION COHERENCE BDD/TYPESCRIPT ==='

-- 1. Vérifier la présence des tables principales
\echo '\n1. 🗄️  TABLES PRINCIPALES:'
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles')
    THEN '✅ user_profiles'
    ELSE '❌ user_profiles manquante'
  END AS status
UNION ALL
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipes')
    THEN '✅ recipes'
    ELSE '❌ recipes manquante'
  END
UNION ALL
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_sessions')
    THEN '✅ activity_sessions'
    ELSE '❌ activity_sessions manquante'
  END
UNION ALL
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activity_tracking')
    THEN '✅ user_activity_tracking'
    ELSE '❌ user_activity_tracking manquante'
  END
UNION ALL
SELECT
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'breathing_techniques')
    THEN '✅ breathing_techniques'
    ELSE '❌ breathing_techniques manquante'
  END;

-- 2. Vérifier les champs critiques ajoutés
\echo '\n2. 🔧 CHAMPS AJOUTÉS - RECIPES:'
SELECT
  column_name,
  data_type,
  CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable
FROM information_schema.columns
WHERE table_name = 'recipes'
AND column_name IN ('symptom_targets', 'cycle_phases', 'main_nutrients', 'estimated_calories', 'mood_boosting', 'tips')
ORDER BY column_name;

\echo '\n3. 🔧 CHAMPS AJOUTÉS - ACTIVITY_SESSIONS:'
SELECT
  column_name,
  data_type,
  CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable
FROM information_schema.columns
WHERE table_name = 'activity_sessions'
AND column_name IN ('estimated_calories_burned', 'is_active', 'updated_at')
ORDER BY column_name;

\echo '\n4. 🔧 CHAMPS AJOUTÉS - USER_ACTIVITY_TRACKING:'
SELECT
  column_name,
  data_type,
  CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END as nullable
FROM information_schema.columns
WHERE table_name = 'user_activity_tracking'
AND column_name IN ('enjoyment_rating', 'will_repeat', 'date', 'energy_before', 'energy_after', 'notes')
ORDER BY column_name;

-- 3. Vérifier les contraintes de clés étrangères
\echo '\n5. 🔗 CONTRAINTES DE CLÉS ÉTRANGÈRES:'
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'user_activity_tracking'
AND kcu.column_name = 'session_id';

-- 4. Vérifier les index créés
\echo '\n6. 📊 INDEX CRÉÉS:'
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename IN ('recipes', 'activity_sessions', 'user_activity_tracking')
AND indexname LIKE '%symptom%' OR indexname LIKE '%cycle%' OR indexname LIKE '%active%'
ORDER BY tablename, indexname;

-- 5. Compter les enregistrements dans chaque table
\echo '\n7. 📈 STATISTIQUES DES TABLES:'
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'recipes' as table_name, COUNT(*) as record_count FROM recipes
UNION ALL
SELECT 'activity_sessions' as table_name, COUNT(*) as record_count FROM activity_sessions
UNION ALL
SELECT 'user_activity_tracking' as table_name, COUNT(*) as record_count FROM user_activity_tracking
UNION ALL
SELECT 'breathing_techniques' as table_name, COUNT(*) as record_count FROM breathing_techniques
ORDER BY table_name;

-- 6. Tester les champs JSON (si des données existent)
\echo '\n8. 🧪 TEST DES CHAMPS JSON:'
DO $$
DECLARE
  recipe_count INTEGER;
  activity_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recipe_count FROM recipes WHERE ingredients IS NOT NULL AND instructions IS NOT NULL;
  SELECT COUNT(*) INTO activity_count FROM activity_sessions WHERE instructions IS NOT NULL;

  RAISE NOTICE 'Recettes avec ingredients/instructions JSON: %', recipe_count;
  RAISE NOTICE 'Sessions d''activité avec instructions JSON: %', activity_count;
END $$;

-- 7. Vérifier la vue de cohérence
\echo '\n9. 📋 VUE DE COHERENCE:'
SELECT
  table_name,
  array_length(columns_present, 1) as column_count
FROM v_database_typescript_coherence
ORDER BY table_name;

-- 8. Résumé final
\echo '\n=== RÉSUMÉ FINAL ==='
DO $$
DECLARE
  total_tables INTEGER;
  total_columns INTEGER;
  coherence_score DECIMAL;
BEGIN
  SELECT COUNT(*) INTO total_tables
  FROM information_schema.tables
  WHERE table_name IN ('user_profiles', 'recipes', 'activity_sessions', 'user_activity_tracking', 'breathing_techniques');

  SELECT SUM(array_length(columns_present, 1)) INTO total_columns
  FROM v_database_typescript_coherence;

  coherence_score := (total_tables * 100.0) / 5.0; -- 5 tables principales attendues

  RAISE NOTICE '';
  RAISE NOTICE '📊 STATISTIQUES FINALES:';
  RAISE NOTICE '   Tables principales trouvées: %/5', total_tables;
  RAISE NOTICE '   Colonnes totales: %', total_columns;
  RAISE NOTICE '   Score de cohérence: %% %%', ROUND(coherence_score, 1);
  RAISE NOTICE '';

  IF coherence_score = 100.0 THEN
    RAISE NOTICE '🎉 COHÉRENCE PARFAITE ! Tous les types TypeScript correspondent à la BDD.';
  ELSIF coherence_score >= 80.0 THEN
    RAISE NOTICE '✅ BONNE COHÉRENCE ! Quelques ajustements mineurs peuvent être nécessaires.';
  ELSE
    RAISE NOTICE '⚠️  COHÉRENCE À AMÉLIORER. Vérifiez les migrations manquantes.';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '📖 Pour plus de détails, consultez COHERENCE_FIXES_REPORT.md';
END $$;

\echo '\n=== FIN DE LA VÉRIFICATION ==='