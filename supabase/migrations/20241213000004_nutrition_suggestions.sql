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
--
-- Les données d'exemple sont maintenant dans supabase/seed-development.sql
-- avec la structure JSON appropriée pour ingredients et instructions