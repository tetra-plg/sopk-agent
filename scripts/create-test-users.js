#!/usr/bin/env node

/**
 * Script pour créer les utilisateurs de test avec authentification Supabase
 * Utilise l'API Admin de Supabase pour créer les comptes utilisateur
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase locale
const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Client admin pour créer les utilisateurs
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Utilisateurs de test avec UUIDs fixes
const testUsers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'sophie.martin@test.com',
    password: 'Test123456!',
    profile: {
      first_name: 'Sophie',
      preferred_name: 'Sophie',
      date_of_birth: '1992-03-15',
      sopk_diagnosis_year: 2022,
      current_symptoms: ['acne', 'fatigue', 'troubles_du_sommeil', 'irritabilite'],
      severity_level: 'moderate',
      timezone: 'Europe/Paris',
      language_preference: 'fr',
      primary_goals: ['equilibre_hormonal', 'perte_de_poids', 'amelioration_sommeil'],
      notification_preferences: {
        daily_reminder: true,
        weekly_summary: true,
        new_features: false,
        recipe_suggestions: true,
        activity_reminders: true,
        breathing_reminders: false
      }
    },
    nutrition: {
      dietary_restrictions: ['gluten_free', 'low_sugar'],
      allergies: ['nuts'],
      disliked_ingredients: ['mushrooms', 'seafood'],
      preferred_meal_complexity: 'medium',
      max_prep_time_minutes: 45,
      primary_nutrition_goals: ['weight_management', 'hormone_balance', 'energy_boost']
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'marie.dubois@test.com',
    password: 'Test123456!',
    profile: {
      first_name: 'Marie',
      preferred_name: 'Marie',
      date_of_birth: '1988-07-22',
      sopk_diagnosis_year: 2023,
      current_symptoms: ['prise_de_poids', 'douleurs_menstruelles', 'anxiete', 'fatigue'],
      severity_level: 'severe',
      timezone: 'Europe/Paris',
      language_preference: 'fr',
      primary_goals: ['gestion_stress', 'regulation_cycle', 'amelioration_humeur'],
      notification_preferences: {
        daily_reminder: false,
        weekly_summary: true,
        new_features: true,
        recipe_suggestions: true,
        activity_reminders: false,
        breathing_reminders: true
      }
    },
    nutrition: {
      dietary_restrictions: ['dairy_free', 'low_carb'],
      allergies: [],
      disliked_ingredients: ['spicy_food'],
      preferred_meal_complexity: 'very_easy',
      max_prep_time_minutes: 30,
      primary_nutrition_goals: ['anti_inflammatory', 'mood_support', 'digestive_health']
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'camille.rousseau@test.com',
    password: 'Test123456!',
    profile: {
      first_name: 'Camille',
      preferred_name: 'Cam',
      date_of_birth: '1995-11-08',
      sopk_diagnosis_year: 2024,
      current_symptoms: ['hirsutisme', 'troubles_digestifs', 'fatigue', 'humeur_variable'],
      severity_level: 'mild',
      timezone: 'Europe/Paris',
      language_preference: 'fr',
      primary_goals: ['acceptation_corps', 'equilibre_alimentaire', 'gestion_emotions'],
      notification_preferences: {
        daily_reminder: true,
        weekly_summary: false,
        new_features: true,
        recipe_suggestions: false,
        activity_reminders: true,
        breathing_reminders: true
      }
    },
    nutrition: {
      dietary_restrictions: ['vegetarian'],
      allergies: ['shellfish'],
      disliked_ingredients: ['olives'],
      preferred_meal_complexity: 'easy',
      max_prep_time_minutes: 60,
      primary_nutrition_goals: ['hormone_balance', 'skin_health', 'mental_wellness']
    }
  }
];

async function createTestUsers() {
  console.log('🔧 CRÉATION DES UTILISATEURS DE TEST AVEC AUTHENTIFICATION\n');
  console.log('=' .repeat(60));

  for (const userData of testUsers) {
    console.log(`\n👤 Création de ${userData.email}`);
    console.log('-'.repeat(40));

    try {
      // 1. Créer l'utilisateur avec l'API Admin
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
        id: userData.id,
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.profile.first_name,
          preferred_name: userData.profile.preferred_name
        }
      });

      if (userError) {
        console.error(`❌ Erreur création utilisateur: ${userError.message}`);
        continue;
      }

      console.log(`✅ Utilisateur créé: ${user.user.id}`);

      // 2. Créer le profil utilisateur
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: userData.id,
          user_id: userData.id,
          first_name: userData.profile.first_name,
          preferred_name: userData.profile.preferred_name,
          date_of_birth: userData.profile.date_of_birth,
          sopk_diagnosis_year: userData.profile.sopk_diagnosis_year,
          current_symptoms: userData.profile.current_symptoms,
          severity_level: userData.profile.severity_level,
          timezone: userData.profile.timezone,
          language_preference: userData.profile.language_preference,
          primary_goals: userData.profile.primary_goals,
          notification_preferences: userData.profile.notification_preferences
        });

      if (profileError) {
        console.error(`❌ Erreur création profil: ${profileError.message}`);
      } else {
        console.log(`✅ Profil créé`);
      }

      // 3. Créer les préférences nutritionnelles
      const { error: nutritionError } = await supabaseAdmin
        .from('user_nutrition_preferences')
        .insert({
          id: userData.id,
          user_id: userData.id,
          dietary_restrictions: userData.nutrition.dietary_restrictions,
          allergies: userData.nutrition.allergies,
          disliked_ingredients: userData.nutrition.disliked_ingredients,
          preferred_meal_complexity: userData.nutrition.preferred_meal_complexity,
          max_prep_time_minutes: userData.nutrition.max_prep_time_minutes,
          primary_nutrition_goals: userData.nutrition.primary_nutrition_goals
        });

      if (nutritionError) {
        console.error(`❌ Erreur préférences nutrition: ${nutritionError.message}`);
      } else {
        console.log(`✅ Préférences nutritionnelles créées`);
      }

    } catch (error) {
      console.error(`❌ Erreur inattendue: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 CRÉATION DES UTILISATEURS TERMINÉE !');
  console.log('');
  console.log('📧 Comptes de test créés:');
  testUsers.forEach(user => {
    console.log(`   • ${user.email} (${user.profile.first_name})`);
  });
  console.log('');
  console.log('🔑 Mot de passe pour tous: Test123456!');
}

// Exécuter le script
createTestUsers().catch(console.error);