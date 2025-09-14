-- =====================================================
-- SEED DONNÉES DE DÉVELOPPEMENT - SOPK Agent
-- ⚠️  UNIQUEMENT POUR L'ENVIRONNEMENT DE DÉVELOPPEMENT
-- =====================================================

-- =====================================================
-- 👥 UTILISATEURS FAKE POUR DÉVELOPPEMENT
-- =====================================================

-- NOTE: Le hash utilisé est pour "password123" généré avec bcrypt
-- Hash correct: $2a$10$PNgTWkCo3fLwJM8YqT0bKORM/zL.ZmXBV.2bTVJvSfVXQ0Ix1LFXS

-- Créer plusieurs utilisateurs de test pour simuler différents profils
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
-- Utilisateur 1 : Sarah (profil actif, nombreuses données)
(
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440000',
  'authenticated',
  'authenticated',
  'sarah.dev@sopk-companion.com',
  crypt('password123', gen_salt('bf')), -- Génère le hash correct pour password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Sarah Martin", "first_name": "Sarah", "email": "sarah.dev@sopk-companion.com", "email_verified": true, "phone_verified": false}',
  '', '', '', ''
),
-- Utilisateur 2 : Emma (nouveau profil, peu de données)
(
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440001',
  'authenticated',
  'authenticated',
  'emma.dev@sopk-companion.com',
  crypt('password123', gen_salt('bf')), -- Génère le hash correct pour password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Emma Dubois", "first_name": "Emma", "email": "emma.dev@sopk-companion.com", "email_verified": true, "phone_verified": false}',
  '', '', '', ''
),
-- Utilisateur 3 : Claire (profil expérimenté)
(
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440002',
  'authenticated',
  'authenticated',
  'claire.dev@sopk-companion.com',
  crypt('password123', gen_salt('bf')), -- Génère le hash correct pour password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Claire Moreau", "first_name": "Claire", "email": "claire.dev@sopk-companion.com", "email_verified": true, "phone_verified": false}',
  '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Créer les identités pour ces utilisateurs
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000',
 '{"sub": "550e8400-e29b-41d4-a716-446655440000", "email": "sarah.dev@sopk-companion.com", "email_verified": true}',
 'email', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
 '{"sub": "550e8400-e29b-41d4-a716-446655440001", "email": "emma.dev@sopk-companion.com", "email_verified": true}',
 'email', NOW(), NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
 '{"sub": "550e8400-e29b-41d4-a716-446655440002", "email": "claire.dev@sopk-companion.com", "email_verified": true}',
 'email', NOW(), NOW(), NOW())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- =====================================================
-- 👤 PROFILS UTILISATEURS DÉTAILLÉS
-- =====================================================

INSERT INTO user_profiles (
  user_id, first_name, preferred_name, date_of_birth,
  sopk_diagnosis_year, current_symptoms, severity_level,
  primary_goals
) VALUES
-- Sarah : Profil actif avec SOPK modéré
('550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Sarah', '1992-06-15',
 2020, ARRAY['irregular_cycles', 'fatigue', 'mood_swings', 'weight_gain'],
 'moderate', ARRAY['symptom_management', 'stress_reduction']),

-- Emma : Récemment diagnostiquée
('550e8400-e29b-41d4-a716-446655440001', 'Emma', 'Emma', '1995-03-22',
 2024, ARRAY['acne', 'irregular_cycles'], 'mild',
 ARRAY['understanding_condition', 'lifestyle_changes']),

-- Claire : Expérience longue avec SOPK
('550e8400-e29b-41d4-a716-446655440002', 'Claire', 'Claire', '1988-11-08',
 2015, ARRAY['insulin_resistance', 'hirsutism', 'anxiety'],
 'moderate', ARRAY['weight_management', 'hormonal_balance']);

-- =====================================================
-- 📝 DONNÉES JOURNAL QUOTIDIEN (SYMPTÔMES)
-- =====================================================

-- Sarah : Données sur 2 semaines (utilisatrice active)
INSERT INTO daily_symptoms (
  user_id, date, period_flow, fatigue_level, pain_level, notes
) VALUES
-- Semaine dernière
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '14 days', 0, 3, 2, 'Journée plutôt calme, légère fatigue après-midi'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '13 days', 0, 4, 3, 'Un peu plus fatiguée, petites douleurs ventre'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '12 days', 1, 3, 4, 'Début des règles, crampes modérées'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '11 days', 3, 4, 4, 'Flux important, mal au dos'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '10 days', 2, 2, 2, 'Flux diminue, me sens mieux'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '9 days', 1, 2, 1, 'Fin des règles, énergie revient'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '8 days', 0, 1, 1, 'Super journée ! Pleine énergie'),

-- Cette semaine
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '7 days', 0, 2, 1, 'Semaine qui commence bien'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '6 days', 0, 3, 2, 'Un peu fatiguée au boulot'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '5 days', 0, 2, 1, 'Yoga hier soir, ça m''a fait du bien'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '4 days', 0, 3, 2, 'Nuit courte, un peu irritable'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '3 days', 0, 2, 2, 'Weekend repos'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '2 days', 0, 2, 1, 'Bonne journée, sortie avec amies'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '1 day', 0, 3, 3, 'SPM qui arrive ?');

-- Emma : Données éparses (nouvelle utilisatrice)
INSERT INTO daily_symptoms (
  user_id, date, period_flow, fatigue_level, pain_level, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '3 days', 0, 2, 1, 'Première fois que j''utilise l''app'),
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 0, 3, 2, 'Un peu plus fatiguée que d''habitude');

-- Claire : Données régulières mais récentes
INSERT INTO daily_symptoms (
  user_id, date, period_flow, fatigue_level, pain_level, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '7 days', 2, 4, 3, 'Règles douloureuses comme toujours'),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '6 days', 3, 3, 3, 'Gestion de la douleur avec respiration'),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '5 days', 1, 3, 2, 'Mieux avec les étirements'),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '2 days', 0, 2, 1, 'Retour à la normale');

-- =====================================================
-- 🧘 SESSIONS DE RESPIRATION
-- =====================================================

-- Sarah : Utilisatrice régulière des exercices de respiration
INSERT INTO breathing_sessions (
  user_id, technique, duration_seconds, completed,
  stress_before, stress_after, feeling_after, created_at
) VALUES
-- Sessions de cette semaine
('550e8400-e29b-41d4-a716-446655440000', 'coherence', 300, true, 8, 4, 'calmer', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440000', 'quick', 180, true, 6, 3, 'better', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'box', 240, true, 7, 3, 'relaxed', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440000', 'coherence', 360, true, 9, 5, 'much_better', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'box', 180, false, 5, NULL, NULL, NOW() - INTERVAL '1 day'),

