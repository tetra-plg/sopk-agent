-- Supprimer le champ is_simple_suggestion de la table recipes
-- Ce champ n'est pas pertinent car toutes les recettes peuvent etre utilisees comme suggestions

-- Supprimer l'index associé d'abord
DROP INDEX IF EXISTS idx_recipes_is_simple_suggestion;

-- Supprimer la colonne
ALTER TABLE recipes DROP COLUMN IF EXISTS is_simple_suggestion;