-- =====================================================
-- SOPK Companion - Schema Base de Données
-- Module: Suggestions Nutrition
-- =====================================================

-- Table des suggestions de repas
CREATE TABLE meal_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  difficulty VARCHAR(20) NOT NULL, -- 'very_easy', 'easy', 'medium'
  prep_time_minutes INTEGER NOT NULL,

  -- Nutrition
  glycemic_index_category VARCHAR(20), -- 'low', 'medium', 'high'
  main_nutrients TEXT[], -- ['protein', 'fiber', 'omega3']
  estimated_calories INTEGER,

  -- SOPK-specific
  sopk_benefits TEXT[], -- ['insulin_regulation', 'inflammation_reduction']
  symptom_targets TEXT[], -- ['fatigue', 'cravings', 'period_pain']
  cycle_phases TEXT[], -- ['menstrual', 'follicular', 'ovulation', 'luteal', 'any']

  -- Contenu
  ingredients_simple TEXT NOT NULL, -- Version ultra-courte
  preparation_steps TEXT NOT NULL, -- Instructions courtes
  tips TEXT, -- Conseils optionnels

  -- Métadonnées
  season TEXT[], -- ['spring', 'summer', 'autumn', 'winter']
  dietary_restrictions TEXT[], -- ['vegetarian', 'vegan', 'gluten_free']
  mood_boosting BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking des repas consommés par utilisateur
CREATE TABLE user_meal_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES meal_suggestions(id),

  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'

  -- Feedback utilisateur
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  difficulty_felt VARCHAR(20), -- 'easier', 'as_expected', 'harder'
  will_remake BOOLEAN,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Préférences alimentaires utilisateur
CREATE TABLE user_nutrition_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Contraintes alimentaires
  dietary_restrictions TEXT[], -- ['vegetarian', 'gluten_free', 'dairy_free']

  -- Préférences
  preferred_meal_complexity VARCHAR(20) DEFAULT 'easy', -- 'very_easy', 'easy', 'medium'
  max_prep_time_minutes INTEGER DEFAULT 30,

  -- Dislikes/Allergies
  disliked_ingredients TEXT[],
  allergies TEXT[],

  -- Objectifs
  primary_nutrition_goals TEXT[], -- ['weight_management', 'energy_boost', 'inflammation_reduction']

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index pour les performances
CREATE INDEX idx_meal_suggestions_category ON meal_suggestions(category);
CREATE INDEX idx_meal_suggestions_difficulty ON meal_suggestions(difficulty);
CREATE INDEX idx_meal_suggestions_prep_time ON meal_suggestions(prep_time_minutes);
CREATE INDEX idx_meal_suggestions_symptoms ON meal_suggestions USING GIN(symptom_targets);