-- Sessions semaine dernière
('550e8400-e29b-41d4-a716-446655440000', 'coherence', 300, true, 8, 4, 'calmer', NOW() - INTERVAL '12 days'),
('550e8400-e29b-41d4-a716-446655440000', 'quick', 120, true, 6, 2, 'better', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440000', 'coherence', 300, true, 7, 3, 'relaxed', NOW() - INTERVAL '8 days');

-- Claire : Quelques sessions récentes
INSERT INTO breathing_sessions (
  user_id, technique, duration_seconds, completed,
  stress_before, stress_after, feeling_after, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'coherence', 300, true, 9, 6, 'slightly_better', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440002', 'box', 240, true, 8, 4, 'calmer', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440002', 'coherence', 360, true, 7, 3, 'much_better', NOW() - INTERVAL '1 day');

-- Emma : Juste découvert (peu de sessions)
INSERT INTO breathing_sessions (
  user_id, technique, duration_seconds, completed,
  stress_before, stress_after, feeling_after, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'quick', 180, true, 6, 4, 'better', NOW() - INTERVAL '2 days');

-- =====================================================
-- 😊 JOURNAL D'HUMEUR
-- =====================================================

-- Sarah : Suivi régulier de l'humeur
INSERT INTO mood_entries (
  user_id, date, mood_emoji, mood_score, mood_tags, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '7 days', '😊', 7, ARRAY['energetic', 'optimistic'], 'Bon début de semaine'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '6 days', '😐', 5, ARRAY['tired', 'neutral'], 'Journée normale'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '5 days', '😌', 8, ARRAY['calm', 'content'], 'Yoga m''a apaisée'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '4 days', '😤', 3, ARRAY['irritated', 'stressed'], 'SPM qui commence...'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '3 days', '😴', 4, ARRAY['tired', 'low_energy'], 'Envie de rien faire'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '2 days', '🙂', 6, ARRAY['content', 'social'], 'Sortie entre copines !'),
('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '1 day', '😕', 4, ARRAY['anxious', 'uncomfortable'], 'Un peu stressée pour demain');

-- Claire : Suivi d'humeur avec focus gestion SOPK
INSERT INTO mood_entries (
  user_id, date, mood_emoji, mood_score, mood_tags, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '6 days', '😣', 3, ARRAY['pain', 'frustrated'], 'Règles douloureuses'),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '5 days', '😌', 6, ARRAY['calm', 'hopeful'], 'Respiration m''a aidée'),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '2 days', '😊', 7, ARRAY['energetic', 'positive'], 'Me sens beaucoup mieux');

-- =====================================================
-- 🍽️ TRACKING NUTRITION
-- =====================================================

-- Préférences nutritionnelles
INSERT INTO user_nutrition_preferences (
  user_id, dietary_restrictions, preferred_meal_complexity,
  max_prep_time_minutes, primary_nutrition_goals
) VALUES
-- Sarah : Végétarienne, cuisine simple
('550e8400-e29b-41d4-a716-446655440000',
 ARRAY['vegetarian'], 'easy', 25,
 ARRAY['energy_boost', 'inflammation_reduction']),

-- Emma : Aucune restriction, débutante
('550e8400-e29b-41d4-a716-446655440001',
 ARRAY['none']::text[], 'very_easy', 15,
 ARRAY['weight_management']),

-- Claire : Expérimentée, focus hormonal
('550e8400-e29b-41d4-a716-446655440002',
 ARRAY['gluten_free'], 'medium', 45,
 ARRAY['hormonal_balance', 'insulin_regulation']);

-- Tracking des repas consommés
INSERT INTO user_meal_tracking (
  user_id, meal_id, date, meal_type,
  satisfaction_rating, will_remake
) VALUES
-- Sarah a testé plusieurs suggestions
('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM meal_suggestions WHERE name = 'Bowl Quinoa-Avocat Protéiné' LIMIT 1),
 CURRENT_DATE - INTERVAL '3 days', 'lunch', 5, true),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM meal_suggestions WHERE name = 'Omelette aux Épinards' LIMIT 1),
 CURRENT_DATE - INTERVAL '2 days', 'breakfast', 4, true),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM meal_suggestions WHERE name = 'Smoothie Vert Protéiné' LIMIT 1),
 CURRENT_DATE - INTERVAL '1 day', 'snack', 5, true);

-- =====================================================
-- 📚 RECETTES SOPK-FRIENDLY
-- =====================================================

-- Note: Les recettes détaillées avec toutes les colonnes sont insérées plus bas dans ce fichier
-- Cette section était obsolète et a été supprimée pour éviter les conflits de schéma

-- =====================================================
-- 🍽️ SUGGESTIONS DE REPAS (DONNÉES COMPLÉMENTAIRES)
-- =====================================================

-- Ajouter plus de suggestions de repas pour enrichir les données
INSERT INTO meal_suggestions (
  name, category, difficulty, prep_time_minutes,
  glycemic_index_category, main_nutrients, estimated_calories,
  sopk_benefits, symptom_targets, cycle_phases,
  ingredients_simple, preparation_steps, tips,
  season, dietary_restrictions, mood_boosting
) VALUES
-- Compléter avec plus de variété
('Toast Avocat Complet',
 'breakfast', 'very_easy', 5,
 'low', ARRAY['healthy_fats', 'fiber'], 280,
 ARRAY['sustained_energy'], ARRAY['fatigue', 'cravings'], ARRAY['any'],
 'Pain complet (2 tranches), avocat (1), citron, sel, poivre',
 '1. Griller le pain\n2. Écraser l''avocat avec citron\n3. Étaler et assaisonner',
 'Parfait quand on n''a pas le temps !',
 ARRAY['spring', 'summer', 'autumn', 'winter'], ARRAY['vegetarian'], true),

('Soupe Lentilles Épices',
 'lunch', 'easy', 20,
 'low', ARRAY['protein', 'fiber'], 320,
 ARRAY['inflammation_reduction'], ARRAY['digestive_issues', 'period_pain'], ARRAY['any'],
 'Lentilles corail (100g), légumes variés, épices douces, lait de coco',
 '1. Faire revenir légumes\n2. Ajouter lentilles et épices\n3. Mijoter 15 min',
 'Les épices douces apaisent l''inflammation',
 ARRAY['autumn', 'winter'], ARRAY['vegan'], true),

