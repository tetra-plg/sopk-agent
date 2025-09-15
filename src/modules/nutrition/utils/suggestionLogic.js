/**
 * 🤖 Moteur de Suggestions Nutrition
 *
 * Algorithme intelligent pour générer des suggestions de repas
 * personnalisées selon les symptômes SOPK et le contexte utilisateur.
 */

class SuggestionEngine {
  /**
   * Génère des suggestions personnalisées basées sur le contexte utilisateur
   */
  static generateSuggestions(context) {
    const {
      symptoms = [],
      cyclePhase = null,
      timeOfDay = new Date().getHours(),
      maxPrepTime = 30,
      preferences = {},
      recentMeals = [],
      mealType = 'auto',
      allMeals = []
    } = context;

    // 1. Déterminer le type de repas si automatique
    const detectedMealType = mealType === 'auto' ? this.detectMealType(timeOfDay) : mealType;

    // 2. Filtrer les candidats de base
    let candidates = this.filterBasicCriteria(allMeals, {
      category: detectedMealType === 'any' ? null : detectedMealType,
      maxPrepTime,
      preferences
    });

    // 3. Exclure les repas récents pour éviter la répétition
    candidates = this.excludeRecentMeals(candidates, recentMeals);

    // 4. Appliquer les restrictions alimentaires
    candidates = this.applyDietaryRestrictions(candidates, preferences);

    // 5. Scorer chaque candidat selon la pertinence
    const scoredCandidates = candidates.map(meal => ({
      ...meal,
      score: this.calculateMealScore(meal, { symptoms, cyclePhase, recentMeals, timeOfDay })
    }));

    // 6. Trier par score et retourner le top 3
    return scoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  /**
   * Détecte le type de repas selon l'heure
   */
  static detectMealType(hour) {
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 17) return 'snack';
    return 'dinner';
  }

  /**
   * Filtre selon les critères de base
   */
  static filterBasicCriteria(meals, { category, maxPrepTime, preferences }) {
    let filtered = meals;

    // Filtrer par catégorie
    if (category) {
      filtered = filtered.filter(meal => meal.category === category);
    }

    // Filtrer par temps de préparation
    if (maxPrepTime) {
      const userMaxTime = Math.min(maxPrepTime, preferences.max_prep_time_minutes || 30);
      filtered = filtered.filter(meal => meal.prep_time_minutes <= userMaxTime);
    }

    // Filtrer par niveau de difficulté préféré
    if (preferences.preferred_meal_complexity) {
      const complexityOrder = { 'very_easy': 1, 'easy': 2, 'medium': 3 };
      const userMaxComplexity = complexityOrder[preferences.preferred_meal_complexity] || 2;

      filtered = filtered.filter(meal => {
        const mealComplexity = complexityOrder[meal.difficulty] || 2;
        return mealComplexity <= userMaxComplexity;
      });
    }

    return filtered;
  }

