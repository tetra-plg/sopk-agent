-- =====================================================
-- SOPK Agent - Alignement Schema BDD avec Services
-- Migration pour que la BDD corresponde au code source
-- =====================================================

-- 1. ADAPTER user_activity_tracking aux noms utilisés dans activityService
ALTER TABLE user_activity_tracking
-- Renommer les colonnes pour correspondre au service
ADD COLUMN IF NOT EXISTS pre_energy_level INTEGER CHECK (pre_energy_level >= 1 AND pre_energy_level <= 10),
ADD COLUMN IF NOT EXISTS post_energy_level INTEGER CHECK (post_energy_level >= 1 AND post_energy_level <= 10),
ADD COLUMN IF NOT EXISTS pre_pain_level INTEGER CHECK (pre_pain_level >= 0 AND pre_pain_level <= 10),
ADD COLUMN IF NOT EXISTS post_pain_level INTEGER CHECK (post_pain_level >= 0 AND post_pain_level <= 10),
ADD COLUMN IF NOT EXISTS pre_mood_score INTEGER CHECK (pre_mood_score >= 1 AND pre_mood_score <= 10),
ADD COLUMN IF NOT EXISTS post_mood_score INTEGER CHECK (post_mood_score >= 1 AND post_mood_score <= 10),
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 100 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS session_notes TEXT;

-- Migrer les données existantes vers les nouvelles colonnes
UPDATE user_activity_tracking SET
  pre_energy_level = energy_before,
  post_energy_level = energy_after,
  pre_pain_level = pain_before,
  post_pain_level = pain_after,
  duration_seconds = duration_actual_minutes * 60,
  session_notes = notes
WHERE pre_energy_level IS NULL;

-- Supprimer les anciennes colonnes après migration
ALTER TABLE user_activity_tracking
DROP COLUMN IF EXISTS energy_before,
DROP COLUMN IF EXISTS energy_after,
DROP COLUMN IF EXISTS pain_before,
DROP COLUMN IF EXISTS pain_after,
DROP COLUMN IF EXISTS duration_actual_minutes,
DROP COLUMN IF EXISTS notes;

-- Renommer enjoyment_rating en difficulty_felt_rating pour cohérence
ALTER TABLE user_activity_tracking
ADD COLUMN IF NOT EXISTS difficulty_felt_rating INTEGER CHECK (difficulty_felt_rating >= 1 AND difficulty_felt_rating <= 5);

UPDATE user_activity_tracking SET
  difficulty_felt_rating = enjoyment_rating
WHERE difficulty_felt_rating IS NULL AND enjoyment_rating IS NOT NULL;

-- 2. CRÉER les tables manquantes pour les services manquants

-- Table recipes étendue (compatible avec le service à créer)
CREATE TABLE IF NOT EXISTS recipes (
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

-- Adapter user_recipe_tracking pour correspondre au service
ALTER TABLE user_recipe_tracking
ADD COLUMN IF NOT EXISTS would_make_again BOOLEAN,
ADD COLUMN IF NOT EXISTS preparation_time_actual INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Table user_profiles étendue (service à créer)
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- 3. CRÉER les index pour les performances
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_prep_time ON recipes(prep_time_minutes);
CREATE INDEX IF NOT EXISTS idx_recipes_sopk_benefits ON recipes USING GIN(sopk_benefits);

CREATE INDEX IF NOT EXISTS idx_user_recipe_tracking_user_date ON user_recipe_tracking(user_id, date_cooked DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_user_date ON user_activity_tracking(user_id, date_completed DESC);

-- 4. ACTIVER RLS (Row Level Security) pour les nouvelles tables
ALTER TABLE user_recipe_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. CRÉER les policies RLS
-- Policies pour user_recipe_tracking
DROP POLICY IF EXISTS "Users can view own recipe tracking" ON user_recipe_tracking;
CREATE POLICY "Users can view own recipe tracking" ON user_recipe_tracking
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recipe tracking" ON user_recipe_tracking;
CREATE POLICY "Users can insert own recipe tracking" ON user_recipe_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recipe tracking" ON user_recipe_tracking;
CREATE POLICY "Users can update own recipe tracking" ON user_recipe_tracking
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recipe tracking" ON user_recipe_tracking;
CREATE POLICY "Users can delete own recipe tracking" ON user_recipe_tracking
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 6. FONCTIONS TRIGGER pour updated_at automatique
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE PROCEDURE update_user_profiles_updated_at();

-- 7. COMMENTAIRES pour la documentation
COMMENT ON TABLE recipes IS 'Recettes détaillées avec mode cuisine guidé - aligné avec recipeService';
COMMENT ON TABLE user_recipe_tracking IS 'Suivi des recettes cuisinées - aligné avec recipeTrackingService';
COMMENT ON TABLE user_profiles IS 'Profils utilisateur étendus - aligné avec userProfileService';

COMMENT ON COLUMN user_activity_tracking.pre_energy_level IS 'Niveau énergie avant session (1-10) - aligné avec activityService';
COMMENT ON COLUMN user_activity_tracking.duration_seconds IS 'Durée en secondes - aligné avec activityService';
COMMENT ON COLUMN user_activity_tracking.completion_percentage IS 'Pourcentage complété (0-100) - aligné avec activityService';

-- Message de fin
DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION SCHEMA ALIGNEMENT COMPLETÉE ===';
  RAISE NOTICE 'Base de données alignée avec les services:';
  RAISE NOTICE '✅ activityService - colonnes adaptées';
  RAISE NOTICE '✅ recipeService - table recipes créée';
  RAISE NOTICE '✅ recipeTrackingService - table user_recipe_tracking créée';
  RAISE NOTICE '✅ userProfileService - table user_profiles créée';
  RAISE NOTICE '===============================================';
END $$;