('Collation Amandes-Dattes',
 'snack', 'very_easy', 2,
 'low', ARRAY['healthy_fats', 'natural_sugars'], 180,
 ARRAY['energy_boost'], ARRAY['cravings', 'fatigue'], ARRAY['any'],
 'Amandes (15), dattes Medjool (2), cannelle',
 '1. Ouvrir les dattes\n2. Farcir avec amandes\n3. Saupoudrer cannelle',
 'Alternative saine aux sucreries',
 ARRAY['spring', 'summer', 'autumn', 'winter'], ARRAY['vegan'], true);

-- =====================================================
-- 🏃 SESSIONS D'ACTIVITÉ COMPLÈTES (avec nouvelles colonnes)
-- =====================================================

-- Sessions d'activité complètes pour l'application SOPK
INSERT INTO activity_sessions_complete (
  title, description, category, duration_minutes, instructions,
  is_active, difficulty, difficulty_level, thumbnail_url, sopk_symptoms
) VALUES
-- YOGA & MINDFULNESS
('Yoga Flow Débutant SOPK',
 'Flow doux spécialement adapté pour les débutantes avec SOPK, focus sur la détente hormonale',
 'yoga', 15,
 JSONB_BUILD_ARRAY(
   'Respiration consciente en position assise - 3 min',
   'Salutation au soleil modifiée x3 - 5 min',
   'Postures d''ouverture des hanches - 4 min',
   'Relaxation finale - 3 min'
 ),
 true, 'beginner', 1, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
 ARRAY['stress', 'anxiety', 'hormonal_imbalance']),

('Yoga Restaurateur SOPK',
 'Séance de yoga doux spécialement conçue pour apaiser les symptômes SOPK et réguler le système nerveux',
 'yoga', 25,
 JSONB_BUILD_ARRAY(
   'Commencer en position allongée, respiration profonde 2 min',
   'Posture de l''enfant modifiée avec coussin - 3 min',
   'Torsions douces allongées - 2x2 min chaque côté',
   'Jambes contre le mur - 5 min',
   'Position du cadavre avec focus sur relâchement hormonal - 10 min'
 ),
 true, 'beginner', 1, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
 ARRAY['stress', 'hormonal_imbalance', 'anxiety', 'sleep_issues']),

('Yoga Flow Intermédiaire',
 'Enchaînements fluides pour renforcer le corps et apaiser l''esprit',
 'yoga', 30,
 JSONB_BUILD_ARRAY(
   'Échauffement et centrage - 5 min',
   'Vinyasa flow x5 séries - 15 min',
   'Postures d''équilibre - 5 min',
   'Savasana - 5 min'
 ),
 true, 'medium', 3, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
 ARRAY['stress', 'muscle_tension', 'mood_swings']),

-- CARDIO LÉGER
('Marche Consciente Anti-Stress',
 'Marche guidée avec techniques de respiration pour réduire le cortisol',
 'cardio', 20,
 JSONB_BUILD_ARRAY(
   'Échauffement articulaire sur place - 3 min',
   'Marche rythmée avec respiration 4-7-8 - 12 min',
   'Étirements et relaxation debout - 5 min'
 ),
 true, 'easy', 2, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
 ARRAY['stress', 'anxiety', 'fatigue', 'mood_swings']),

('Cardio Doux SOPK',
 'Exercices cardiovasculaires adaptés pour améliorer la circulation sans stress excessif',
 'cardio', 25,
 JSONB_BUILD_ARRAY(
   'Échauffement dynamique - 5 min',
   'Alternance marche rapide/normale - 15 min',
   'Récupération avec respiration - 5 min'
 ),
 true, 'easy', 2, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
 ARRAY['insulin_resistance', 'fatigue', 'weight_management']),

-- RENFORCEMENT
('Circuit Résistance à l''Insuline',
 'Entraînement par intervalles conçu pour améliorer la sensibilité à l''insuline',
 'strength', 20,
 JSONB_BUILD_ARRAY(
   'Échauffement dynamique - 3 min',
   '4 rounds de: Squats (45s), repos (15s), Pompes adaptées (45s), repos (15s)',
   '3 rounds de: Fentes (30s), repos (30s), Planche (30s), repos (30s)',
   'Retour au calme avec étirements - 3 min'
 ),
 true, 'medium', 3, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop',
 ARRAY['insulin_resistance', 'weight_management', 'metabolic_health']),

('Renforcement Core SOPK',
 'Exercices spécifiques pour renforcer le centre du corps et améliorer la posture',
 'strength', 15,
 JSONB_BUILD_ARRAY(
   'Activation du plancher pelvien - 3 min',
   'Série gainage dynamique - 8 min',
   'Étirements du dos et abdominaux - 4 min'
 ),
 true, 'easy', 2, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop',
 ARRAY['abdominal_discomfort', 'posture_issues', 'pelvic_pain']),

-- MOBILITÉ & ÉTIREMENTS
('Mobilité Bassin et Hanches',
 'Séquence douce pour libérer les tensions du bassin, zone clé pour les femmes avec SOPK',
 'flexibility', 18,
 JSONB_BUILD_ARRAY(
   'Échauffement articulaire - 3 min',
   'Étirements progressifs des hanches - 8 min',
   'Mobilisation du bassin - 5 min',
   'Relaxation finale - 2 min'
 ),
 true, 'beginner', 1, 'https://images.unsplash.com/photo-1506629905138-712e1d50a9f9?w=300&h=200&fit=crop',
 ARRAY['pelvic_pain', 'muscle_tension', 'period_pain']),

('Étirements Anti-Fatigue',
 'Routine énergisante pour lutter contre la fatigue chronique du SOPK',
 'flexibility', 12,
 JSONB_BUILD_ARRAY(
   'Réveil articulaire - 2 min',
   'Étirements dynamiques - 6 min',
   'Postures d''ouverture thoracique - 4 min'
 ),
 true, 'beginner', 1, 'https://images.unsplash.com/photo-1506629905138-712e1d50a9f9?w=300&h=200&fit=crop',
 ARRAY['fatigue', 'low_energy', 'muscle_tension']),

-- SPÉCIALISÉES SOPK
('Routine Hormones Équilibrées',
 'Séquence complète d''exercices spécialement conçus pour l''équilibre hormonal',
 'yoga', 35,
 JSONB_BUILD_ARRAY(
   'Méditation et respiration hormonale - 5 min',
   'Yoga flow pour les glandes endocrines - 15 min',
   'Torsions détoxifiantes - 8 min',
   'Relaxation profonde - 7 min'
 ),
 true, 'easy', 2, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop',
 ARRAY['hormonal_imbalance', 'irregular_cycles', 'mood_swings']),

