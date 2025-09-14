-- Migration pour le Journal Humeur Rapide
-- Créé le 13 décembre 2024

-- Table pour tracking émotionnel détaillé
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Données humeur principales avec emojis
  mood_emoji VARCHAR(10) NOT NULL, -- '😊', '😐', '😕', '😤', '😌', etc.
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),

  -- Tags émotionnels rapides (optionnel)
  mood_tags TEXT[], -- ['stressed', 'tired', 'hopeful', 'energetic']

  -- Notes courtes (optionnel)
  notes TEXT,

  -- Contexte pour suggestions
  context_triggers TEXT[], -- ['period_pain', 'work_stress', 'sleep_poor']

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Index pour améliorer performances
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, date DESC);
CREATE INDEX idx_mood_entries_emotion ON mood_entries(user_id, mood_emoji, created_at DESC);
CREATE INDEX idx_mood_entries_score ON mood_entries(user_id, mood_score, date DESC);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON mood_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que leurs propres entrées
CREATE POLICY "Users can view own mood entries" ON mood_entries
FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres entrées
CREATE POLICY "Users can insert own mood entries" ON mood_entries
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres entrées
CREATE POLICY "Users can update own mood entries" ON mood_entries
FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres entrées
CREATE POLICY "Users can delete own mood entries" ON mood_entries
FOR DELETE USING (auth.uid() = user_id);

-- Commentaires pour documentation
COMMENT ON TABLE mood_entries IS 'Table de tracking émotionnel quotidien pour le journal SOPK';
COMMENT ON COLUMN mood_entries.mood_emoji IS 'Emoji représentant l''émotion principale (😊, 😐, 😕, 😤, 😌, etc.)';
COMMENT ON COLUMN mood_entries.mood_score IS 'Note subjective de 1 à 10 de l''état émotionnel';
COMMENT ON COLUMN mood_entries.mood_tags IS 'Tags émotionnels rapides sélectionnés (stressed, tired, energetic, etc.)';
COMMENT ON COLUMN mood_entries.context_triggers IS 'Contexte pour générer suggestions (period_pain, work_stress, etc.)';