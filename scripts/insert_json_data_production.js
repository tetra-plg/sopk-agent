#!/usr/bin/env node

/**
 * Script de production pour insérer les données JSON dans Supabase
 *
 * Ce script est optimisé pour un usage en production avec:
 * - Support des variables d'environnement
 * - Gestion des transactions
 * - Mode dry-run pour la prévisualisation
 * - Confirmation obligatoire ou flag --force
 * - Logging détaillé avec timestamps
 * - Vérification de l'existence des données
 *
 * Usage:
 *   node scripts/insert_json_data_production.js
 *   node scripts/insert_json_data_production.js --dry-run
 *   node scripts/insert_json_data_production.js --force
 *   DATABASE_URL="..." node scripts/insert_json_data_production.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const readline = require('readline');
require('dotenv').config();

// Configuration des arguments de ligne de commande
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForced = args.includes('--force');
const showHelp = args.includes('--help') || args.includes('-h');

// Affichage de l'aide
if (showHelp) {
  console.log(`
Script de production pour insérer les données JSON dans Supabase

USAGE:
  node scripts/insert_json_data_production.js [OPTIONS]

OPTIONS:
  --dry-run    Prévisualise les changements sans les exécuter
  --force      Exécute sans demander de confirmation
  --help, -h   Affiche cette aide

VARIABLES D'ENVIRONNEMENT:
  DATABASE_URL    Connection string complète de la base de données
                  Exemple: postgresql://postgres:[password]@host:port/database

EXEMPLES:
  # Prévisualisation des changements
  node scripts/insert_json_data_production.js --dry-run

  # Exécution avec confirmation
  DATABASE_URL="postgresql://..." node scripts/insert_json_data_production.js

  # Exécution sans confirmation
  DATABASE_URL="postgresql://..." node scripts/insert_json_data_production.js --force

  # Ajouter DATABASE_URL dans .env.production et exécuter
  echo 'DATABASE_URL="postgresql://..."' >> .env.production
  node scripts/insert_json_data_production.js

SÉCURITÉ:
  - Le script utilise des transactions pour garantir l'intégrité des données
  - En cas d'erreur, toutes les modifications sont annulées
  - Le mode dry-run permet de vérifier les opérations avant exécution
  - Les données existantes sont mises à jour, pas dupliquées
`);
  process.exit(0);
}

/**
 * Logger avec timestamps
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '💼',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  }[type] || '💼';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Parse de l'URL de base de données
 */
function parseDatabaseUrl(url) {
  if (!url) {
    throw new Error('DATABASE_URL est requis');
  }

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || 5432,
      database: parsed.pathname.slice(1), // Remove leading /
      user: parsed.username,
      password: parsed.password,
      ssl: parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1'
    };
  } catch (error) {
    throw new Error(`URL de base de données invalide: ${error.message}`);
  }
}

/**
 * Configuration de la base de données
 */
function getDatabaseConfig() {
  // Priorité: argument de ligne de commande, puis .env.production, puis .env
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    log(`Utilisation de DATABASE_URL: ${databaseUrl.replace(/:\/\/.*@/, '://***:***@')}`);
    return parseDatabaseUrl(databaseUrl);
  }

  // Configuration par défaut basée sur .env.production
  if (process.env.VITE_SUPABASE_URL) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      log(`Configuration depuis VITE_SUPABASE_URL pour le projet: ${projectRef}`);

      // Note: En production, il faut utiliser la vraie DATABASE_URL de Supabase
      throw new Error(
        'Pour la production, veuillez définir DATABASE_URL avec la connection string de Supabase.\n\n' +
        'Comment obtenir DATABASE_URL:\n' +
        '1. Allez sur https://supabase.com/dashboard/project/' + projectRef + '/settings/database\n' +
        '2. Dans la section "Connection string", copiez la "Connection string"\n' +
        '3. Remplacez [YOUR-PASSWORD] par votre mot de passe de base de données\n' +
        '4. Exemple: DATABASE_URL="postgresql://postgres.ckbtlvhemxsgqztvnyrw:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"\n\n' +
        'Usage:\n' +
        '  DATABASE_URL="..." node scripts/insert_json_data_production.js\n' +
        '  ou ajoutez DATABASE_URL dans votre fichier .env.production'
      );
    }
  }

  throw new Error(
    'Configuration de base de données manquante.\n' +
    'Veuillez définir DATABASE_URL ou configurer .env.production'
  );
}

/**
 * Demande de confirmation
 */