('Session Anti-Inflammatoire',
 'Mouvements doux pour réduire l''inflammation chronique liée au SOPK',
 'flexibility', 22,
 JSONB_BUILD_ARRAY(
   'Respiration anti-inflammatoire - 4 min',
   'Mouvements fluides et étirements - 14 min',
   'Relaxation avec visualisation - 4 min'
 ),
 true, 'beginner', 1, 'https://images.unsplash.com/photo-1506629905138-712e1d50a9f9?w=300&h=200&fit=crop',
 ARRAY['inflammation', 'joint_pain', 'digestive_issues']);

-- =====================================================
-- 🏃 SUIVI D'ACTIVITÉ PHYSIQUE (SCHÉMA ALIGNÉ)
-- =====================================================

-- Tracking des séances d'activité avec les nouvelles colonnes alignées aux services
INSERT INTO user_activity_tracking (
  user_id, session_id, date_completed, duration_seconds, completion_percentage,
  pre_energy_level, post_energy_level, pre_pain_level, post_pain_level,
  pre_mood_score, post_mood_score, difficulty_felt, difficulty_felt_rating, session_notes
) VALUES
-- Sarah : Utilisatrice régulière d'activité
('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Yoga Flow Débutant SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '7 days', 960, 100, 3, 7, 2, 1, 4, 7, 'just_right', 4, 'Parfait pour décompresser après le boulot'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Renforcement Core SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '5 days', 900, 100, 2, 6, 3, 2, 5, 7, 'just_right', 3, 'Un peu difficile mais efficace pour le dos'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Marche Consciente Anti-Stress' LIMIT 1),
 CURRENT_DATE - INTERVAL '3 days', 1320, 100, 4, 8, 1, 1, 6, 8, 'too_easy', 5, 'Super pour se vider la tête, très relaxant'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Yoga Flow Intermédiaire' LIMIT 1),
 CURRENT_DATE - INTERVAL '1 day', 1800, 95, 3, 7, 2, 1, 5, 8, 'challenging', 4, 'Plus intense mais j''ai adoré le défi'),

-- Claire : Focus sur la gestion de la douleur
('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Mobilité Bassin et Hanches' LIMIT 1),
 CURRENT_DATE - INTERVAL '8 days', 1080, 100, 2, 5, 6, 3, 3, 6, 'just_right', 4, 'Soulage vraiment les tensions du bassin'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Circuit Résistance à l''Insuline' LIMIT 1),
 CURRENT_DATE - INTERVAL '6 days', 1080, 90, 3, 6, 4, 2, 4, 7, 'challenging', 3, 'Dur mais je me sens mieux après, plus énergique'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Session Anti-Inflammatoire' LIMIT 1),
 CURRENT_DATE - INTERVAL '4 days', 1320, 100, 2, 6, 5, 2, 3, 7, 'just_right', 5, 'Exactement ce dont j''avais besoin pour mes articulations'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Routine Hormones Équilibrées' LIMIT 1),
 CURRENT_DATE - INTERVAL '2 days', 2100, 100, 3, 7, 3, 1, 4, 8, 'challenging', 4, 'Session complète, très relaxante à la fin'),

-- Emma : Commence doucement
('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Étirements Anti-Fatigue' LIMIT 1),
 CURRENT_DATE - INTERVAL '3 days', 720, 100, 2, 5, 1, 1, 3, 6, 'too_easy', 4, 'Bien pour commencer, pas trop intense'),

('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Yoga Restaurateur SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '1 day', 1500, 100, 3, 7, 2, 1, 4, 7, 'just_right', 5, 'J''ai adoré, très apaisant pour découvrir le yoga'),

-- Ajout de sessions supplémentaires pour enrichir les données
('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Session Anti-Inflammatoire' LIMIT 1),
 CURRENT_DATE - INTERVAL '10 days', 1200, 100, 4, 7, 3, 1, 6, 8, 'just_right', 5, 'Parfait pour récupérer après une longue journée'),

('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Marche Consciente Anti-Stress' LIMIT 1),
 CURRENT_DATE - INTERVAL '5 days', 1200, 80, 3, 6, 2, 2, 4, 6, 'just_right', 3, 'J''ai arrêté un peu avant la fin mais c''était bien'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM activity_sessions_complete WHERE title = 'Étirements Anti-Fatigue' LIMIT 1),
 CURRENT_DATE - INTERVAL '1 day', 720, 100, 1, 4, 4, 2, 3, 6, 'too_easy', 4, 'Facile mais efficace pour les jours de fatigue');

-- =====================================================
-- 🍽️ SUIVI DES RECETTES UTILISATEURS
-- =====================================================

-- Tracking des recettes testées par les utilisateurs
INSERT INTO user_recipe_tracking (
  user_id, recipe_id, date_cooked, difficulty_rating,
  preparation_time_actual, taste_rating, would_make_again, notes
) VALUES
-- Sarah teste les recettes végétariennes
('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM recipes WHERE title = 'Porridge Anti-Inflammatoire' LIMIT 1),
 CURRENT_DATE - INTERVAL '4 days', 1, 12, 5, true,
 'Délicieux ! Les graines de chia ajoutent une super texture'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM recipes WHERE title = 'Salade Quinoa Power SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '2 days', 2, 18, 4, true,
 'Très rassasiant, j''ai ajouté des graines de tournesol'),

-- Claire expérimente les recettes anti-inflammatoires
('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM recipes WHERE title = 'Saumon aux Légumes Vapeur' LIMIT 1),
 CURRENT_DATE - INTERVAL '3 days', 2, 25, 5, true,
 'Parfait pour le dîner, me sens moins ballonnée après'),

-- Emma commence doucement
('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM recipes WHERE title = 'Porridge Anti-Inflammatoire' LIMIT 1),
 CURRENT_DATE - INTERVAL '1 day', 1, 15, 4, true,
 'Premier essai de recette SOPK, plutôt réussi !'),

-- Plus d'entrées pour avoir plus de données
('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM recipes WHERE title = 'Saumon aux Légumes Vapeur' LIMIT 1),
 CURRENT_DATE - INTERVAL '6 days', 3, 28, 5, true,
 'Un peu plus long que prévu mais excellent !'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM recipes WHERE title = 'Porridge Anti-Inflammatoire' LIMIT 1),
 CURRENT_DATE - INTERVAL '5 days', 1, 10, 4, true,
 'Rapide et efficace pour le petit-déj'),

('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM recipes WHERE title = 'Salade Quinoa Power SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '2 days', 2, 22, 3, false,
 'Pas fan du quinoa finalement, mais c''était nutritif');

-- =====================================================
-- 👤 PROFILS UTILISATEUR ÉTENDUS (NOUVELLES TABLES)
-- =====================================================

