#!/usr/bin/env node

/**
 * 🧹 Script de validation finale - Nettoyage des redondances SOPK Agent
 * Vérifie que toutes les redondances ont été éliminées et que le code est cohérent
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 VALIDATION FINALE - NETTOYAGE DES REDONDANCES');
console.log('================================================\n');

// Tests à effectuer
const validationTests = [
  {
    name: 'Compilation TypeScript',
    test: () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return { passed: true, message: 'Compilation réussie' };
      } catch (error) {
        return { passed: false, message: `Erreur: ${error.message}` };
      }
    }
  },
  {
    name: 'Vérification interfaces nettoyées',
    test: () => {
      const dbTypesPath = path.join(process.cwd(), 'src/types/database.ts');

      if (!fs.existsSync(dbTypesPath)) {
        return { passed: false, message: 'Fichier database.ts introuvable' };
      }

      const content = fs.readFileSync(dbTypesPath, 'utf8');

      // Vérifier que les champs redondants ont été supprimés
      const redundantPatterns = [
        /calories:\s*number.*null/,  // Champ calories dans Recipe
        /estimated_calories\?:\s*number/,  // Champ estimated_calories dans Recipe
        /energy_before\?:\s*number/,  // Alias dans UserActivityTracking
        /energy_after\?:\s*number/,   // Alias dans UserActivityTracking
        /primary_nutrition_goals:\s*string\[\]/, // Ancien champ dans UserNutritionPreferences
        /goals:\s*string\[\].*UserNutritionPreferences/ // goals redondant
      ];

      const foundRedundancies = [];
      redundantPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          foundRedundancies.push(`Pattern ${index + 1} détecté`);
        }
      });

      if (foundRedundancies.length > 0) {
        return {
          passed: false,
          message: `Redondances détectées: ${foundRedundancies.join(', ')}`
        };
      }

      // Vérifier que les champs unifiés sont présents
      const requiredPatterns = [
        /nutritional_info:\s*NutritionalInfo/,  // Recipe utilise NutritionalInfo
        /pre_energy_level:\s*number/,           // UserActivityTracking unifié
        /nutrition_goals:\s*string\[\]/         // UserNutritionPreferences unifié
      ];

      const missingRequired = [];
      requiredPatterns.forEach((pattern, index) => {
        if (!pattern.test(content)) {
          missingRequired.push(`Required pattern ${index + 1} manquant`);
        }
      });

      if (missingRequired.length > 0) {
        return {
          passed: false,
          message: `Champs requis manquants: ${missingRequired.join(', ')}`
        };
      }

      return { passed: true, message: 'Interfaces parfaitement nettoyées' };
    }
  },
  {
    name: 'Vérification usages dans le code',
    test: () => {
      const srcPath = path.join(process.cwd(), 'src');

      if (!fs.existsSync(srcPath)) {
        return { passed: false, message: 'Répertoire src/ introuvable' };
      }

      // Recherche récursive des usages redondants
      const findFiles = (dir, extensions = ['.ts', '.tsx']) => {
        const files = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...findFiles(fullPath, extensions));
          } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }

        return files;
      };

      const sourceFiles = findFiles(srcPath);
      const problematicUsages = [];

      // Patterns d'usage redondant à détecter
      const redundantUsagePatterns = [
        { pattern: /\.estimated_calories(?!\w)/, description: 'estimated_calories usage' },
        { pattern: /\.energy_before(?!\w)/, description: 'energy_before usage' },
        { pattern: /\.energy_after(?!\w)/, description: 'energy_after usage' },
        { pattern: /\.primary_nutrition_goals(?!\w)/, description: 'primary_nutrition_goals usage' },
        { pattern: /\|\|\s*\w+\.calories/, description: 'calories fallback pattern' }
      ];

      sourceFiles.forEach(filePath => {
        if (filePath.includes('database.ts')) return; // Skip interface file

        try {
          const content = fs.readFileSync(filePath, 'utf8');

          redundantUsagePatterns.forEach(({ pattern, description }) => {
            const matches = content.match(new RegExp(pattern, 'g'));
            if (matches) {
              problematicUsages.push({
                file: path.relative(process.cwd(), filePath),
                pattern: description,
                count: matches.length
              });
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      });

      if (problematicUsages.length > 0) {
        const details = problematicUsages.map(u =>
          `${u.file}: ${u.pattern} (${u.count}x)`
        ).join('\n    ');

        return {
          passed: false,
          message: `Usages redondants trouvés:\n    ${details}`
        };
      }

      return { passed: true, message: 'Aucun usage redondant détecté' };
    }
  },
  {
    name: 'Vérification cohérence des corrections',
    test: () => {
      // Vérifier que les fichiers corrigés utilisent les bons patterns
      const filesToCheck = [
        {
          path: 'src/modules/dashboard/components/NutritionCard.tsx',
          shouldContain: 'nutritional_info?.calories',
          shouldNotContain: 'estimated_calories'
        },
        {
          path: 'src/modules/nutrition/components/MealDetailModal.tsx',
          shouldContain: 'nutritional_info?.calories',
          shouldNotContain: 'estimated_calories'
        }
      ];

      for (const check of filesToCheck) {
        const filePath = path.join(process.cwd(), check.path);

        if (!fs.existsSync(filePath)) {
          continue; // Skip missing files
        }

        const content = fs.readFileSync(filePath, 'utf8');

        if (check.shouldContain && !content.includes(check.shouldContain)) {
          return {
            passed: false,
            message: `${check.path}: Pattern "${check.shouldContain}" manquant`
          };
        }

        if (check.shouldNotContain && content.includes(check.shouldNotContain)) {
          return {
            passed: false,
            message: `${check.path}: Pattern "${check.shouldNotContain}" encore présent`
          };
        }
      }

      return { passed: true, message: 'Corrections appliquées correctement' };
    }
  }
];

// Exécution des tests
console.log('🔍 EXÉCUTION DES TESTS DE VALIDATION\n');

let allPassed = true;
let totalTests = validationTests.length;
let passedTests = 0;

for (const test of validationTests) {
  process.stdout.write(`   • ${test.name}... `);

  try {
    const result = test.test();

    if (result.passed) {
      console.log(`✅ ${result.message}`);
      passedTests++;
    } else {
      console.log(`❌ ${result.message}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    allPassed = false;
  }
}

console.log('\n================================================');
console.log('📊 RÉSULTATS DE VALIDATION');
console.log(`   Tests réussis: ${passedTests}/${totalTests}`);
console.log(`   Statut: ${allPassed ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
console.log('================================================\n');

if (allPassed) {
  console.log('🎉 VALIDATION COMPLÈTE RÉUSSIE');
  console.log('✅ Toutes les redondances ont été éliminées');
  console.log('✅ Le code source est parfaitement cohérent');
  console.log('✅ Les interfaces TypeScript sont nettoyées');
  console.log('✅ La compilation fonctionne sans erreur');
  console.log('\n🚀 Le nettoyage des redondances est terminé avec succès !');
  process.exit(0);
} else {
  console.log('⚠️  VALIDATION ÉCHOUÉE');
  console.log('❌ Des problèmes de cohérence ont été détectés');
  console.log('🔧 Veuillez corriger les erreurs ci-dessus');
  console.log('\n📋 Actions recommandées:');
  console.log('   1. Vérifier les fichiers mentionnés dans les erreurs');
  console.log('   2. Appliquer les corrections nécessaires');
  console.log('   3. Relancer ce script de validation');
  process.exit(1);
}