#!/usr/bin/env node

/**
 * Script de nettoyage des usages redondants dans le code SOPK Agent
 * Remplace automatiquement les références aux champs redondants par les champs unifiés
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns de remplacement pour les champs redondants
const REPLACEMENTS = [
  // Recipe calories - vers nutritional_info.calories
  {
    pattern: /recipe\.calories(?!\w)/g,
    replacement: 'recipe.nutritional_info?.calories',
    description: 'recipe.calories → recipe.nutritional_info?.calories'
  },
  {
    pattern: /meal\.calories(?!\w)/g,
    replacement: 'meal.nutritional_info?.calories',
    description: 'meal.calories → meal.nutritional_info?.calories'
  },
  {
    pattern: /recipe\.estimated_calories(?!\w)/g,
    replacement: 'recipe.nutritional_info?.calories',
    description: 'recipe.estimated_calories → recipe.nutritional_info?.calories'
  },
  {
    pattern: /meal\.estimated_calories(?!\w)/g,
    replacement: 'meal.nutritional_info?.calories',
    description: 'meal.estimated_calories → meal.nutritional_info?.calories'
  },

  // UserActivityTracking - vers champs pre_/post_
  {
    pattern: /tracking\.energy_before(?!\w)/g,
    replacement: 'tracking.pre_energy_level',
    description: 'tracking.energy_before → tracking.pre_energy_level'
  },
  {
    pattern: /tracking\.energy_after(?!\w)/g,
    replacement: 'tracking.post_energy_level',
    description: 'tracking.energy_after → tracking.post_energy_level'
  },
  {
    pattern: /session\.energy_before(?!\w)/g,
    replacement: 'session.pre_energy_level',
    description: 'session.energy_before → session.pre_energy_level'
  },
  {
    pattern: /session\.energy_after(?!\w)/g,
    replacement: 'session.post_energy_level',
    description: 'session.energy_after → session.post_energy_level'
  },
  {
    pattern: /tracking\.notes(?!\w)/g,
    replacement: 'tracking.session_notes',
    description: 'tracking.notes → tracking.session_notes'
  },

  // UserNutritionPreferences - vers nutrition_goals
  {
    pattern: /preferences\.primary_nutrition_goals(?!\w)/g,
    replacement: 'preferences.nutrition_goals',
    description: 'preferences.primary_nutrition_goals → preferences.nutrition_goals'
  },
  {
    pattern: /profile\.primary_nutrition_goals(?!\w)/g,
    replacement: 'profile.nutrition_goals',
    description: 'profile.primary_nutrition_goals → profile.nutrition_goals'
  },

  // Patterns de conditions OR redondantes
  {
    pattern: /\(([a-zA-Z_]+)\.calories\s*\|\|\s*\1\.estimated_calories\)/g,
    replacement: '$1.nutritional_info?.calories',
    description: '(x.calories || x.estimated_calories) → x.nutritional_info?.calories'
  }
];

// Extensions de fichiers à traiter
const FILE_EXTENSIONS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];

// Répertoires à exclure
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git', 'supabase/migrations'];

/**
 * Trouve tous les fichiers TypeScript/JavaScript dans le projet
 */
function findFiles() {
  const allFiles = [];

  FILE_EXTENSIONS.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: process.cwd(),
      ignore: EXCLUDE_DIRS.map(dir => `${dir}/**`)
    });
    allFiles.push(...files);
  });

  return [...new Set(allFiles)]; // Remove duplicates
}

/**
 * Applique les remplacements sur un fichier
 */
function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier non trouvé: ${filePath}`);
    return { processed: false, changes: 0 };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  const appliedReplacements = [];

  REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
      appliedReplacements.push({
        description,
        count: matches.length
      });
    }
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} - ${changes} remplacement(s)`);
    appliedReplacements.forEach(({ description, count }) => {
      console.log(`   • ${description} (×${count})`);
    });
    return { processed: true, changes };
  }

  return { processed: false, changes: 0 };
}

/**
 * Fonction principale
 */
function main() {
  console.log('🧹 NETTOYAGE DES USAGES REDONDANTS - SOPK AGENT');
  console.log('===============================================\n');

  const files = findFiles().filter(file => file.startsWith('src/'));
  let totalFiles = 0;
  let totalChanges = 0;

  console.log(`📁 Fichiers trouvés: ${files.length}`);
  console.log('📝 Traitement en cours...\n');

  files.forEach(filePath => {
    const result = processFile(filePath);
    if (result.processed) {
      totalFiles++;
      totalChanges += result.changes;
    }
  });

  console.log('\n===============================================');
  console.log('🎉 NETTOYAGE TERMINÉ');
  console.log(`📊 Statistiques:`);
  console.log(`   • Fichiers traités: ${totalFiles}`);
  console.log(`   • Total remplacements: ${totalChanges}`);
  console.log('===============================================\n');

  if (totalChanges > 0) {
    console.log('✅ RECOMMANDATIONS POST-NETTOYAGE:');
    console.log('1. Vérifier que le code compile: npm run build');
    console.log('2. Tester les fonctionnalités affectées');
    console.log('3. Commit les changements: git add . && git commit -m "cleanup: remove redundant field usage"');
  } else {
    console.log('✨ Aucun usage redondant détecté - le code est déjà propre !');
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { processFile, REPLACEMENTS };