-- Insérer les profils détaillés pour les utilisateurs de développement
INSERT INTO user_profiles (
  user_id, first_name, preferred_name, date_of_birth,
  sopk_diagnosis_year, current_symptoms, severity_level,
  primary_goals, timezone, language_preference, notification_preferences
) VALUES
-- Sarah : Profil actif avec SOPK modéré
('550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Sarah', '1992-06-15',
 2020, ARRAY['irregular_cycles', 'fatigue', 'mood_swings', 'weight_gain'],
 'moderate', ARRAY['symptom_management', 'stress_reduction'],
 'Europe/Paris', 'fr',
 JSONB_BUILD_OBJECT('daily_reminder', true, 'weekly_summary', true, 'new_features', false)),

-- Emma : Récemment diagnostiquée
('550e8400-e29b-41d4-a716-446655440001', 'Emma', 'Emma', '1995-03-22',
 2024, ARRAY['acne', 'irregular_cycles'], 'mild',
 ARRAY['understanding_condition', 'lifestyle_changes'],
 'Europe/Paris', 'fr',
 JSONB_BUILD_OBJECT('daily_reminder', true, 'weekly_summary', false, 'new_features', true)),

-- Claire : Expérience longue avec SOPK
('550e8400-e29b-41d4-a716-446655440002', 'Claire', 'Claire', '1988-11-08',
 2015, ARRAY['insulin_resistance', 'hirsutism', 'anxiety'],
 'moderate', ARRAY['weight_management', 'hormonal_balance'],
 'Europe/Paris', 'fr',
 JSONB_BUILD_OBJECT('daily_reminder', false, 'weekly_summary', true, 'new_features', false))
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  preferred_name = EXCLUDED.preferred_name,
  date_of_birth = EXCLUDED.date_of_birth,
  sopk_diagnosis_year = EXCLUDED.sopk_diagnosis_year,
  current_symptoms = EXCLUDED.current_symptoms,
  severity_level = EXCLUDED.severity_level,
  primary_goals = EXCLUDED.primary_goals,
  notification_preferences = EXCLUDED.notification_preferences,
  updated_at = NOW();

-- =====================================================
-- 🍽️ RECETTES DÉTAILLÉES SOPK (NOUVELLE TABLE)
-- =====================================================

-- Insérer des recettes complètes avec instructions détaillées
INSERT INTO recipes (
  title, description, category, prep_time_minutes, cook_time_minutes, servings, difficulty,
  glycemic_index_category, nutritional_info, sopk_benefits, allergen_info,
  ingredients, instructions, equipment_needed, storage_tips, season, dietary_tags
) VALUES
-- Petit-déjeuner énergétique
('Porridge Anti-Inflammatoire SOPK',
 'Porridge riche en oméga-3 et antioxydants, parfait pour stabiliser la glycémie matinale et réduire l''inflammation chronique',
 'breakfast', 5, 10, 2, 'easy',
 'low',
 JSONB_BUILD_OBJECT('calories', 385, 'protein', 12, 'carbs', 42, 'fat', 18, 'fiber', 14, 'sugar', 8, 'sodium', 120),
 ARRAY['hormone_balance', 'inflammation_reduction', 'stable_blood_sugar', 'sustained_energy'],
 ARRAY['gluten'],
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('name', 'Flocons d''avoine', 'quantity', '80g', 'category', 'grains'),
   JSONB_BUILD_OBJECT('name', 'Lait d''amande non sucré', 'quantity', '300ml', 'category', 'liquids'),
   JSONB_BUILD_OBJECT('name', 'Graines de chia', 'quantity', '1 c.s.', 'category', 'superfoods'),
   JSONB_BUILD_OBJECT('name', 'Cannelle en poudre', 'quantity', '1 c.c.', 'category', 'spices'),
   JSONB_BUILD_OBJECT('name', 'Myrtilles fraîches', 'quantity', '100g', 'category', 'fruits'),
   JSONB_BUILD_OBJECT('name', 'Noix de Grenoble', 'quantity', '30g', 'category', 'nuts'),
   JSONB_BUILD_OBJECT('name', 'Miel (optionnel)', 'quantity', '1 c.c.', 'category', 'sweeteners')
 ),
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('step', 1, 'instruction', 'Dans une casserole, faire chauffer le lait d''amande à feu moyen', 'duration_minutes', 2, 'tips', 'Ne pas faire bouillir pour préserver les nutriments'),
   JSONB_BUILD_OBJECT('step', 2, 'instruction', 'Ajouter les flocons d''avoine et graines de chia, mélanger', 'duration_minutes', 1, 'tips', 'Les graines de chia vont épaissir naturellement'),
   JSONB_BUILD_OBJECT('step', 3, 'instruction', 'Cuire 8-10 min en remuant régulièrement jusqu''à consistance crémeuse', 'duration_minutes', 10, 'tips', 'Ajuster la consistance avec du lait si nécessaire'),
   JSONB_BUILD_OBJECT('step', 4, 'instruction', 'Hors du feu, ajouter la cannelle et mélanger', 'duration_minutes', 1, 'tips', 'La cannelle aide à réguler la glycémie'),
   JSONB_BUILD_OBJECT('step', 5, 'instruction', 'Servir dans des bols, garnir de myrtilles et noix concassées', 'duration_minutes', 2, 'tips', 'Ajouter le miel en fonction des goûts')
 ),
 ARRAY['casserole', 'cuillère_en_bois'],
 'Se conserve 2 jours au frigo. Réchauffer avec un peu de lait.',
 ARRAY['spring', 'summer', 'autumn', 'winter'],
 ARRAY['vegetarian', 'high_fiber', 'omega3_rich']),

