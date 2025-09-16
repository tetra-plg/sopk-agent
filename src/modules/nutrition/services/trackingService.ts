/**
 * 📊 Service Tracking Nutrition
 *
 * Gestion du suivi des repas/recettes consommés par les utilisatrices.
 * Utilise la table unifiée user_recipe_tracking et recipes.
 */

import { getSupabaseClient } from '../../../shared/services/supabaseDev';

const trackingService = {
  /**
   * Enregistrer un repas/recette consommé(e)
   */
  async trackMealConsumption(userId, recipeId, mealType, feedback = {}) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_recipe_tracking')
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        meal_type: mealType || null,
        date_cooked: new Date().toISOString().split('T')[0],
        servings_made: 1,
        taste_rating: feedback.satisfaction_rating || null,
        difficulty_rating: feedback.difficulty_felt === 'easier' ? 5 :
                         feedback.difficulty_felt === 'as_expected' ? 3 :
                         feedback.difficulty_felt === 'harder' ? 1 : null,
        would_make_again: feedback.will_remake || null,
        notes: feedback.notes || null
      })
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    return { data: data?.[0] };
  },

  /**
   * Récupérer les repas récents d'un utilisateur
   */
  async getRecentMeals(userId, days = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_recipe_tracking')
      .select(`
        *,
        recipes(
          id,
          title,
          category,
          main_nutrients,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      return { data: [] };
    }

    return { data: data || [] };
  },

  /**
   * Récupérer les repas consommés aujourd'hui
   */
  async getTodayMeals(userId) {
    const today = new Date().toISOString().split('T')[0];
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('user_recipe_tracking')
      .select(`
        *,
        recipes(
          id,
          title,
          category,
          main_nutrients,
          difficulty,
          prep_time_minutes
        )
      `)
      .eq('user_id', userId)
      .eq('date_cooked', today)
      .order('created_at', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      return { data: [] };
    }

    return { data: data || [] };
  },

  /**
   * Obtenir l'historique complet des repas d'un utilisateur
   */
  async getMealHistory(userId, limit = 50) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_recipe_tracking')
      .select(`
        *,
        recipes(
          id,
          title,
          category,
          main_nutrients,
          difficulty,
          prep_time_minutes
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error && error.code !== 'PGRST116') {
      return { data: [] };
    }

    return { data: data || [] };
  },

  /**
   * Obtenir les statistiques nutrition d'un utilisateur
   */
  async getNutritionStats(userId, period = 30) {
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_recipe_tracking')
      .select(`
        taste_rating,
        difficulty_rating,
        would_make_again,
        recipes(
          category,
          main_nutrients,
          difficulty,
          glycemic_index_category
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error && error.code !== 'PGRST116') {
      return { data: [] };
    }

    return { data: data || [] };
  },

  /**
   * Mettre à jour le feedback sur un repas consommé
   */
  async updateMealFeedback(trackingId, feedback) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_recipe_tracking')
      .update({
        taste_rating: feedback.satisfaction_rating,
        difficulty_rating: feedback.difficulty_felt === 'easier' ? 5 :
                         feedback.difficulty_felt === 'as_expected' ? 3 :
                         feedback.difficulty_felt === 'harder' ? 1 : null,
        would_make_again: feedback.will_remake
      })
      .eq('id', trackingId)
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    return { data: data?.[0] };
  },

  /**
   * Supprimer un enregistrement de repas
   */
  async deleteMealTracking(trackingId) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('user_recipe_tracking')
      .delete()
      .eq('id', trackingId);

    if (error) {
      throw error;
    }

    return { success: true };
  },

  /**
   * Obtenir les repas favoris d'un utilisateur (basé sur would_make_again = true)
   */
  async getFavoriteMeals(userId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_recipe_tracking')
      .select(`
        recipe_id,
        recipes(
          id,
          title,
          category,
          difficulty,
          prep_time_minutes,
          main_nutrients,
          description,
          sopk_benefits,
          dietary_tags
        )
      `)
      .eq('user_id', userId)
      .eq('would_make_again', true)
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      return { data: [] };
    }

    // Déduplication des repas favoris
    const uniqueMeals = [];
    const seenRecipeIds = new Set();

    for (const item of data || []) {
      if (!seenRecipeIds.has(item.recipe_id)) {
        seenRecipeIds.add(item.recipe_id);
        uniqueMeals.push(item.recipes);
      }
    }

    return { data: uniqueMeals };
  },

  /**
   * Vérifier si une recette a déjà été faite par l'utilisateur
   */
  async hasUserMadeRecipe(userId, recipeId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_recipe_tracking')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return (data || []).length > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtenir les statistiques de cuisine d'un utilisateur
   */
  async getUserCookingStats(userId, period = 30) {
    try {
      const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
      const client = getSupabaseClient();

      const { data, error } = await client
        .from('user_recipe_tracking')
        .select(`
          difficulty_rating,
          taste_rating,
          would_make_again,
          preparation_time_actual,
          meal_type,
          recipes(
            category,
            difficulty,
            prep_time_minutes,
            sopk_benefits,
            main_nutrients,
            glycemic_index_category
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (error && error.code !== 'PGRST116') {
        return { data: null };
      }

      const trackings = data || [];

      const stats = {
        totalRecipesMade: trackings.length,
        averageTasteRating: 0,
        averageDifficultyRating: 0,
        favoriteRate: 0,
        mostCookedCategory: null,
        preferredDifficulty: null,
        totalCookingTime: 0,
        averageCookingTime: 0,
        topBenefits: {},
        mealTypeDistribution: {},
        nutritionFocus: {}
      };

      if (trackings.length === 0) {
        return { data: stats };
      }

      // Calculs des moyennes
      const tasteRatings = trackings.filter(t => t.taste_rating).map(t => t.taste_rating);
      const difficultyRatings = trackings.filter(t => t.difficulty_rating).map(t => t.difficulty_rating);
      const favorites = trackings.filter(t => t.would_make_again === true);

      stats.averageTasteRating = tasteRatings.length > 0
        ? Math.round(tasteRatings.reduce((sum, r) => sum + r, 0) / tasteRatings.length * 10) / 10
        : 0;

      stats.averageDifficultyRating = difficultyRatings.length > 0
        ? Math.round(difficultyRatings.reduce((sum, r) => sum + r, 0) / difficultyRatings.length * 10) / 10
        : 0;

      stats.favoriteRate = Math.round((favorites.length / trackings.length) * 100);

      // Analyse par catégorie, difficulté, bénéfices, etc.
      const categoryCount = {};
      const difficultyCount = {};
      const benefitsCount = {};
      const mealTypeCount = {};
      const nutrientCount = {};

      trackings.forEach(tracking => {
        const recipe = tracking.recipes;

        // Répartition par type de repas
        if (tracking.meal_type) {
          mealTypeCount[tracking.meal_type] = (mealTypeCount[tracking.meal_type] || 0) + 1;
        }

        if (recipe) {
          // Catégories
          categoryCount[recipe.category] = (categoryCount[recipe.category] || 0) + 1;

          // Difficultés
          difficultyCount[recipe.difficulty] = (difficultyCount[recipe.difficulty] || 0) + 1;

          // Bénéfices SOPK
          recipe.sopk_benefits?.forEach(benefit => {
            benefitsCount[benefit] = (benefitsCount[benefit] || 0) + 1;
          });

          // Nutriments principaux
          recipe.main_nutrients?.forEach(nutrient => {
            nutrientCount[nutrient] = (nutrientCount[nutrient] || 0) + 1;
          });

          // Temps de préparation
          if (tracking.preparation_time_actual) {
            stats.totalCookingTime += tracking.preparation_time_actual;
          } else if (recipe.prep_time_minutes) {
            stats.totalCookingTime += recipe.prep_time_minutes;
          }
        }
      });

      // Trouvez la catégorie/difficulté préférée
      stats.mostCookedCategory = Object.keys(categoryCount).reduce((a, b) =>
        categoryCount[a] > categoryCount[b] ? a : b, null
      );

      stats.preferredDifficulty = Object.keys(difficultyCount).reduce((a, b) =>
        difficultyCount[a] > difficultyCount[b] ? a : b, null
      );

      stats.averageCookingTime = Math.round(stats.totalCookingTime / trackings.length);

      // Top 3 des bénéfices recherchés
      stats.topBenefits = Object.entries(benefitsCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .reduce((obj, [benefit, count]) => {
          obj[benefit] = count;
          return obj;
        }, {});

      // Répartition des types de repas
      stats.mealTypeDistribution = mealTypeCount;

      // Focus nutritionnel
      stats.nutritionFocus = Object.entries(nutrientCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .reduce((obj, [nutrient, count]) => {
          obj[nutrient] = count;
          return obj;
        }, {});

      return { data: stats };
    } catch (error) {
      return { data: null };
    }
  },

  /**
   * Obtenir des recommandations basées sur l'historique
   */
  async getPersonalizedRecommendations(userId) {
    try {
      const { data: stats } = await this.getUserCookingStats(userId);
      const { data: favorites } = await this.getFavoriteMeals(userId);

      const recommendations = {
        message: '',
        suggestedCategories: [],
        suggestedDifficulties: [],
        focusAreas: []
      };

      if (!stats || stats.totalRecipesMade === 0) {
        recommendations.message = "Commence par des recettes faciles pour découvrir tes préférences !";
        recommendations.suggestedCategories = ['breakfast', 'snack'];
        recommendations.suggestedDifficulties = ['beginner', 'easy'];
      } else {
        if (stats.averageTasteRating >= 4) {
          recommendations.message = "Tu sembles aimer cuisiner ! Prêt·e pour un nouveau défi ?";
          recommendations.suggestedDifficulties = ['medium'];
        }

        if (stats.mostCookedCategory) {
          recommendations.suggestedCategories = [stats.mostCookedCategory];
        }

        if (stats.favoriteRate < 50) {
          recommendations.message = "Essayons de trouver des recettes plus adaptées à tes goûts !";
        }

        // Recommandations basées sur les bénéfices SOPK les plus recherchés
        if (Object.keys(stats.topBenefits).length > 0) {
          recommendations.focusAreas = Object.keys(stats.topBenefits);
        }
      }

      return { data: recommendations };
    } catch (error) {
      return { data: null };
    }
  }
};

export default trackingService;