-- =====================================================
-- SEED DE DEVELOPPEMENT - SOPK AGENT
-- Date: 2025-09-16
-- Objectif: Donnees de test completes avec 3 utilisateurs + donnees JSON
-- =====================================================

-- Nettoyer les donnees existantes (ordre important a cause des FK)
TRUNCATE TABLE user_activity_tracking, user_recipe_tracking, breathing_sessions, mood_entries, daily_symptoms, user_nutrition_preferences, user_profiles CASCADE;
TRUNCATE TABLE recipes, activity_sessions, breathing_techniques CASCADE;
-- Nettoyer aussi l'authentification
TRUNCATE TABLE auth.users CASCADE;

-- =====================================================
-- 1. UTILISATEURS DE TEST (Auth + Profiles)
-- =====================================================

-- Créer les utilisateurs avec authentification complète
-- Mot de passe pour tous: Test123456!
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  created_at,
  updated_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophie.martin@test.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "sophie.martin@test.com", "first_name": "Sophie"}',
  '', '', '', '',
  NOW() - INTERVAL '3 months',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'marie.dubois@test.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW() - INTERVAL '1 week',
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "marie.dubois@test.com", "first_name": "Marie"}',
  '', '', '', '',
  NOW() - INTERVAL '2 months',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'camille.rousseau@test.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW() - INTERVAL '2 days',
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "camille.rousseau@test.com", "first_name": "Camille"}',
  '', '', '', '',
  NOW() - INTERVAL '1 month',
  NOW()
);

-- Créer les identités pour l'authentification
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  '{"sub": "550e8400-e29b-41d4-a716-446655440000", "email": "sophie.martin@test.com"}',
  'email',
  NOW(),
  NOW() - INTERVAL '3 months',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  '{"sub": "550e8400-e29b-41d4-a716-446655440001", "email": "marie.dubois@test.com"}',
  'email',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '2 months',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002',
  '{"sub": "550e8400-e29b-41d4-a716-446655440002", "email": "camille.rousseau@test.com"}',
  'email',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 month',
  NOW()
);

-- -- Profils utilisateurs detailles
-- INSERT INTO user_profiles (
--   user_id,
--   first_name,
--   preferred_name,
--   date_of_birth,
--   sopk_diagnosis_year,
--   current_symptoms,
--   severity_level,
--   timezone,
--   language_preference,
--   primary_goals,
--   notification_preferences,
--   created_at,
--   updated_at
-- ) VALUES
-- (
--   '550e8400-e29b-41d4-a716-446655440000',
--   'Sophie',
--   'Sophie',
--   '1992-03-15',
--   2022,
--   ARRAY['acne', 'fatigue', 'troubles_du_sommeil', 'irritabilite'],
--   'moderate',
--   'Europe/Paris',
--   'fr',
--   ARRAY['equilibre_hormonal', 'perte_de_poids', 'amelioration_sommeil'],
--   '{"daily_reminder": true, "weekly_summary": true, "new_features": false, "recipe_suggestions": true, "activity_reminders": true, "breathing_reminders": false}',
--   NOW() - INTERVAL '3 months',
--   NOW()
-- ),
-- (
--   '550e8400-e29b-41d4-a716-446655440001',
--   'Marie',
--   'Marie',
--   '1988-07-22',
--   2023,
--   ARRAY['prise_de_poids', 'douleurs_menstruelles', 'anxiete', 'fatigue'],
--   'severe',
--   'Europe/Paris',
--   'fr',
--   ARRAY['gestion_stress', 'regulation_cycle', 'amelioration_humeur'],
--   '{"daily_reminder": false, "weekly_summary": true, "new_features": true, "recipe_suggestions": true, "activity_reminders": false, "breathing_reminders": true}',
--   NOW() - INTERVAL '2 months',
--   NOW()
-- ),
-- (
--   '550e8400-e29b-41d4-a716-446655440002',
--   'Camille',
--   'Cam',
--   '1995-11-08',
--   2024,
--   ARRAY['hirsutisme', 'troubles_digestifs', 'fatigue', 'humeur_variable'],
--   'mild',
--   'Europe/Paris',
--   'fr',
--   ARRAY['acceptation_corps', 'equilibre_alimentaire', 'gestion_emotions'],
--   '{"daily_reminder": true, "weekly_summary": false, "new_features": true, "recipe_suggestions": false, "activity_reminders": true, "breathing_reminders": true}',
--   NOW() - INTERVAL '1 month',
--   NOW()
-- );