-- Déjeuner équilibré
('Buddha Bowl Équilibre Hormonal',
 'Bowl complet avec quinoa, légumineuses et légumes colorés, spécialement conçu pour l''équilibre hormonal',
 'lunch', 20, 15, 2, 'medium',
 'low',
 JSONB_BUILD_OBJECT('calories', 520, 'protein', 22, 'carbs', 58, 'fat', 20, 'fiber', 18, 'iron', 6, 'magnesium', 120),
 ARRAY['hormone_balance', 'protein_rich', 'anti_inflammatory', 'blood_sugar_balance'],
 ARRAY['none']::text[],
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('name', 'Quinoa tricolore', 'quantity', '150g', 'category', 'grains'),
   JSONB_BUILD_OBJECT('name', 'Pois chiches cuits', 'quantity', '200g', 'category', 'legumes'),
   JSONB_BUILD_OBJECT('name', 'Épinards frais', 'quantity', '100g', 'category', 'vegetables'),
   JSONB_BUILD_OBJECT('name', 'Avocat mûr', 'quantity', '1 moyen', 'category', 'fruits'),
   JSONB_BUILD_OBJECT('name', 'Betterave cuite', 'quantity', '1 petite', 'category', 'vegetables'),
   JSONB_BUILD_OBJECT('name', 'Graines de tournesol', 'quantity', '2 c.s.', 'category', 'seeds'),
   JSONB_BUILD_OBJECT('name', 'Huile d''olive extra vierge', 'quantity', '2 c.s.', 'category', 'fats'),
   JSONB_BUILD_OBJECT('name', 'Citron', 'quantity', '1/2', 'category', 'fruits'),
   JSONB_BUILD_OBJECT('name', 'Curcuma en poudre', 'quantity', '1/2 c.c.', 'category', 'spices')
 ),
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('step', 1, 'instruction', 'Rincer le quinoa et le cuire dans 2,5 volumes d''eau salée pendant 12-15 min', 'duration_minutes', 15, 'tips', 'Le quinoa est cuit quand le germe blanc apparaît'),
   JSONB_BUILD_OBJECT('step', 2, 'instruction', 'Pendant ce temps, laver et essorer les épinards, couper l''avocat en lamelles', 'duration_minutes', 5, 'tips', 'Arroser l''avocat de citron pour éviter qu''il brunisse'),
   JSONB_BUILD_OBJECT('step', 3, 'instruction', 'Couper la betterave en petits cubes, égoutter et rincer les pois chiches', 'duration_minutes', 5, 'tips', 'Utiliser des betteraves sous vide pour gagner du temps'),
   JSONB_BUILD_OBJECT('step', 4, 'instruction', 'Préparer la vinaigrette en mélangeant huile d''olive, jus de citron et curcuma', 'duration_minutes', 2, 'tips', 'Le curcuma est un puissant anti-inflammatoire'),
   JSONB_BUILD_OBJECT('step', 5, 'instruction', 'Disposer harmonieusement tous les ingrédients sur le quinoa, arroser de vinaigrette', 'duration_minutes', 3, 'tips', 'Manger avec les yeux d''abord !')
 ),
 ARRAY['casserole', 'passoire', 'couteau', 'planche_a_decouper'],
 'Les ingrédients se préparent à l''avance et se conservent séparément 3 jours au frigo.',
 ARRAY['spring', 'summer', 'autumn'],
 ARRAY['vegan', 'gluten_free', 'complete_protein', 'anti_inflammatory']),

-- Dîner léger
('Saumon Grillé aux Légumes de Saison',
 'Saumon riche en oméga-3 avec légumes vapeur, parfait pour l''équilibre hormonal et la récupération',
 'dinner', 15, 20, 2, 'easy',
 'low',
 JSONB_BUILD_OBJECT('calories', 420, 'protein', 35, 'carbs', 18, 'fat', 24, 'omega3', 2.3, 'vitamin_d', 15, 'selenium', 40),
 ARRAY['hormone_balance', 'omega3_rich', 'anti_inflammatory', 'muscle_recovery'],
 ARRAY['fish'],
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('name', 'Pavés de saumon', 'quantity', '2 x 150g', 'category', 'fish'),
   JSONB_BUILD_OBJECT('name', 'Brocolis', 'quantity', '300g', 'category', 'vegetables'),
   JSONB_BUILD_OBJECT('name', 'Courgettes', 'quantity', '2 moyennes', 'category', 'vegetables'),
   JSONB_BUILD_OBJECT('name', 'Huile d''olive', 'quantity', '1 c.s.', 'category', 'fats'),
   JSONB_BUILD_OBJECT('name', 'Herbes de Provence', 'quantity', '1 c.c.', 'category', 'herbs'),
   JSONB_BUILD_OBJECT('name', 'Citron', 'quantity', '1', 'category', 'fruits'),
   JSONB_BUILD_OBJECT('name', 'Sel et poivre', 'quantity', 'selon goût', 'category', 'seasonings')
 ),
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('step', 1, 'instruction', 'Préchauffer le four à 180°C. Couper les légumes en morceaux réguliers', 'duration_minutes', 5, 'tips', 'Des morceaux uniformes cuisent de façon homogène'),
   JSONB_BUILD_OBJECT('step', 2, 'instruction', 'Mettre les légumes dans le panier vapeur, cuire 12-15 min selon tendreté désirée', 'duration_minutes', 15, 'tips', 'La cuisson vapeur préserve les vitamines'),
   JSONB_BUILD_OBJECT('step', 3, 'instruction', 'Badigeonner le saumon d''huile d''olive, assaisonner avec herbes, sel et poivre', 'duration_minutes', 2, 'tips', 'Laisser le saumon à température ambiante 10 min avant cuisson'),
   JSONB_BUILD_OBJECT('step', 4, 'instruction', 'Cuire le saumon au four 12-15 min selon épaisseur (chair rosée à cœur)', 'duration_minutes', 15, 'tips', 'Ne pas surcuire pour garder les oméga-3'),
   JSONB_BUILD_OBJECT('step', 5, 'instruction', 'Servir avec les légumes et des quartiers de citron', 'duration_minutes', 2, 'tips', 'Le citron aide à l''absorption du fer des légumes')
 ),
 ARRAY['four', 'cuit_vapeur', 'plat_allant_au_four'],
 'Se consomme de préférence immédiatement. Les légumes se conservent 2 jours au frigo.',
 ARRAY['spring', 'summer', 'autumn', 'winter'],
 ARRAY['high_protein', 'low_carb', 'omega3_rich', 'gluten_free']),

