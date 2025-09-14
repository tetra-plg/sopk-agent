-- =====================================================
-- SOPK Companion - Schema Complet v1.0
-- Tables manquantes pour finaliser l'architecture
-- =====================================================

-- Table des recettes détaillées (mode cuisine guidé)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'

  -- Temps et difficulté
  prep_time_minutes INTEGER NOT NULL,
  cook_time_minutes INTEGER NOT NULL DEFAULT 0,
  total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
  servings INTEGER DEFAULT 4,
  difficulty VARCHAR(20) NOT NULL, -- 'beginner', 'easy', 'medium', 'advanced'

  -- Nutrition SOPK
  glycemic_index_category VARCHAR(20), -- 'low', 'medium', 'high'
  nutritional_info JSONB, -- {"calories": 350, "protein": 25, "carbs": 30, "fat": 15, "fiber": 8}
  sopk_benefits TEXT[], -- ['hormone_balance', 'inflammation_reduction', 'insulin_regulation']
  allergen_info TEXT[], -- ['gluten', 'dairy', 'nuts']

  -- Structure des ingrédients avec quantités
  ingredients JSONB NOT NULL, -- [{"name": "quinoa", "quantity": "150g", "category": "grains"}]

  -- Instructions détaillées step-by-step
  instructions JSONB NOT NULL, -- [{"step": 1, "instruction": "...", "duration_minutes": 5, "tips": "..."}]

  -- Équipement nécessaire
  equipment_needed TEXT[], -- ['mixer', 'oven', 'steamer']

  -- Adaptations et variations
  variations JSONB, -- [{"name": "vegan", "modifications": [...]}]
  storage_tips TEXT,

  -- Métadonnées
  season TEXT[], -- ['spring', 'summer', 'autumn', 'winter']
  dietary_tags TEXT[], -- ['vegetarian', 'vegan', 'gluten_free', 'dairy_free']

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table améliorée des séances d'activité (structure manquante)
CREATE TABLE activity_sessions_complete (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'yoga', 'mobility', 'cardio_light', 'strength', 'meditation'

  -- Caractéristiques de la séance
  duration_minutes INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- 'beginner', 'easy', 'medium', 'advanced'
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),

  -- Adaptation SOPK
  sopk_benefits TEXT[], -- ['stress_reduction', 'hormonal_balance', 'improved_circulation']
  symptom_targets TEXT[], -- ['fatigue', 'anxiety', 'period_pain', 'insulin_resistance']
  contraindications TEXT[], -- ['acute_pain', 'heavy_menstruation']

  -- Contenu de la séance
  instructions JSONB NOT NULL, -- [{"phase": "warmup", "exercises": [...], "duration": 5}]
  equipment_needed TEXT[], -- ['mat', 'block', 'resistance_band']

  -- Ressources multimédias
  audio_guide_url TEXT,
  video_preview_url TEXT,

  -- Adaptations selon les symptômes
  easy_modifications TEXT[], -- Versions simplifiées pour jours difficiles
  advanced_variations TEXT[], -- Versions plus intenses

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de tracking des recettes utilisées
CREATE TABLE user_recipe_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id),

  date_cooked DATE NOT NULL,
  servings_made INTEGER DEFAULT 4,

  -- Feedback utilisateur
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  taste_rating INTEGER CHECK (taste_rating >= 1 AND taste_rating <= 5),
  will_cook_again BOOLEAN,
  prep_time_actual INTEGER, -- Temps réel vs estimé

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remplacer l'ancienne table user_activity_tracking par la nouvelle structure
DROP TABLE IF EXISTS user_activity_tracking CASCADE;

-- Table de tracking des séances d'activité complétées (NOUVELLE VERSION)
CREATE TABLE user_activity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES activity_sessions_complete(id),

  date_completed DATE NOT NULL,
  duration_actual_minutes INTEGER, -- Durée réelle

  -- État avant/après
  energy_before INTEGER CHECK (energy_before >= 1 AND energy_before <= 10),
  energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 10),
  pain_before INTEGER CHECK (pain_before >= 0 AND pain_before <= 10),
  pain_after INTEGER CHECK (pain_after >= 0 AND pain_after <= 10),

  -- Feedback
  difficulty_felt VARCHAR(20), -- 'too_easy', 'just_right', 'too_hard'
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  modifications_used TEXT[],

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des profils utilisateur étendus
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations personnelles
  first_name VARCHAR(100),
  preferred_name VARCHAR(100),
  date_of_birth DATE,

  -- Informations SOPK
  sopk_diagnosis_year INTEGER,
  current_symptoms TEXT[], -- Symptômes principaux actuels
  severity_level VARCHAR(20), -- 'mild', 'moderate', 'severe'

  -- Préférences générales
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  language_preference VARCHAR(10) DEFAULT 'fr',

  -- Objectifs personnels
  primary_goals TEXT[], -- ['symptom_management', 'weight_balance', 'stress_reduction']

  -- Préférences de notification (pour futures versions)
  notification_preferences JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index pour les performances
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_prep_time ON recipes(prep_time_minutes);
CREATE INDEX idx_recipes_sopk_benefits ON recipes USING GIN(sopk_benefits);

CREATE INDEX idx_activity_complete_category ON activity_sessions_complete(category);
CREATE INDEX idx_activity_complete_duration ON activity_sessions_complete(duration_minutes);
CREATE INDEX idx_activity_complete_symptoms ON activity_sessions_complete USING GIN(symptom_targets);

CREATE INDEX idx_user_recipe_tracking_user_date ON user_recipe_tracking(user_id, date_cooked DESC);
CREATE INDEX idx_user_activity_tracking_user_date ON user_activity_tracking(user_id, date_completed DESC);

-- Fonctions pour updated_at automatique
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE PROCEDURE update_user_profiles_updated_at();

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Activer RLS pour les tables utilisateur
ALTER TABLE user_recipe_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Les recettes et séances sont publiques (pas de RLS)

-- Policies pour user_recipe_tracking
CREATE POLICY "Users can view own recipe tracking" ON user_recipe_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe tracking" ON user_recipe_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipe tracking" ON user_recipe_tracking
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe tracking" ON user_recipe_tracking
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour user_activity_tracking (NOUVELLE VERSION)
CREATE POLICY "Users can view own activity tracking" ON user_activity_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity tracking" ON user_activity_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity tracking" ON user_activity_tracking
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity tracking" ON user_activity_tracking
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Commentaires sur les tables
COMMENT ON TABLE recipes IS 'Recettes détaillées avec mode cuisine guidé';
COMMENT ON TABLE activity_sessions_complete IS 'Séances d''activité complètes avec adaptations SOPK';
COMMENT ON TABLE user_recipe_tracking IS 'Suivi des recettes cuisinées par les utilisateurs';
COMMENT ON TABLE user_activity_tracking IS 'Suivi des séances d''activité complétées';
COMMENT ON TABLE user_profiles IS 'Profils utilisateur étendus avec informations SOPK';