function askConfirmation(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${message} (oui/non): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Vérification de l'existence des données
 */
async function checkExistingData(client) {
  try {
    const result = await client.query(`
      SELECT
        'activity_sessions' as table_name,
        count(*) as existing_count
      FROM activity_sessions
      UNION ALL
      SELECT
        'recipes',
        count(*)
      FROM recipes
      ORDER BY table_name
    `);

    return result.rows.reduce((acc, row) => {
      acc[row.table_name] = parseInt(row.existing_count);
      return acc;
    }, {});
  } catch (error) {
    log(`Erreur lors de la vérification des données existantes: ${error.message}`, 'warning');
    return {};
  }
}

/**
 * Insertion des sessions d'activité
 */
async function insertActivitySessions(client, sessions, isDryRun = false) {
  log(`${isDryRun ? 'SIMULATION: ' : ''}Insertion de ${sessions.length} sessions d'activité...`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const session of sessions) {
    const checkQuery = 'SELECT id FROM activity_sessions WHERE id = $1';
    const existingResult = await client.query(checkQuery, [session.id]);
    const exists = existingResult.rows.length > 0;

    if (isDryRun) {
      log(`  ${exists ? 'MISE À JOUR' : 'INSERTION'}: ${session.title} (ID: ${session.id})`, 'debug');
      if (exists) updatedCount++; else insertedCount++;
      continue;
    }

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
        category = EXCLUDED.category,
        duration_minutes = EXCLUDED.duration_minutes,
        difficulty = EXCLUDED.difficulty,
        intensity_level = EXCLUDED.intensity_level,
        estimated_calories_burned = EXCLUDED.estimated_calories_burned,
        sopk_benefits = EXCLUDED.sopk_benefits,
        symptom_targets = EXCLUDED.symptom_targets,
        contraindications = EXCLUDED.contraindications,
        instructions = EXCLUDED.instructions,
        equipment_needed = EXCLUDED.equipment_needed,
        audio_guide_url = EXCLUDED.audio_guide_url,
        video_preview_url = EXCLUDED.video_preview_url,
        easy_modifications = EXCLUDED.easy_modifications,
        advanced_variations = EXCLUDED.advanced_variations,
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

    if (exists) {
      updatedCount++;
      log(`  Mise à jour: ${session.title}`, 'debug');
    } else {
      insertedCount++;
      log(`  Insertion: ${session.title}`, 'debug');
    }
  }

  return { inserted: insertedCount, updated: updatedCount };
}

/**
 * Insertion des recettes
 */
async function insertRecipes(client, recipes, isDryRun = false) {
  log(`${isDryRun ? 'SIMULATION: ' : ''}Insertion de ${recipes.length} recettes...`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const recipe of recipes) {
    const checkQuery = 'SELECT id FROM recipes WHERE id = $1';
    const existingResult = await client.query(checkQuery, [recipe.id]);
    const exists = existingResult.rows.length > 0;

    if (isDryRun) {
      log(`  ${exists ? 'MISE À JOUR' : 'INSERTION'}: ${recipe.title} (ID: ${recipe.id})`, 'debug');
      if (exists) updatedCount++; else insertedCount++;
      continue;
    }

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
        category = EXCLUDED.category,
        prep_time_minutes = EXCLUDED.prep_time_minutes,
        cook_time_minutes = EXCLUDED.cook_time_minutes,
        servings = EXCLUDED.servings,
        difficulty = EXCLUDED.difficulty,
        glycemic_index_category = EXCLUDED.glycemic_index_category,
        nutritional_info = EXCLUDED.nutritional_info,
        sopk_benefits = EXCLUDED.sopk_benefits,
        allergen_info = EXCLUDED.allergen_info,
        ingredients = EXCLUDED.ingredients,
        instructions = EXCLUDED.instructions,
        equipment_needed = EXCLUDED.equipment_needed,
        variations = EXCLUDED.variations,
        storage_tips = EXCLUDED.storage_tips,
        season = EXCLUDED.season,
        dietary_tags = EXCLUDED.dietary_tags,
        symptom_targets = EXCLUDED.symptom_targets,
        cycle_phases = EXCLUDED.cycle_phases,
        main_nutrients = EXCLUDED.main_nutrients,
        mood_boosting = EXCLUDED.mood_boosting,
        tips = EXCLUDED.tips,
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

    if (exists) {
      updatedCount++;
      log(`  Mise à jour: ${recipe.title}`, 'debug');
    } else {
      insertedCount++;
      log(`  Insertion: ${recipe.title}`, 'debug');
    }
  }

  return { inserted: insertedCount, updated: updatedCount };
}

/**
 * Fonction principale
 */
async function insertJsonData() {
  const startTime = new Date();
  log('🚀 DÉBUT DU SCRIPT DE PRODUCTION');

  if (isDryRun) {
    log('🔍 MODE DRY-RUN ACTIVÉ - Aucune modification ne sera effectuée', 'warning');
  }

  // Vérification des fichiers JSON
  const activityFile = path.join(__dirname, '..', 'public', 'sopk_activity_sessions.json');
  const recipesFile = path.join(__dirname, '..', 'public', 'sopk_recipes.json');

  if (!fs.existsSync(activityFile)) {
    log(`Fichier non trouvé: ${activityFile}`, 'error');
    process.exit(1);
  }

  if (!fs.existsSync(recipesFile)) {
    log(`Fichier non trouvé: ${recipesFile}`, 'error');
    process.exit(1);
  }

  // Lecture des données
  let activitySessions, recipes;

  try {
    activitySessions = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
    recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf8'));
    log(`Données chargées: ${activitySessions.length} sessions d'activité, ${recipes.length} recettes`);
  } catch (error) {
    log(`Erreur lors de la lecture des fichiers JSON: ${error.message}`, 'error');
    process.exit(1);
  }

  // Configuration de la base de données
  let dbConfig;
  try {
    dbConfig = getDatabaseConfig();
  } catch (error) {
    log(error.message, 'error');
    process.exit(1);
  }

  // Confirmation (sauf en mode dry-run ou avec --force)
  if (!isDryRun && !isForced) {
    const confirmed = await askConfirmation(
      `Êtes-vous sûr de vouloir insérer les données en PRODUCTION sur ${dbConfig.host}?`
    );

    if (!confirmed) {
      log('Opération annulée par l\'utilisateur', 'warning');
      process.exit(0);
    }
  }

  const client = new Client({
    ...dbConfig,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    log(`Connecté à la base de données: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

    // Vérification des données existantes
    const existingData = await checkExistingData(client);
    log(`Données existantes: activity_sessions=${existingData.activity_sessions || 0}, recipes=${existingData.recipes || 0}`);

    if (!isDryRun) {
      // Début de la transaction
      await client.query('BEGIN');
      log('Transaction démarrée');
    }

    let results = {
      activitySessions: { inserted: 0, updated: 0 },
      recipes: { inserted: 0, updated: 0 }
    };

    try {
      // Insertion des sessions d'activité
      results.activitySessions = await insertActivitySessions(client, activitySessions, isDryRun);

      // Insertion des recettes
      results.recipes = await insertRecipes(client, recipes, isDryRun);

      if (!isDryRun) {
        // Validation de la transaction
        await client.query('COMMIT');
        log('Transaction confirmée', 'success');
      }

    } catch (error) {
      if (!isDryRun) {
        await client.query('ROLLBACK');
        log('Transaction annulée suite à une erreur', 'error');
      }
      throw error;
    }

    // Vérifications finales
    if (!isDryRun) {
      const finalCounts = await client.query(`
        SELECT 'activity_sessions' as table_name, count(*) as records FROM activity_sessions
        UNION ALL
        SELECT 'recipes', count(*) FROM recipes
        ORDER BY table_name
      `);

      log('\n📊 RÉSULTATS FINAUX:', 'success');
      finalCounts.rows.forEach(row => {
        log(`   ${row.table_name}: ${row.records} enregistrements total`);
      });
    }

    // Résumé des opérations
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n🎉 RÉSUMÉ DES OPÉRATIONS:', 'success');
    log(`   Sessions d'activité: ${results.activitySessions.inserted} insertions, ${results.activitySessions.updated} mises à jour`);
    log(`   Recettes: ${results.recipes.inserted} insertions, ${results.recipes.updated} mises à jour`);
    log(`   Durée d'exécution: ${duration}s`);

    if (isDryRun) {
      log('\n🔍 MODE DRY-RUN: Aucune modification n\'a été effectuée', 'warning');
      log('Pour exécuter réellement les modifications, relancez sans --dry-run');
    }

  } catch (error) {
    log(`Erreur lors de l'exécution: ${error.message}`, 'error');
    log(`Stack trace: ${error.stack}`, 'debug');
    process.exit(1);
  } finally {
    await client.end();
    log('Connexion à la base de données fermée');
  }
}

// Point d'entrée
if (require.main === module) {
  insertJsonData().catch((error) => {
    log(`Erreur fatale: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { insertJsonData, parseDatabaseUrl, getDatabaseConfig };