-- Collation saine
('Energy Balls Coco-Amande SOPK',
 'Bouchées énergétiques riches en bonnes graisses et protéines, parfaites pour les fringales',
 'snack', 15, 0, 8, 'beginner',
 'low',
 JSONB_BUILD_OBJECT('calories', 120, 'protein', 4, 'carbs', 8, 'fat', 9, 'fiber', 3, 'magnesium', 25),
 ARRAY['sustained_energy', 'healthy_fats', 'protein_rich'],
 ARRAY['nuts'],
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('name', 'Amandes entières', 'quantity', '150g', 'category', 'nuts'),
   JSONB_BUILD_OBJECT('name', 'Dattes Medjool', 'quantity', '200g', 'category', 'fruits'),
   JSONB_BUILD_OBJECT('name', 'Noix de coco râpée', 'quantity', '50g', 'category', 'nuts'),
   JSONB_BUILD_OBJECT('name', 'Graines de tournesol', 'quantity', '30g', 'category', 'seeds'),
   JSONB_BUILD_OBJECT('name', 'Cannelle', 'quantity', '1 c.c.', 'category', 'spices'),
   JSONB_BUILD_OBJECT('name', 'Vanille en poudre', 'quantity', '1/2 c.c.', 'category', 'spices')
 ),
 JSONB_BUILD_ARRAY(
   JSONB_BUILD_OBJECT('step', 1, 'instruction', 'Dénoyauter les dattes et les tremper 10 min dans l''eau tiède', 'duration_minutes', 10, 'tips', 'Elles seront plus faciles à mixer'),
   JSONB_BUILD_OBJECT('step', 2, 'instruction', 'Mixer les amandes et graines de tournesol jusqu''à obtenir une poudre grossière', 'duration_minutes', 2, 'tips', 'Ne pas trop mixer pour garder du croquant'),
   JSONB_BUILD_OBJECT('step', 3, 'instruction', 'Ajouter les dattes égouttées, cannelle et vanille, mixer jusqu''à obtenir une pâte', 'duration_minutes', 2, 'tips', 'La pâte doit tenir quand on la presse'),
   JSONB_BUILD_OBJECT('step', 4, 'instruction', 'Former des boules avec les mains mouillées, rouler dans la noix de coco', 'duration_minutes', 5, 'tips', 'Humidifier les mains évite que ça colle'),
   JSONB_BUILD_OBJECT('step', 5, 'instruction', 'Placer au frigo 30 min pour raffermir', 'duration_minutes', 30, 'tips', 'Elles se conservent 1 semaine au frigo')
 ),
 ARRAY['robot_mixeur', 'bol'],
 'Se conservent 1 semaine au réfrigérateur dans une boîte hermétique.',
 ARRAY['spring', 'summer', 'autumn', 'winter'],
 ARRAY['vegan', 'gluten_free', 'no_bake', 'high_fiber'])
;

-- =====================================================
-- 📊 TRACKING DES RECETTES (NOUVELLE TABLE)
-- =====================================================

-- Tracking des recettes testées par les utilisateurs avec les nouvelles colonnes
INSERT INTO user_recipe_tracking (
  user_id, recipe_id, date_cooked, servings_made, difficulty_rating,
  taste_rating, would_make_again, preparation_time_actual, notes
) VALUES
-- Sarah teste les nouvelles recettes
('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM recipes WHERE title = 'Porridge Anti-Inflammatoire SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '4 days', 2, 2, 5, true, 18,
 'Délicieux ! Les graines de chia ajoutent une super texture. J''ai ajouté des framboises en plus des myrtilles.'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM recipes WHERE title = 'Buddha Bowl Équilibre Hormonal' LIMIT 1),
 CURRENT_DATE - INTERVAL '2 days', 1, 3, 4, true, 40,
 'Un peu plus long que prévu mais très nutritif. La vinaigrette au curcuma est top ! J''ai fait une seule portion.'),

('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM recipes WHERE title = 'Energy Balls Coco-Amande SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '6 days', 12, 1, 5, true, 20,
 'Super facile et parfait pour les petites faims ! J''en ai fait plus que prévu, elles partent vite.'),

-- Claire expérimente les nouvelles recettes
('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM recipes WHERE title = 'Saumon Grillé aux Légumes de Saison' LIMIT 1),
 CURRENT_DATE - INTERVAL '3 days', 2, 2, 5, true, 38,
 'Parfait pour le dîner, je me sens moins ballonnée après. Les herbes de Provence donnent un très bon goût.'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM recipes WHERE title = 'Porridge Anti-Inflammatoire SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '5 days', 1, 1, 4, true, 15,
 'Rapide et efficace pour le petit-déj. J''ai remplacé les myrtilles par des pommes de mon jardin.'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM recipes WHERE title = 'Energy Balls Coco-Amande SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '1 day', 8, 1, 4, true, 18,
 'Parfait quand j''ai envie de sucré ! Plus sain que les bonbons. Mes enfants adorent aussi.'),

-- Emma commence doucement avec les nouvelles recettes
('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM recipes WHERE title = 'Porridge Anti-Inflammatoire SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '1 day', 2, 2, 4, true, 22,
 'Premier essai de recette SOPK ! Plus long que prévu mais j''ai adoré découvrir les graines de chia. Très rassasiant.'),

('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM recipes WHERE title = 'Energy Balls Coco-Amande SOPK' LIMIT 1),
 CURRENT_DATE - INTERVAL '3 days', 8, 2, 5, true, 25,
 'Ma première recette sans cuisson ! Très fière du résultat. Parfait pour remplacer mes grignotages sucrés.'),

('550e8400-e29b-41d4-a716-446655440001',
 (SELECT id FROM recipes WHERE title = 'Buddha Bowl Équilibre Hormonal' LIMIT 1),
 CURRENT_DATE - INTERVAL '5 days', 1, 4, 3, false, 50,
 'Très beau mais trop compliqué pour moi pour l''instant. Beaucoup d''ingrédients à gérer. Je recommencerai plus tard.'),

-- Quelques entrées supplémentaires pour enrichir les données
('550e8400-e29b-41d4-a716-446655440000',
 (SELECT id FROM recipes WHERE title = 'Saumon Grillé aux Légumes de Saison' LIMIT 1),
 CURRENT_DATE - INTERVAL '8 days', 2, 2, 5, true, 35,
 'Deuxième fois que je fais cette recette. J''ai ajouté des asperges cette fois, excellent !'),

('550e8400-e29b-41d4-a716-446655440002',
 (SELECT id FROM recipes WHERE title = 'Buddha Bowl Équilibre Hormonal' LIMIT 1),
 CURRENT_DATE - INTERVAL '7 days', 2, 3, 4, true, 35,
 'Nutritif et coloré ! J''ai préparé les légumes la veille, ça fait gagner du temps le jour J.')
;

-- =====================================================
-- 📊 DONNÉES COMPLÉMENTAIRES POUR LE DASHBOARD
-- =====================================================

-- Ajouter quelques entrées d'humeur pour Emma (pour qu'elle ait des données)
INSERT INTO mood_entries (
  user_id, date, mood_emoji, mood_score, mood_tags, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '2 days', '😟', 4, ARRAY['worried', 'confused'], 'Découverte du SOPK, beaucoup de questions'),
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', '🙂', 6, ARRAY['hopeful', 'learning'], 'L''app m''aide à comprendre');

