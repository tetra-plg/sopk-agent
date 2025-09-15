-- Migration: Auto-création des profils utilisateur lors de l'inscription
-- Créée le: 2025-09-14
-- Description: Trigger automatique pour créer un profil basique lors de la création d'un utilisateur

-- Fonction pour créer automatiquement un profil utilisateur
-- SECURITY DEFINER permet de contourner RLS pendant l'exécution
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insérer directement avec SECURITY DEFINER pour contourner RLS
  INSERT INTO public.user_profiles (
    user_id,
    first_name,
    preferred_name,
    date_of_birth,
    sopk_diagnosis_year,
    current_symptoms,
    severity_level,
    timezone,
    language_preference,
    primary_goals,
    notification_preferences,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name',
             NEW.raw_user_meta_data->>'preferred_name',
             NEW.raw_user_meta_data->>'name',
             INITCAP(SPLIT_PART(NEW.email, '@', 1))),
    COALESCE(NEW.raw_user_meta_data->>'preferred_name',
             NEW.raw_user_meta_data->>'first_name',
             NEW.raw_user_meta_data->>'name',
             INITCAP(SPLIT_PART(NEW.email, '@', 1))),
    NULL,
    NULL,
    '[]'::text[],
    NULL,
    'Europe/Paris',
    'fr',
    '[]'::text[],
    '{"daily_reminder": true, "weekly_summary": true, "new_features": false}'::jsonb,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, on continue la création d'utilisateur
  -- Le profil pourra être créé manuellement plus tard
  RAISE LOG 'Erreur création profil pour user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui se déclenche lors de la création d'un nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Assurer que la fonction est accessible
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- Note: Les politiques RLS existent déjà dans la migration 20241213000010
-- Elles permettent aux utilisateurs de lire/modifier leur propre profil