-- Remove simple fields that are poorly formatted
-- Keep only structured JSON fields for ingredients and instructions

ALTER TABLE recipes
DROP COLUMN IF EXISTS ingredients_simple,
DROP COLUMN IF EXISTS preparation_steps_simple;