-- Ajouter quelques symptômes pour Emma
INSERT INTO daily_symptoms (
  user_id, date, period_flow, fatigue_level, pain_level, notes
) VALUES
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '5 days', 0, 3, 2, 'Acné qui revient, un peu fatiguée'),
('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '4 days', 0, 2, 1, 'Mieux aujourd''hui');

-- Sessions de respiration supplémentaires pour avoir plus de données
INSERT INTO breathing_sessions (
  user_id, technique, duration_seconds, completed,
  stress_before, stress_after, feeling_after, created_at
) VALUES
-- Sarah quelques sessions de plus
('550e8400-e29b-41d4-a716-446655440000', 'coherence', 240, true, 7, 4, 'much_better', NOW() - INTERVAL '14 days'),
('550e8400-e29b-41d4-a716-446655440000', 'box', 300, true, 8, 3, 'calmer', NOW() - INTERVAL '13 days'),

-- Emma essaie différentes techniques
('550e8400-e29b-41d4-a716-446655440001', 'coherence', 300, true, 8, 5, 'slightly_better', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', 'box', 180, false, 6, NULL, NULL, NOW()),

-- Claire régulière
('550e8400-e29b-41d4-a716-446655440002', 'quick', 120, true, 9, 6, 'better', NOW() - INTERVAL '8 days'),
('550e8400-e29b-41d4-a716-446655440002', 'coherence', 360, true, 8, 4, 'much_better', NOW() - INTERVAL '4 days');

-- =====================================================
-- 📊 COMMENTAIRES ET MÉTADONNÉES
-- =====================================================

-- Commentaires pour clarifier l'usage
COMMENT ON TABLE user_profiles IS 'Profils utilisateur fake pour développement - NE PAS UTILISER EN PRODUCTION';
COMMENT ON TABLE daily_symptoms IS 'Contient des données de symptômes fictifs pour tester le dashboard et journal';
COMMENT ON TABLE breathing_sessions IS 'Sessions de respiration simulées pour tester les statistiques';
COMMENT ON TABLE mood_entries IS 'Entrées d''humeur fictives pour développement interface';
COMMENT ON TABLE user_meal_tracking IS 'Suivi fictif de repas pour développement module nutrition';

-- =====================================================
-- 🔧 FONCTIONS SQL UTILES POUR LES NOUVEAUX SERVICES
-- =====================================================

-- Fonction pour récupérer les recettes les mieux notées (utilisée par recipeService)
CREATE OR REPLACE FUNCTION get_top_rated_recipes(recipe_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  category VARCHAR,
  difficulty VARCHAR,
  prep_time_minutes INTEGER,
  average_rating NUMERIC,
  total_ratings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.category,
    r.difficulty,
    r.prep_time_minutes,
    AVG(urt.taste_rating::NUMERIC) as average_rating,
    COUNT(urt.taste_rating) as total_ratings
  FROM recipes r
  LEFT JOIN user_recipe_tracking urt ON r.id = urt.recipe_id
  WHERE urt.taste_rating IS NOT NULL
  GROUP BY r.id, r.title, r.category, r.difficulty, r.prep_time_minutes
  HAVING COUNT(urt.taste_rating) >= 2  -- Au moins 2 évaluations
  ORDER BY average_rating DESC, total_ratings DESC
  LIMIT recipe_limit;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir un aperçu des statistiques globales (utile pour les services)
CREATE OR REPLACE FUNCTION get_app_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_recipes BIGINT,
  total_activity_sessions BIGINT,
  total_breathing_sessions BIGINT,
  total_mood_entries BIGINT,
  total_symptom_entries BIGINT,
  avg_user_age NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    (SELECT COUNT(*) FROM recipes) as total_recipes,
    (SELECT COUNT(*) FROM user_activity_tracking) as total_activity_sessions,
    (SELECT COUNT(*) FROM breathing_sessions) as total_breathing_sessions,
    (SELECT COUNT(*) FROM mood_entries) as total_mood_entries,
    (SELECT COUNT(*) FROM daily_symptoms) as total_symptom_entries,
    (SELECT AVG(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth))) FROM user_profiles WHERE date_of_birth IS NOT NULL) as avg_user_age;
END;
$$ LANGUAGE plpgsql;

-- Message de fin pour les développeurs (mis à jour)
DO $$
BEGIN
  RAISE NOTICE '=== SEED DEVELOPMENT COMPLETÉ (VERSION ALIGNÉE) ===';
  RAISE NOTICE 'Utilisateurs créés avec profils complets:';
  RAISE NOTICE '- sarah.dev@sopk-companion.com (profil actif, 32 ans)';
  RAISE NOTICE '- emma.dev@sopk-companion.com (nouveau profil, 29 ans)';
  RAISE NOTICE '- claire.dev@sopk-companion.com (expérimentée, 36 ans)';
  RAISE NOTICE 'Mot de passe pour tous: password123';
  RAISE NOTICE '';
  RAISE NOTICE 'Données complètes pour toutes les tables:';
  RAISE NOTICE '✅ user_profiles - 3 profils détaillés avec SOPK info';
  RAISE NOTICE '✅ daily_symptoms - Tracking symptômes quotidiens';
  RAISE NOTICE '✅ breathing_sessions - Sessions de respiration variées';
  RAISE NOTICE '✅ mood_entries - Journal d''humeur avec emojis';
  RAISE NOTICE '✅ meal_suggestions - Suggestions repas existantes';
  RAISE NOTICE '✅ user_meal_tracking - Tracking repas simples';
  RAISE NOTICE '✅ user_nutrition_preferences - Préférences nutrition';
  RAISE NOTICE '✅ recipes - 4 recettes détaillées avec instructions';
  RAISE NOTICE '✅ user_recipe_tracking - 12 trackings recettes détaillés';
  RAISE NOTICE '✅ activity_sessions_complete - 12 sessions activités';
  RAISE NOTICE '✅ user_activity_tracking - 13 sessions utilisateur (schéma aligné)';
  RAISE NOTICE '';
  RAISE NOTICE 'Services alignés avec BDD:';
  RAISE NOTICE '✅ symptomsService ↔ daily_symptoms';
  RAISE NOTICE '✅ breathingService ↔ breathing_sessions';
  RAISE NOTICE '✅ moodService ↔ mood_entries';
  RAISE NOTICE '✅ nutritionService ↔ meal_suggestions';
  RAISE NOTICE '✅ trackingService ↔ user_meal_tracking';
  RAISE NOTICE '✅ activityService ↔ user_activity_tracking (CORRIGÉ)';
  RAISE NOTICE '✅ recipeService ↔ recipes (NOUVEAU)';
  RAISE NOTICE '✅ recipeTrackingService ↔ user_recipe_tracking (NOUVEAU)';
  RAISE NOTICE '✅ userProfileService ↔ user_profiles (NOUVEAU)';
  RAISE NOTICE '';
  RAISE NOTICE 'Fonctions SQL disponibles:';
  RAISE NOTICE '- get_top_rated_recipes(limit)';
  RAISE NOTICE '- get_app_stats()';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 TOUTES LES TABLES CONTIENNENT DES DONNÉES RÉALISTES';
  RAISE NOTICE '==========================================================';
END $$;