-- Preferences nutritionnelles (colonnes qui existent reellement)
INSERT INTO user_nutrition_preferences (
  id,
  user_id,
  dietary_restrictions,
  allergies,
  disliked_ingredients,
  preferred_meal_complexity,
  max_prep_time_minutes,
  primary_nutrition_goals,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  ARRAY['gluten_free', 'low_sugar'],
  ARRAY['nuts'],
  ARRAY['mushrooms', 'seafood'],
  'medium',
  45,
  ARRAY['weight_management', 'hormone_balance', 'energy_boost'],
  NOW() - INTERVAL '3 months',
  NOW()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001',
  ARRAY['dairy_free', 'low_carb'],
  ARRAY[]::TEXT[],
  ARRAY['spicy_food'],
  'very_easy',
  30,
  ARRAY['anti_inflammatory', 'mood_support', 'digestive_health'],
  NOW() - INTERVAL '2 months',
  NOW()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440002',
  ARRAY['vegetarian'],
  ARRAY['shellfish'],
  ARRAY['olives'],
  'easy',
  60,
  ARRAY['hormone_balance', 'skin_health', 'mental_wellness'],
  NOW() - INTERVAL '1 month',
  NOW()
);

-- =====================================================
-- 2. DONNEES SYMPTOMES (30 derniers jours pour chaque utilisatrice)
-- =====================================================

-- Sophie (utilisatrice reguliere)
INSERT INTO daily_symptoms (
  id,
  user_id,
  date,
  period_flow,
  fatigue_level,
  pain_level,
  mood_score,
  mood_emoji,
  notes,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  generate_series::DATE,
  CASE
    WHEN EXTRACT(day FROM generate_series) BETWEEN 1 AND 5 THEN (random() * 3 + 1)::INT
    WHEN EXTRACT(day FROM generate_series) BETWEEN 6 AND 25 THEN 0
    ELSE (random() * 2)::INT
  END,
  (random() * 3 + 1)::INT,  -- Fatigue moderee a forte
  (random() * 2 + 1)::INT,  -- Douleur legere a moderee
  (random() * 4 + 5)::INT,  -- Humeur plutot positive (5-9)
  (ARRAY['😊', '🙂', '😐', '😔', '😄'])[ceil(random() * 5)],
  CASE
    WHEN random() > 0.7 THEN 'Bonne journee, energique'
    WHEN random() > 0.4 THEN 'Fatigue en fin de journee'
    ELSE NULL
  END,
  generate_series::TIMESTAMP,
  generate_series::TIMESTAMP
FROM generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, INTERVAL '1 day');

