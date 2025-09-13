-- =====================================================
-- MIGRATION: Techniques de Respiration vers BDD
-- Migre les techniques hardcodées vers la table breathing_techniques
-- =====================================================

-- Insérer les techniques de respiration depuis le code hardcodé
INSERT INTO breathing_techniques (
  id, name, description, benefits, difficulty, duration_seconds,
  pattern, icon, color, sopk_benefits,
  is_active, display_order
) VALUES
-- Cohérence cardiaque (technique principale)
(
  'coherence',
  'Cohérence cardiaque',
  'Équilibre ton système nerveux avec cette technique scientifiquement prouvée. 5 secondes d''inspiration, 5 secondes d''expiration.',
  ARRAY['Réduit le cortisol', 'Équilibre hormonal', 'Apaise le stress'],
  'beginner',
  300, -- 5 minutes
  ARRAY[5, 0, 5, 0], -- [inhale, hold, exhale, pause]
  '🔵',
  '#4FC3F7',
  'Idéal pour réguler les hormones et réduire l''inflammation chronique associée au SOPK',
  true,
  1
),

-- Respiration 4-4-4-4 (Box Breathing)
(
  'box',
  'Respiration 4-4-4-4',
  'Technique du "carré parfait" utilisée par les forces spéciales pour améliorer la concentration et calmer l''esprit.',
  ARRAY['Améliore la concentration', 'Calme l''esprit', 'Réduit l''anxiété'],
  'intermediate',
  180, -- 3 minutes
  ARRAY[4, 4, 4, 4], -- [inhale, hold, exhale, pause]
  '⏹️',
  '#81C784',
  'Parfait pour gérer l''anxiété et les sautes d''humeur liées aux déséquilibres hormonaux du SOPK',
  true,
  2
),

-- Technique rapide (4-7-8 adapté)
(
  'quick',
  'Technique rapide',
  'Solution anti-stress express en 2 minutes. Basée sur la technique 4-7-8 adaptée pour un soulagement immédiat.',
  ARRAY['Soulagement immédiat', 'Détente rapide', 'Calme instantané'],
  'beginner',
  120, -- 2 minutes
  ARRAY[4, 2, 6, 1], -- [inhale, hold, exhale, pause]
  '⚡',
  '#FFB74D',
  'Solution rapide pour les pics de stress hormonal et les moments d''anxiété intense',
  true,
  3
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  difficulty = EXCLUDED.difficulty,
  duration_seconds = EXCLUDED.duration_seconds,
  pattern = EXCLUDED.pattern,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sopk_benefits = EXCLUDED.sopk_benefits,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Vérifier que les données ont été insérées
DO $$
DECLARE
  technique_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO technique_count FROM breathing_techniques WHERE is_active = true;

  IF technique_count >= 3 THEN
    RAISE NOTICE '✅ Migration techniques respiration réussie: % techniques actives', technique_count;
  ELSE
    RAISE EXCEPTION 'Erreur migration: seulement % techniques trouvées', technique_count;
  END IF;
END $$;

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE breathing_techniques IS 'Techniques de respiration pour la gestion du stress SOPK - migré depuis le code hardcodé';
COMMENT ON COLUMN breathing_techniques.pattern IS 'Pattern de respiration: [inhale, hold, exhale, pause] en secondes';
COMMENT ON COLUMN breathing_techniques.sopk_benefits IS 'Bénéfices spécifiques au SOPK de cette technique';

-- Message de fin
DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION BREATHING TECHNIQUES COMPLETÉE ===';
  RAISE NOTICE 'Techniques de respiration migrées du code vers BDD:';
  RAISE NOTICE '✅ coherence - Cohérence cardiaque (5 min)';
  RAISE NOTICE '✅ box - Respiration 4-4-4-4 (3 min)';
  RAISE NOTICE '✅ quick - Technique rapide (2 min)';
  RAISE NOTICE '';
  RAISE NOTICE 'Prochaines étapes:';
  RAISE NOTICE '1. Mettre à jour les composants pour utiliser breathingTechniquesService';
  RAISE NOTICE '2. Supprimer le fichier breathingTechniques.js (code hardcodé)';
  RAISE NOTICE '3. Tester les fonctionnalités de respiration';
  RAISE NOTICE '======================================================';
END $$;