CREATE INDEX idx_user_meal_tracking_user_date ON user_meal_tracking(user_id, date DESC);
CREATE INDEX idx_user_meal_tracking_meal ON user_meal_tracking(meal_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_nutrition_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_user_nutrition_preferences_updated_at
BEFORE UPDATE ON user_nutrition_preferences
FOR EACH ROW EXECUTE PROCEDURE update_user_nutrition_preferences_updated_at();

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Activer RLS pour les tables utilisateur
ALTER TABLE user_meal_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_preferences ENABLE ROW LEVEL SECURITY;

-- Les suggestions de repas sont publiques (pas de RLS)
-- meal_suggestions reste accessible à tous

-- Policies pour user_meal_tracking
CREATE POLICY "Users can view own meal tracking" ON user_meal_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal tracking" ON user_meal_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal tracking" ON user_meal_tracking
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal tracking" ON user_meal_tracking
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour user_nutrition_preferences
CREATE POLICY "Users can view own nutrition preferences" ON user_nutrition_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition preferences" ON user_nutrition_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition preferences" ON user_nutrition_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition preferences" ON user_nutrition_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Données de base pour MVP
-- =====================================================

INSERT INTO meal_suggestions (
  name, category, difficulty, prep_time_minutes,
  glycemic_index_category, main_nutrients, estimated_calories,
  sopk_benefits, symptom_targets, cycle_phases,
  ingredients_simple, preparation_steps, tips,
  season, dietary_restrictions, mood_boosting
) VALUES
  (
    'Bowl Quinoa-Avocat Protéiné',
    'lunch',
    'easy',
    10,
    'low',
    ARRAY['protein', 'fiber', 'healthy_fats'],
    350,
    ARRAY['insulin_regulation', 'sustained_energy'],
    ARRAY['fatigue', 'cravings'],
    ARRAY['any'],
    'Quinoa cuit (150g), avocat (1/2), œuf dur (1), épinards (poignée), graines de tournesol',
    '1. Mélanger quinoa + épinards dans un bol\n2. Ajouter avocat en lamelles\n3. Œuf dur coupé + graines par-dessus',
    'Idéal quand tu as besoin d''énergie stable !',
    ARRAY['spring', 'summer', 'autumn', 'winter'],
    ARRAY['vegetarian'],
    true
  ),
  (
    'Omelette aux Épinards',
    'breakfast',
    'very_easy',
    10,
    'low',
    ARRAY['protein'],
    280,
    ARRAY['hormone_balance'],
    ARRAY['fatigue', 'mood_low'],
    ARRAY['any'],
    'Œufs (2), épinards frais (100g), huile d''olive, fromage râpé (optionnel)',
    '1. Faire revenir épinards 2 min\n2. Battre œufs, verser dans la poêle\n3. Cuire 3-4 min, plier en deux',
    'Parfait pour un petit-déj riche en protéines',
    ARRAY['spring', 'summer', 'autumn', 'winter'],
    ARRAY['vegetarian'],
    true
  ),
  (
    'Salade de Lentilles aux Légumes',
    'lunch',
    'easy',
    20,
    'low',
    ARRAY['protein', 'fiber'],
    320,
    ARRAY['inflammation_reduction', 'insulin_regulation'],
    ARRAY['period_pain', 'digestive_issues'],
    ARRAY['any'],
    'Lentilles vertes cuites (150g), tomates cerises, concombre, feta, huile d''olive, citron',
    '1. Couper légumes en dés\n2. Mélanger avec lentilles\n3. Assaisonner huile d''olive + citron',
    'Anti-inflammatoire naturel, parfait pour apaiser',
    ARRAY['spring', 'summer', 'autumn'],
    ARRAY['vegetarian'],
    false
  ),
  (
    'Saumon Grillé aux Légumes Verts',
    'dinner',
    'medium',
    25,
    'low',
    ARRAY['protein', 'omega3'],
    380,
    ARRAY['hormone_balance', 'inflammation_reduction'],
    ARRAY['period_pain', 'mood_low'],
    ARRAY['any'],
    'Filet de saumon (150g), brocolis, courgettes, huile d''olive, herbes de Provence',
    '1. Griller saumon 6-8 min de chaque côté\n2. Cuire légumes vapeur 8-10 min\n3. Assaisonner et servir',
    'Oméga-3 pour équilibrer les hormones',
    ARRAY['spring', 'summer', 'autumn', 'winter'],
    ARRAY[]::text[],
    true
  ),
  (
    'Smoothie Vert Protéiné',
    'snack',
    'very_easy',
    5,
    'low',
    ARRAY['protein', 'fiber'],
    220,
    ARRAY['energy_boost'],
    ARRAY['fatigue', 'cravings'],
    ARRAY['any'],
    'Épinards (poignée), banane (1/2), protéine en poudre vanille, lait d''amande (200ml)',
    '1. Tous les ingrédients dans le blender\n2. Mixer 1-2 minutes\n3. Servir immédiatement',
    'Coup de boost rapide et nutritif',
    ARRAY['spring', 'summer', 'autumn', 'winter'],
    ARRAY['vegetarian', 'vegan'],
    true
  );