-- Marie (utilisatrice avec plus de difficultes)
INSERT INTO daily_symptoms (
  id,
  user_id,
  date,
  period_flow,
  fatigue_level,
  pain_level,
  mood_score,
  mood_emoji,
  notes,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001',
  generate_series::DATE,
  CASE
    WHEN EXTRACT(day FROM generate_series) BETWEEN 1 AND 6 THEN (random() * 4)::INT
    WHEN EXTRACT(day FROM generate_series) BETWEEN 7 AND 23 THEN 0
    ELSE (random() * 2)::INT
  END,
  (random() * 3 + 2)::INT,  -- Fatigue forte
  (random() * 3 + 2)::INT,  -- Douleur moderee a forte
  (random() * 6 + 2)::INT,  -- Humeur variable (2-8)
  (ARRAY['😢', '😐', '🙂', '😊', '😔'])[ceil(random() * 5)],
  CASE
    WHEN random() > 0.6 THEN 'Journee difficile, beaucoup de fatigue'
    WHEN random() > 0.3 THEN 'Mieux apres exercices de respiration'
    ELSE NULL
  END,
  generate_series::TIMESTAMP,
  generate_series::TIMESTAMP
FROM generate_series(CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE, INTERVAL '1 day');

-- Camille (nouvelle utilisatrice, donnees partielles)
INSERT INTO daily_symptoms (
  id,
  user_id,
  date,
  period_flow,
  fatigue_level,
  pain_level,
  mood_score,
  mood_emoji,
  notes,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440002',
  generate_series::DATE,
  CASE
    WHEN EXTRACT(day FROM generate_series) BETWEEN 1 AND 4 THEN (random() * 2 + 1)::INT
    WHEN EXTRACT(day FROM generate_series) BETWEEN 5 AND 26 THEN 0
    ELSE (random() * 1)::INT
  END,
  (random() * 2 + 1)::INT,  -- Fatigue legere a moderee
  (random() * 2)::INT,      -- Douleur legere
  (random() * 5 + 4)::INT,  -- Humeur plutot bonne (4-9)
  (ARRAY['good', 'happy', 'great', 'neutral', 'excited'])[ceil(random() * 5)],
  CASE
    WHEN random() > 0.8 THEN 'Decouverte de nouvelles recettes!'
    WHEN random() > 0.5 THEN 'Seance sport tres motivante'
    ELSE NULL
  END,
  generate_series::TIMESTAMP,
  generate_series::TIMESTAMP
FROM generate_series(CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE, INTERVAL '1 day');

-- =====================================================
-- 3. TECHNIQUES DE RESPIRATION
-- =====================================================

INSERT INTO breathing_techniques (
  id,
  name,
  description,
  duration_seconds,
  pattern,
  difficulty,
  benefits,
  icon,
  color,
  sopk_benefits,
  display_order,
  is_active,
  created_at,
  updated_at
) VALUES
(
  'coherence_cardiaque',
  'Coherence Cardiaque',
  'Technique de respiration 5-5 qui synchronise le rythme cardiaque avec la respiration pour reduire le stress et equilibrer le systeme nerveux.',
  300,
  ARRAY[5, 0, 5],
  'beginner',
  ARRAY['reduction du stress', 'equilibre du systeme nerveux', 'amelioration du sommeil', 'meilleure concentration'],
  '💙',
  '#3B82F6',
  'Aide a reguler les hormones de stress, ameliore la qualite du sommeil souvent perturbe dans le SOPK',
  1,
  true,
  NOW(),
  NOW()
),
(
  'respiration_4_7_8',
  'Respiration 4-7-8',
  'Technique de relaxation profonde developpee par le Dr. Andrew Weil. Inspire sur 4, retiens sur 7, expire sur 8.',
  240,
  ARRAY[4, 7, 8],
  'intermediate',
  ARRAY['relaxation profonde', 'reduction de l''anxiete', 'endormissement facilite', 'calme mental'],
  '🌙',
  '#8B5FBF',
  'Particulierement efficace pour l''anxiete et les troubles du sommeil frequents avec le SOPK',
  2,
  true,
  NOW(),
  NOW()
),
(
  'respiration_box',
  'Respiration Carree',
  'Technique de respiration en 4 temps egaux : inspire, retiens, expire, pause. Parfaite pour retrouver l''equilibre.',
  360,
  ARRAY[4, 4, 4, 4],
  'intermediate',
  ARRAY['equilibre mental', 'amelioration de la concentration', 'gestion du stress', 'clarte d''esprit'],
  '🔲',
  '#10B981',
  'Aide a reguler les emotions et l''humeur, souvent instables avec les fluctuations hormonales du SOPK',
  3,
  true,
  NOW(),
  NOW()
),
(
  'respiration_energisante',
  'Respiration Energisante',
  'Respiration rythmee courte pour booster l''energie naturellement, ideale en cas de fatigue.',
  180,
  ARRAY[2, 1, 3],
  'advanced',
  ARRAY['boost d''energie', 'reveil mental', 'amelioration de l''humeur', 'vitalite'],
  '⚡',
  '#F59E0B',
  'Combat la fatigue chronique typique du SOPK en stimulant naturellement l''energie',
  4,
  true,
  NOW(),
  NOW()
);

-- =====================================================
-- 4. SESSIONS DE RESPIRATION (historique)
-- =====================================================

-- Sophie - utilisatrice reguliere de respiration
INSERT INTO breathing_sessions (
  id,
  user_id,
  technique_id,
  duration_seconds,
  stress_before,
  stress_after,
  completed,
  feeling_after,
  interruption_reason,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  (ARRAY['coherence_cardiaque', 'respiration_4_7_8', 'respiration_box'])[ceil(random() * 3)],
  (random() * 120 + 180)::INT,  -- 180-300 secondes
  (random() * 4 + 6)::INT,      -- Stress initial 6-10
  (random() * 3 + 2)::INT,      -- Stress apres 2-5
  CASE WHEN random() > 0.1 THEN true ELSE false END, -- 90% terminees
  (ARRAY['calmer', 'energized', 'focused', 'relaxed'])[ceil(random() * 4)],
  CASE WHEN random() < 0.1 THEN 'phone_call' ELSE NULL END,
  generate_series,
  generate_series
FROM generate_series(NOW() - INTERVAL '20 days', NOW(), INTERVAL '2 days');

-- Marie - utilisatrice intensive pour gerer le stress
INSERT INTO breathing_sessions (
  id,
  user_id,
  technique_id,
  duration_seconds,
  stress_before,
  stress_after,
  completed,
  feeling_after,
  interruption_reason,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001',
  (ARRAY['respiration_4_7_8', 'coherence_cardiaque', 'respiration_box'])[ceil(random() * 3)],
  (random() * 180 + 240)::INT,   -- Sessions plus longues 240-420s
  (random() * 3 + 7)::INT,       -- Stress initial eleve 7-10
  (random() * 4 + 3)::INT,       -- Amelioration 3-7
  CASE WHEN random() > 0.05 THEN true ELSE false END, -- 95% terminees
  (ARRAY['calmer', 'relieved', 'focused', 'peaceful'])[ceil(random() * 4)],
  CASE WHEN random() < 0.05 THEN 'too_difficult' ELSE NULL END,
  generate_series,
  generate_series
FROM generate_series(NOW() - INTERVAL '15 days', NOW(), INTERVAL '1 day');

-- =====================================================
-- 5. ENTREES HUMEUR
-- =====================================================

-- Sophie - Entrees d'humeur regulieres
INSERT INTO mood_entries (
  id,
  user_id,
  date,
  mood_emoji,
  mood_score,
  notes,
  tags,
  context_triggers,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  generate_series::DATE,
  (ARRAY['happy', 'good', 'great', 'neutral', 'excited'])[ceil(random() * 5)],
  (random() * 4 + 5)::INT,  -- Humeur plutot positive 5-9
  CASE
    WHEN random() > 0.7 THEN 'Journee productive et equilibree'
    WHEN random() > 0.4 THEN 'Leger stress au travail mais bien gere'
    ELSE NULL
  END,
  CASE
    WHEN random() > 0.75 THEN ARRAY['energetic', 'motivated']
    WHEN random() > 0.5 THEN ARRAY['calm', 'focused']
    WHEN random() > 0.25 THEN ARRAY['happy', 'grateful']
    ELSE ARRAY['content', 'peaceful']
  END,
  CASE
    WHEN random() > 0.6 THEN ARRAY['work_deadline', 'good_sleep']
    WHEN random() > 0.3 THEN ARRAY['exercise', 'healthy_meal']
    ELSE ARRAY['social_time']
  END,
  generate_series,
  generate_series
FROM generate_series(CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE, INTERVAL '2 days');

-- Marie - Entrees avec plus de variabilite emotionnelle
INSERT INTO mood_entries (
  id,
  user_id,
  date,
  mood_emoji,
  mood_score,
  notes,
  tags,
  context_triggers,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001',
  generate_series::DATE,
  (ARRAY['sad', 'neutral', 'good', 'happy', 'down', 'frustrated'])[ceil(random() * 6)],
  (random() * 7 + 2)::INT,  -- Humeur tres variable 2-9
  CASE
    WHEN random() > 0.6 THEN 'Journee difficile, fatigue importante'
    WHEN random() > 0.3 THEN 'Mieux apres session respiration'
    ELSE 'Humeur changeante aujourd''hui'
  END,
  CASE
    WHEN random() > 0.8 THEN ARRAY['anxious', 'tired']
    WHEN random() > 0.6 THEN ARRAY['irritable', 'overwhelmed']
    WHEN random() > 0.4 THEN ARRAY['sad', 'frustrated']
    WHEN random() > 0.2 THEN ARRAY['hopeful', 'determined']
    ELSE ARRAY['calm', 'relieved']
  END,
  CASE
    WHEN random() > 0.5 THEN ARRAY['period_symptoms', 'poor_sleep']
    WHEN random() > 0.2 THEN ARRAY['work_stress', 'hormonal_changes']
    ELSE ARRAY['breathing_exercise', 'support_call']
  END,
  generate_series,
  generate_series
FROM generate_series(CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE, INTERVAL '1 day');

-- =====================================================
-- 6. INSERTION DES DONNEES JSON - ACTIVITY SESSIONS
-- =====================================================

-- Lecture et insertion du fichier sopk_activity_sessions.json
-- (Le contenu sera insere via un script separe car les donnees JSON sont complexes)

INSERT INTO activity_sessions (
  id,
  title,
  description,
  category,
  duration_minutes,
  difficulty,
  intensity_level,
  estimated_calories_burned,
  sopk_benefits,
  symptom_targets,
  contraindications,
  instructions,
  equipment_needed,
  audio_guide_url,
  video_preview_url,
  easy_modifications,
  advanced_variations,
  is_active,
  created_at,
  updated_at
) VALUES
-- Exemple de session simplifiee (les vraies donnees JSON seront ajoutees separement)
(
  gen_random_uuid(),
  'Yoga Doux - Seance Matinale',
  'Seance de yoga adaptee au SOPK pour bien commencer la journee',
  'yoga',
  20,
  'beginner',
  2,
  80,
  ARRAY['equilibre hormonal', 'reduction du stress', 'amelioration sommeil'],
  ARRAY['fatigue', 'anxiete', 'douleurs menstruelles'],
  ARRAY[]::TEXT[],
  '{"phases": [{"name": "warmup", "duration_minutes": 5, "exercises": [{"name": "respiration profonde", "description": "Respiration lente et profonde", "duration": "5 minutes"}]}, {"name": "main", "duration_minutes": 12, "exercises": [{"name": "postures douces", "description": "Enchainement de postures apaisantes", "duration": "12 minutes"}]}, {"name": "cooldown", "duration_minutes": 3, "exercises": [{"name": "relaxation finale", "description": "Position allongee, detente complete", "duration": "3 minutes"}]}]}',
  ARRAY['tapis de yoga'],
  NULL,
  NULL,
  ARRAY['modifier les postures selon confort'],
  ARRAY['ajouter des variations plus dynamiques'],
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Marche Active - Exterieur',
  'Marche tonique adaptee pour stimuler le metabolisme',
  'cardio',
  30,
  'easy',
  3,
  150,
  ARRAY['amelioration metabolisme', 'gestion du poids', 'boost energie'],
  ARRAY['fatigue', 'moral bas', 'troubles metaboliques'],
  ARRAY['blessure recente'],
  '{"phases": [{"name": "warmup", "duration_minutes": 5, "exercises": [{"name": "echauffement articulaire", "description": "Mobilisation douce des articulations", "duration": "5 minutes"}]}, {"name": "main", "duration_minutes": 20, "exercises": [{"name": "marche rythmee", "description": "Marche a allure soutenue mais confortable", "duration": "20 minutes"}]}, {"name": "cooldown", "duration_minutes": 5, "exercises": [{"name": "etirements", "description": "Etirements legers des jambes", "duration": "5 minutes"}]}]}',
  ARRAY['chaussures de sport'],
  NULL,
  NULL,
  ARRAY['reduire l''allure si necessaire'],
  ARRAY['ajouter des intervalles de course'],
  true,
  NOW(),
  NOW()
);

-- =====================================================
-- 7. INSERTION DES DONNEES JSON - RECIPES
-- =====================================================

-- Exemple de recette simplifiee (les vraies donnees JSON seront ajoutees separement)
INSERT INTO recipes (
  id,
  title,
  description,
  category,
  prep_time_minutes,
  cook_time_minutes,
  servings,
  difficulty,
  glycemic_index_category,
  nutritional_info,
  sopk_benefits,
  allergen_info,
  ingredients,
  instructions,
  equipment_needed,
  variations,
  storage_tips,
  season,
  dietary_tags,
  symptom_targets,
  cycle_phases,
  main_nutrients,
  mood_boosting,
  tips,
  created_at
) VALUES
(
  gen_random_uuid(),
  'Bowl Quinoa Saumon Avocat',
  'Bowl nutritif riche en omega-3 et proteines, parfait pour l''equilibre hormonal',
  'lunch',
  15,
  10,
  2,
  'easy',
  'low',
  '{"calories": 420, "protein": 28, "carbs": 32, "fat": 18, "fiber": 8, "omega3": 1.2}',
  ARRAY['equilibre hormonal', 'anti-inflammatoire', 'satiete durable'],
  ARRAY['poisson'],
  '[{"name": "quinoa", "quantity": "100g", "category": "grains"}, {"name": "saumon frais", "quantity": "150g", "category": "protein"}, {"name": "avocat", "quantity": "1", "category": "fats"}, {"name": "concombre", "quantity": "1", "category": "vegetables"}]',
  '[{"step": 1, "instruction": "Cuire le quinoa selon instructions paquet", "duration_minutes": 10}, {"step": 2, "instruction": "Griller le saumon a la poele", "duration_minutes": 6}, {"step": 3, "instruction": "Assembler le bowl avec avocat et concombre", "duration_minutes": 3}]',
  ARRAY['casserole', 'poele'],
  NULL,
  'Se conserve 2 jours au frigo sans l''avocat',
  ARRAY['spring', 'summer'],
  ARRAY['gluten_free', 'high_protein'],
  ARRAY['fatigue', 'inflammation'],
  ARRAY['follicular', 'luteal'],
  ARRAY['omega3', 'protein', 'fiber'],
  false,
  'Ajouter un filet de citron pour plus de fraicheur',
  NOW()
),
(
  gen_random_uuid(),
  'Energy Balls Amandes-Coco',
  'Collation energetique sans sucre ajoute, parfaite pour les fringales',
  'snack',
  10,
  0,
  8,
  'beginner',
  'low',
  '{"calories": 85, "protein": 3, "carbs": 8, "fat": 5, "fiber": 3}',
  ARRAY['gestion des fringales', 'energie stable', 'satiete'],
  ARRAY['nuts'],
  '[{"name": "amandes", "quantity": "100g", "category": "protein"}, {"name": "dattes", "quantity": "80g", "category": "other"}, {"name": "noix de coco rapee", "quantity": "30g", "category": "fats"}]',
  '[{"step": 1, "instruction": "Mixer les amandes finement", "duration_minutes": 2}, {"step": 2, "instruction": "Ajouter les dattes et mixer", "duration_minutes": 3}, {"step": 3, "instruction": "Former des boules et rouler dans la coco", "duration_minutes": 5}]',
  ARRAY['mixeur'],
  NULL,
  'Se conserve 1 semaine dans un contenant hermetique',
  ARRAY['autumn', 'winter'],
  ARRAY['vegan', 'gluten_free', 'no_added_sugar'],
  ARRAY['fringales', 'energie'],
  ARRAY['any'],
  ARRAY['healthy_fats', 'fiber', 'protein'],
  true,
  'Refrigerer 30min avant de servir pour une meilleure tenue',
  NOW()
);

-- =====================================================
-- 8. HISTORIQUE ACTIVITES UTILISATEURS
-- =====================================================

-- Sophie - Utilisatrice active
INSERT INTO user_activity_tracking (
  id,
  user_id,
  session_id,
  date_completed,
  duration_seconds,
  pre_energy_level,
  post_energy_level,
  pre_pain_level,
  post_pain_level,
  pre_mood_score,
  post_mood_score,
  difficulty_felt,
  difficulty_felt_rating,
  enjoyment_rating,
  modifications_used,
  completion_percentage,
  session_notes,
  created_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  (SELECT id FROM activity_sessions ORDER BY random() LIMIT 1),
  generate_series::DATE,
  (random() * 600 + 1200)::INT,  -- 1200-1800 secondes (20-30min)
  (random() * 3 + 3)::INT,    -- Energie avant 3-6
  (random() * 3 + 6)::INT,    -- Energie apres 6-9
  (random() * 3 + 1)::INT,    -- Douleur avant 1-4
  (random() * 2)::INT,        -- Douleur apres 0-2
  (random() * 3 + 4)::INT,    -- Humeur avant 4-7
  (random() * 3 + 6)::INT,    -- Humeur apres 6-9
  (ARRAY['just_right', 'too_easy'])[ceil(random() * 2)],
  (random() * 3 + 1)::INT,    -- Difficulte 1-4
  (random() * 2 + 3)::INT,    -- Plaisir 3-5
  CASE WHEN random() > 0.7 THEN ARRAY['shorter_rest'] ELSE NULL END,
  95 + (random() * 5)::INT,   -- Completion 95-100%
  CASE
    WHEN random() > 0.6 THEN 'Super seance, me sens bien!'
    WHEN random() > 0.3 THEN 'Un peu fatiguee mais satisfaite'
    ELSE NULL
  END,
  generate_series
FROM generate_series(CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE, INTERVAL '3 days');

-- Marie - Utilisatrice moins reguliere mais motivee
INSERT INTO user_activity_tracking (
  id,
  user_id,
  session_id,
  date_completed,
  duration_seconds,
  pre_energy_level,
  post_energy_level,
  pre_pain_level,
  post_pain_level,
  pre_mood_score,
  post_mood_score,
  difficulty_felt,
  difficulty_felt_rating,
  enjoyment_rating,
  modifications_used,
  completion_percentage,
  session_notes,
  created_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM activity_sessions ORDER BY random() LIMIT 1),
  generate_series::DATE,
  (random() * 300 + 900)::INT,   -- Sessions plus courtes 900-1200 secondes (15-20min)
  (random() * 2 + 2)::INT,    -- Energie avant faible 2-4
  (random() * 4 + 4)::INT,    -- Amelioration notable 4-8
  (random() * 4 + 3)::INT,    -- Douleur avant 3-7
  (random() * 3 + 1)::INT,    -- Douleur apres 1-4
  (random() * 4 + 2)::INT,    -- Humeur avant 2-6
  (random() * 4 + 5)::INT,    -- Humeur apres 5-9
  (ARRAY['too_hard', 'just_right'])[ceil(random() * 2)],
  (random() * 3 + 1)::INT,    -- Difficulte 1-4
  (random() * 2 + 3)::INT,    -- Plaisir 3-5
  CASE WHEN random() > 0.5 THEN ARRAY['easier_version', 'more_breaks'] ELSE NULL END,
  75 + (random() * 20)::INT,  -- Completion 75-95%
  CASE
    WHEN random() > 0.5 THEN 'Difficile mais fiere de l''avoir fait'
    ELSE 'J''ai du adapter mais ca fait du bien'
  END,
  generate_series
FROM generate_series(CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE, INTERVAL '4 days');

-- =====================================================
-- 9. HISTORIQUE RECETTES UTILISATEURS
-- =====================================================

-- Sophie - Cuisiniere reguliere
INSERT INTO user_recipe_tracking (
  id,
  user_id,
  recipe_id,
  date_cooked,
  servings_made,
  difficulty_rating,
  taste_rating,
  will_cook_again,
  meal_type,
  preparation_time_actual,
  notes,
  created_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  (SELECT id FROM recipes ORDER BY random() LIMIT 1),
  generate_series::DATE,
  (random() * 2 + 2)::INT,    -- 2-4 portions
  (random() * 3 + 1)::INT,    -- Difficulte 1-4
  (random() * 2 + 3)::INT,    -- Gout 3-5
  CASE WHEN random() > 0.2 THEN true ELSE false END, -- 80% recommande
  (ARRAY['breakfast', 'lunch', 'dinner', 'snack'])[ceil(random() * 4)],
  (random() * 10 + 15)::INT,  -- Temps reel 15-25min
  CASE
    WHEN random() > 0.7 THEN 'Recette parfaite, tres savoureuse!'
    WHEN random() > 0.4 THEN 'Bien mais j''ajouterais plus d''epices'
    ELSE NULL
  END,
  generate_series
FROM generate_series(CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE, INTERVAL '4 days');

-- Marie - Cuisiniere debutante
INSERT INTO user_recipe_tracking (
  id,
  user_id,
  recipe_id,
  date_cooked,
  servings_made,
  difficulty_rating,
  taste_rating,
  will_cook_again,
  meal_type,
  preparation_time_actual,
  notes,
  created_at
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM recipes ORDER BY random() LIMIT 1),
  generate_series::DATE,
  (random() + 1)::INT,        -- 1-2 portions
  (random() * 3 + 1)::INT,    -- Difficulte 1-4
  (random() * 3 + 1)::INT,    -- Gout 1-4
  CASE WHEN random() > 0.4 THEN true ELSE false END, -- 60% recommande
  (ARRAY['breakfast', 'lunch', 'snack'])[ceil(random() * 3)],
  (random() * 15 + 20)::INT,  -- Temps plus long 20-35min
  CASE
    WHEN random() > 0.6 THEN 'Plus difficile que prevu mais bon resultat'
    WHEN random() > 0.3 THEN 'Simple et efficace, parfait pour debuter'
    ELSE NULL
  END,
  generate_series
FROM generate_series(CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE, INTERVAL '6 days');

-- =====================================================
-- 10. STATISTIQUES DE CREATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SEED DE DEVELOPPEMENT CREE AVEC SUCCES !';
  RAISE NOTICE '';
  RAISE NOTICE '📧 COMPTES DE TEST DISPONIBLES:';
  RAISE NOTICE '   • sophie.martin@test.com';
  RAISE NOTICE '   • marie.dubois@test.com';
  RAISE NOTICE '   • camille.rousseau@test.com';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Mot de passe pour tous: Test123456!';
  RAISE NOTICE '';
  RAISE NOTICE '👥 PROFILS CREES:';
  RAISE NOTICE '   • Sophie: SOPK modere, 3 mois d''historique';
  RAISE NOTICE '   • Marie: SOPK severe, 2 mois d''historique';
  RAISE NOTICE '   • Camille: SOPK leger, 1 mois d''historique';
  RAISE NOTICE '';
  RAISE NOTICE '📊 DONNEES GENEREES:';
  RAISE NOTICE '   • 30 jours de symptomes pour Sophie';
  RAISE NOTICE '   • 25 jours de symptomes pour Marie';
  RAISE NOTICE '   • 15 jours de symptomes pour Camille';
  RAISE NOTICE '   • 4 techniques de respiration';
  RAISE NOTICE '   • Sessions de respiration et entrees d''humeur';
  RAISE NOTICE '   • Historique d''activites physiques';
  RAISE NOTICE '   • Historique de recettes cuisinees';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Application prete pour le developpement !';
END $$;

-- =====================================================
-- 11. VERIFICATIONS FINALES
-- =====================================================

-- Compter les enregistrements crees
SELECT 'user_profiles' as table_name, count(*) as records FROM user_profiles
UNION ALL
SELECT 'daily_symptoms', count(*) FROM daily_symptoms
UNION ALL
SELECT 'breathing_techniques', count(*) FROM breathing_techniques
UNION ALL
SELECT 'breathing_sessions', count(*) FROM breathing_sessions
UNION ALL
SELECT 'mood_entries', count(*) FROM mood_entries
UNION ALL
SELECT 'activity_sessions', count(*) FROM activity_sessions
UNION ALL
SELECT 'user_activity_tracking', count(*) FROM user_activity_tracking
UNION ALL
SELECT 'recipes', count(*) FROM recipes
UNION ALL
SELECT 'user_recipe_tracking', count(*) FROM user_recipe_tracking
UNION ALL
SELECT 'user_nutrition_preferences', count(*) FROM user_nutrition_preferences
ORDER BY table_name;