-- Migration pour les Séances Guidées Courtes d'Activité Physique
-- Créé le 13 décembre 2024

-- Table pour les sessions d'activité disponibles
CREATE TABLE activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Métadonnées de session
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'yoga_doux', 'etirements', 'cardio_leger', 'renforcement'
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 3), -- 1=Débutant, 2=Intermédiaire, 3=Avancé
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

  -- Contenu de la session
  instructions JSONB, -- Structure détaillée des exercices
  audio_url VARCHAR(500), -- URL vers fichier audio guidé
  thumbnail_url VARCHAR(500), -- Image de prévisualisation

  -- Tags et contexte SOPK
  sopk_symptoms TEXT[], -- ['fatigue', 'douleurs_articulaires', 'stress', 'troubles_sommeil']
  benefits TEXT[], -- ['améliore_circulation', 'réduit_inflammation', 'boost_énergie']
  equipment_needed TEXT[], -- ['tapis', 'elastique', 'aucun']

  -- Métadonnées système
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour le tracking des sessions utilisateur
CREATE TABLE user_activity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES activity_sessions(id) ON DELETE CASCADE,

  -- Données de session
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER, -- Durée réelle de la session

  -- État de la session
  status VARCHAR(20) DEFAULT 'started', -- 'started', 'completed', 'abandoned'
  completion_percentage INTEGER CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  -- Feedback pré-session
  pre_energy_level INTEGER CHECK (pre_energy_level >= 1 AND pre_energy_level <= 10),
  pre_pain_level INTEGER CHECK (pre_pain_level >= 1 AND pre_pain_level <= 10),
  pre_mood_score INTEGER CHECK (pre_mood_score >= 1 AND pre_mood_score <= 10),

  -- Feedback post-session
  post_energy_level INTEGER CHECK (post_energy_level >= 1 AND post_energy_level <= 10),
  post_pain_level INTEGER CHECK (post_pain_level >= 1 AND post_pain_level <= 10),
  post_mood_score INTEGER CHECK (post_mood_score >= 1 AND post_mood_score <= 10),

  -- Notes et ressenti
  session_notes TEXT,
  difficulty_felt INTEGER CHECK (difficulty_felt >= 1 AND difficulty_felt <= 5), -- 1=Très facile, 5=Très difficile

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_activity_sessions_category ON activity_sessions(category, difficulty_level);
CREATE INDEX idx_activity_sessions_duration ON activity_sessions(duration_minutes, is_active);
CREATE INDEX idx_activity_sessions_sopk_symptoms ON activity_sessions USING GIN(sopk_symptoms);

CREATE INDEX idx_user_activity_tracking_user_date ON user_activity_tracking(user_id, started_at DESC);
CREATE INDEX idx_user_activity_tracking_session ON user_activity_tracking(session_id, status);
CREATE INDEX idx_user_activity_tracking_completion ON user_activity_tracking(user_id, completed_at DESC) WHERE completed_at IS NOT NULL;

-- Trigger pour updated_at automatique
CREATE TRIGGER update_activity_sessions_updated_at
  BEFORE UPDATE ON activity_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_tracking_updated_at
  BEFORE UPDATE ON user_activity_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_tracking ENABLE ROW LEVEL SECURITY;

-- Policies pour activity_sessions (lecture publique pour toutes les sessions actives)
CREATE POLICY "Public can view active activity sessions" ON activity_sessions
  FOR SELECT USING (is_active = true);

-- Policies pour user_activity_tracking (chaque utilisateur ne voit que ses données)
CREATE POLICY "Users can view own activity tracking" ON user_activity_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity tracking" ON user_activity_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity tracking" ON user_activity_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity tracking" ON user_activity_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE activity_sessions IS 'Catalogue des sessions d''activité physique guidées pour SOPK';
COMMENT ON TABLE user_activity_tracking IS 'Tracking des sessions d''activité réalisées par les utilisateurs';

COMMENT ON COLUMN activity_sessions.category IS 'Catégorie: yoga_doux, etirements, cardio_leger, renforcement';
COMMENT ON COLUMN activity_sessions.difficulty_level IS '1=Débutant, 2=Intermédiaire, 3=Avancé';
COMMENT ON COLUMN activity_sessions.sopk_symptoms IS 'Symptômes SOPK ciblés par cette session';
COMMENT ON COLUMN user_activity_tracking.status IS 'État: started, completed, abandoned';
COMMENT ON COLUMN user_activity_tracking.difficulty_felt IS '1=Très facile, 5=Très difficile';