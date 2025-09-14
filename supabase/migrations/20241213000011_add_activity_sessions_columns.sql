-- Migration: Add missing columns to activity_sessions_complete table
-- Adds columns essential for SOPK application functionality

-- Add missing columns to activity_sessions_complete
ALTER TABLE activity_sessions_complete
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS sopk_symptoms TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN activity_sessions_complete.is_active IS 'Whether this activity session is active and available to users';
COMMENT ON COLUMN activity_sessions_complete.difficulty_level IS 'Difficulty level from 1 (beginner) to 5 (expert)';
COMMENT ON COLUMN activity_sessions_complete.thumbnail_url IS 'URL for the activity session thumbnail image';
COMMENT ON COLUMN activity_sessions_complete.sopk_symptoms IS 'Array of SOPK symptoms this activity helps with (e.g., stress, fatigue, insulin_resistance)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_sessions_complete_is_active
ON activity_sessions_complete(is_active);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_complete_difficulty_level
ON activity_sessions_complete(difficulty_level);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_complete_sopk_symptoms
ON activity_sessions_complete USING GIN(sopk_symptoms);

-- Update existing records to have is_active = true by default
UPDATE activity_sessions_complete
SET is_active = true
WHERE is_active IS NULL;