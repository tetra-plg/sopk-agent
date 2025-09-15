-- Migration: Correction du trigger pour auto-création des profils
-- Créée le: 2025-09-14
-- Description: Version corrigée du trigger avec meilleure gestion des erreurs et types

-- Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Nouvelle fonction plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_first_name text;
  user_preferred_name text;
BEGIN
  -- Extraire les noms depuis les métadonnées ou email
  user_first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'preferred_name',
    NEW.raw_user_meta_data->>'name',
    INITCAP(SPLIT_PART(NEW.email, '@', 1))
  );

  user_preferred_name := COALESCE(
    NEW.raw_user_meta_data->>'preferred_name',
    user_first_name
  );

  -- Insérer le profil avec les bonnes contraintes
  INSERT INTO public.user_profiles (
    user_id,
    first_name,
    preferred_name,
    timezone,
    language_preference,
    current_symptoms,
    primary_goals,
    notification_preferences,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    user_first_name,
    user_preferred_name,
    'Europe/Paris',
    'fr',
    ARRAY[]::text[], -- Array vide explicite
    ARRAY[]::text[], -- Array vide explicite
    '{"daily_reminder": true, "weekly_summary": true, "new_features": false}'::jsonb,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log l'erreur mais ne bloque pas la création d'utilisateur
  RAISE WARNING 'Erreur création profil pour user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;