  /**
   * Exclut les repas consommés récemment
   */
  static excludeRecentMeals(meals, recentMeals, dayThreshold = 3) {
    if (!recentMeals || recentMeals.length === 0) return meals;

    const recentMealIds = recentMeals
      .filter(rm => {
        const mealDate = new Date(rm.created_at);
        const daysSince = (Date.now() - mealDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince < dayThreshold;
      })
      .map(rm => rm.recipe_id);

    return meals.filter(meal => !recentMealIds.includes(meal.id));
  }

  /**
   * Applique les restrictions alimentaires
   */
  static applyDietaryRestrictions(meals, preferences) {
    if (!preferences.dietary_restrictions?.length && !preferences.allergies?.length && !preferences.disliked_ingredients?.length) {
      return meals;
    }

    return meals.filter(meal => {
      // Vérifier restrictions alimentaires
      if (preferences.dietary_restrictions?.length) {
        const hasRequiredRestriction = preferences.dietary_restrictions.every(restriction => {
          return meal.dietary_restrictions?.includes(restriction) ||
                 !this.conflictsWith(meal, restriction);
        });
        if (!hasRequiredRestriction) return false;
      }

      // Vérifier allergies et ingrédients détestés
      const forbidden = [
        ...(preferences.allergies || []),
        ...(preferences.disliked_ingredients || [])
      ];

      if (forbidden.length > 0) {
        const ingredients = meal.ingredients_simple.toLowerCase();
        const hasForbiddenIngredient = forbidden.some(ingredient =>
          ingredients.includes(ingredient.toLowerCase())
        );
        if (hasForbiddenIngredient) return false;
      }

      return true;
    });
  }

  /**
   * Calcule le score de pertinence d'un repas
   */
  static calculateMealScore(meal, context) {
    let score = 50; // Score de base

    // Bonus pour correspondance symptômes (priorité élevée)
    if (context.symptoms?.length) {
      const symptomMatches = context.symptoms.filter(symptom =>
        meal.symptom_targets?.includes(symptom)
      ).length;
      score += symptomMatches * 25; // Bonus important pour symptômes
    }

    // Bonus pour phase du cycle
    if (context.cyclePhase && meal.cycle_phases?.includes(context.cyclePhase)) {
      score += 15;
    }

    // Bonus universel pour "any" phase
    if (meal.cycle_phases?.includes('any')) {
      score += 5;
    }

    // Malus pour répétition récente (mais moins strict que l'exclusion)
    if (context.recentMeals?.length) {
      const recentCount = context.recentMeals.filter(rm => rm.recipe_id === meal.id).length;
      score -= recentCount * 5;
    }

    // Bonus priorité SOPK : Index glycémique bas
    if (meal.glycemic_index_category === 'low') {
      score += 15;
    }

    // Bonus boost d'humeur si symptômes d'humeur
    if (meal.mood_boosting && context.symptoms?.includes('mood_low')) {
      score += 20;
    }

    // Bonus pour facilité selon l'heure (plus facile le soir)
    if (context.timeOfDay >= 18 && meal.difficulty === 'very_easy') {
      score += 10;
    }

    // Bonus saisonnier (simple bonus pour cette version)
    const currentMonth = new Date().getMonth();
    const currentSeason = this.getCurrentSeason(currentMonth);
    if (meal.season?.includes(currentSeason)) {
      score += 5;
    }

    // Bonus pour nutriments principaux recherchés selon symptômes
    if (context.symptoms?.includes('fatigue') && meal.main_nutrients?.includes('protein')) {
      score += 10;
    }

    if (context.symptoms?.includes('period_pain') && meal.main_nutrients?.includes('omega3')) {
      score += 10;
    }

    return Math.max(0, score);
  }

  /**
   * Vérifie si un repas entre en conflit avec une restriction
   */
  static conflictsWith(meal, restriction) {
    const conflicts = {
      'vegetarian': ['meat', 'fish', 'chicken', 'beef', 'pork', 'seafood'],
      'vegan': ['meat', 'fish', 'chicken', 'beef', 'pork', 'seafood', 'egg', 'dairy', 'cheese', 'butter', 'milk'],
      'gluten_free': ['wheat', 'bread', 'pasta', 'flour', 'gluten'],
      'dairy_free': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy']
    };

    const conflictWords = conflicts[restriction] || [];
    const ingredients = meal.ingredients_simple.toLowerCase();

    return conflictWords.some(word => ingredients.includes(word));
  }

  /**
   * Détermine la saison actuelle
   */
  static getCurrentSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  /**
   * Obtient des suggestions rapides pour le dashboard
   */
  static getQuickSuggestion(context) {
    const suggestions = this.generateSuggestions(context);
    return suggestions[0] || null;
  }

  /**
   * Filtre par objectifs nutritionnels
   */
  static filterByNutritionGoals(meals, goals = []) {
    if (!goals.length) return meals;

    const goalToBenefits = {
      'weight_management': ['insulin_regulation', 'sustained_energy'],
      'energy_boost': ['energy_boost', 'sustained_energy'],
      'inflammation_reduction': ['inflammation_reduction', 'hormone_balance']
    };

    return meals.filter(meal => {
      return goals.some(goal => {
        const relevantBenefits = goalToBenefits[goal] || [];
        return relevantBenefits.some(benefit =>
          meal.sopk_benefits?.includes(benefit)
        );
      });
    });
  }
}

export default SuggestionEngine;