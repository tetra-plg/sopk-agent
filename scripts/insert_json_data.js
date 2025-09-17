#!/usr/bin/env node

/**
 * Script pour insérer les données JSON dans la base de développement
 * Lit les fichiers sopk_activity_sessions.json et sopk_recipes.json
 * et les insère dans Supabase
 *
 * IMPORTANT: Pour la production, utilisez insert_json_data_production.js
 * qui offre plus de sécurité et de fonctionnalités (dry-run, transactions, etc.)
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration de la base de données locale Supabase
const dbConfig = {
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
};

async function insertJsonData() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('🔌 Connecté à la base de données Supabase locale');

    // 1. Insérer les activity sessions
    console.log('🏃 Insertion des sessions d\'activité...');
    const activitySessions = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'public', 'sopk_activity_sessions.json'), 'utf8')
    );

    for (const session of activitySessions) {
      const query = `
        INSERT INTO activity_sessions (
          id, title, description, category, duration_minutes, difficulty,
          intensity_level, estimated_calories_burned, sopk_benefits, symptom_targets,
          contraindications, instructions, equipment_needed, audio_guide_url,
          video_preview_url, easy_modifications, advanced_variations,
          is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = NOW()
      `;

      const values = [
        session.id,
        session.title,
        session.description,
        session.category,
        session.duration_minutes,
        session.difficulty,
        session.intensity_level && session.intensity_level <= 5 ? session.intensity_level : (session.intensity_level ? 5 : null),
        session.estimated_calories_burned || null,
        session.sopk_benefits || [],
        session.symptom_targets || [],
        session.contraindications || [],
        JSON.stringify(session.instructions),
        session.equipment_needed || [],
        session.audio_guide_url || null,
        session.video_preview_url || null,
        session.easy_modifications || [],
        session.advanced_variations || [],
        true
      ];

      await client.query(query, values);
    }
    console.log(`✅ ${activitySessions.length} sessions d'activité insérées`);

    // 2. Insérer les recettes
    console.log('🍽️ Insertion des recettes...');
    const recipes = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'public', 'sopk_recipes.json'), 'utf8')
    );

    for (const recipe of recipes) {
      const query = `
        INSERT INTO recipes (
          id, title, description, category, prep_time_minutes, cook_time_minutes,
          servings, difficulty, glycemic_index_category, nutritional_info,
          sopk_benefits, allergen_info, ingredients, instructions,
          equipment_needed, variations, storage_tips, season, dietary_tags,
          symptom_targets, cycle_phases, main_nutrients,
          mood_boosting, tips, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          created_at = NOW()
      `;

      const values = [
        recipe.id,
        recipe.title,
        recipe.description || null,
        recipe.category,
        recipe.prep_time_minutes,
        recipe.cook_time_minutes,
        recipe.servings || 4,
        recipe.difficulty,
        recipe.glycemic_index_category || null,
        JSON.stringify(recipe.nutritional_info || {}),
        recipe.sopk_benefits || [],
        recipe.allergen_info || [],
        JSON.stringify(recipe.ingredients || []),
        JSON.stringify(recipe.instructions || []),
        recipe.equipment_needed || [],
        JSON.stringify(recipe.variations || null),
        recipe.storage_tips || null,
        recipe.season || [],
        recipe.dietary_tags || [],
        recipe.symptom_targets || [],
        recipe.cycle_phases || [],
        recipe.main_nutrients || [],
        recipe.mood_boosting || false,
        recipe.tips || null
      ];

      await client.query(query, values);
    }
    console.log(`✅ ${recipes.length} recettes insérées`);

    // 3. Vérifications finales
    const counts = await client.query(`
      SELECT 'activity_sessions' as table_name, count(*) as records FROM activity_sessions
      UNION ALL
      SELECT 'recipes', count(*) FROM recipes
      ORDER BY table_name
    `);

    console.log('\n📊 RÉSUMÉ DES INSERTIONS :');
    counts.rows.forEach(row => {
      console.log(`   ${row.table_name}: ${row.records} enregistrements`);
    });

    console.log('\n🎉 Insertion des données JSON terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Vérifier que les fichiers JSON existent
const activityFile = path.join(__dirname, '..', 'public', 'sopk_activity_sessions.json');
const recipesFile = path.join(__dirname, '..', 'public', 'sopk_recipes.json');

if (!fs.existsSync(activityFile)) {
  console.error('❌ Fichier sopk_activity_sessions.json non trouvé dans public/');
  process.exit(1);
}

if (!fs.existsSync(recipesFile)) {
  console.error('❌ Fichier sopk_recipes.json non trouvé dans public/');
  process.exit(1);
}

// Exécuter le script
insertJsonData().catch(console.error);