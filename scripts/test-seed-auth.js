#!/usr/bin/env node

/**
 * Script de test pour vérifier le seed avec authentification
 * Teste la connexion des 3 utilisateurs et vérifie leurs données
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase locale
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utilisateurs de test
const testUsers = [
  {
    email: 'sophie.martin@test.com',
    password: 'Test123456!',
    expectedName: 'Sophie'
  },
  {
    email: 'marie.dubois@test.com',
    password: 'Test123456!',
    expectedName: 'Marie'
  },
  {
    email: 'camille.rousseau@test.com',
    password: 'Test123456!',
    expectedName: 'Camille'
  }
];

async function testAuthentication() {
  console.log('🔐 TEST D\'AUTHENTIFICATION ET VÉRIFICATION DES DONNÉES\n');
  console.log('=' .repeat(60));

  for (const testUser of testUsers) {
    console.log(`\n📧 Test de ${testUser.email}`);
    console.log('-'.repeat(40));

    try {
      // 1. Tester la connexion
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      if (authError) {
        console.error(`❌ Échec de connexion: ${authError.message}`);
        continue;
      }

      console.log(`✅ Connexion réussie`);
      console.log(`   User ID: ${authData.user.id}`);

      // 2. Vérifier le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error(`❌ Erreur profil: ${profileError.message}`);
      } else {
        console.log(`✅ Profil trouvé:`);
        console.log(`   Nom: ${profile.first_name}`);
        console.log(`   Prénom préféré: ${profile.preferred_name}`);
        console.log(`   Diagnostic SOPK: ${profile.sopk_diagnosis_year}`);
        console.log(`   Sévérité: ${profile.severity_level}`);
        console.log(`   Symptômes: ${profile.current_symptoms?.join(', ') || 'Aucun'}`);
      }

      // 3. Vérifier les préférences nutritionnelles
      const { data: nutritionPrefs, error: nutritionError } = await supabase
        .from('user_nutrition_preferences')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (nutritionError) {
        console.error(`❌ Erreur préférences nutrition: ${nutritionError.message}`);
      } else {
        console.log(`✅ Préférences nutritionnelles trouvées:`);
        console.log(`   Restrictions: ${nutritionPrefs.dietary_restrictions?.join(', ') || 'Aucune'}`);
        console.log(`   Allergies: ${nutritionPrefs.allergies?.join(', ') || 'Aucune'}`);
        console.log(`   Temps max préparation: ${nutritionPrefs.max_prep_time_minutes} min`);
      }

      // 4. Vérifier les données associées
      const checks = [
        {
          table: 'mood_entries',
          label: 'Entrées d\'humeur'
        },
        {
          table: 'cycle_entries',
          label: 'Entrées de cycle'
        },
        {
          table: 'user_activity_tracking',
          label: 'Activités réalisées'
        },
        {
          table: 'breathing_sessions',
          label: 'Sessions de respiration'
        },
        {
          table: 'user_recipe_tracking',
          label: 'Recettes réalisées'
        },
        {
          table: 'meal_suggestions',
          label: 'Suggestions de repas'
        }
      ];

      console.log(`\n📊 Données associées:`);
      for (const check of checks) {
        const { count, error } = await supabase
          .from(check.table)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authData.user.id);

        if (error) {
          console.log(`   ${check.label}: ❌ Erreur`);
        } else {
          console.log(`   ${check.label}: ${count || 0} enregistrement(s)`);
        }
      }

      // Se déconnecter pour le prochain test
      await supabase.auth.signOut();

    } catch (error) {
      console.error(`❌ Erreur inattendue: ${error.message}`);
    }
  }

  // Test des données globales
  console.log('\n' + '='.repeat(60));
  console.log('📊 STATISTIQUES GLOBALES');
  console.log('='.repeat(60));

  const globalTables = [
    { table: 'activity_sessions', label: 'Sessions d\'activité' },
    { table: 'recipes', label: 'Recettes' },
    { table: 'breathing_techniques', label: 'Techniques de respiration' },
    { table: 'sopk_resources', label: 'Ressources SOPK' }
  ];

  for (const table of globalTables) {
    const { count, error } = await supabase
      .from(table.table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`${table.label}: ❌ Erreur`);
    } else {
      console.log(`${table.label}: ${count || 0} enregistrement(s)`);
    }
  }

  console.log('\n🎉 TEST TERMINÉ !');
}

// Exécuter le test
testAuthentication().catch(console.error);