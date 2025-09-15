/**
 * 📊 Service Tracking Recettes
 *
 * Gestion du suivi des recettes cuisinées et testées par les utilisatrices.
 */

import { getSupabaseClient } from '../../../shared/services/supabaseDev';

const recipeTrackingService = {
  /**
   * Enregistrer qu'une recette a été faite
   */
  async trackRecipe(userId, recipeId, trackingData = {}) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_recipe_tracking')
        .insert({
          user_id: userId,
          recipe_id: recipeId,
          date_cooked: trackingData.date_cooked || new Date().toISOString().split('T')[0],
          servings_made: trackingData.servings_made || 4,
          difficulty_rating: trackingData.difficulty_rating || null,
          taste_rating: trackingData.taste_rating || null,
          would_make_again: trackingData.would_make_again || null,
          preparation_time_actual: trackingData.preparation_time_actual || null,
          notes: trackingData.notes || ''
        })
        .select()
        .single();

      if (error) {

        throw error;
      }

      return { data };
    } catch (error) {

      throw error;
    }
  },

  /**
   * Mettre à jour le feedback d'une recette déjà trackée
   */
  async updateRecipeFeedback(trackingId, feedback) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_recipe_tracking')
        .update({
          difficulty_rating: feedback.difficulty_rating,
          taste_rating: feedback.taste_rating,
          would_make_again: feedback.would_make_again,
          preparation_time_actual: feedback.preparation_time_actual,
          notes: feedback.notes
        })
        .eq('id', trackingId)
        .select()
        .single();

      if (error) {

        throw error;
      }

      return { data };
    } catch (error) {

      throw error;
    }
  },

  /**
   * Récupérer les recettes récemment cuisinées par un utilisateur
   */
  async getRecentRecipes(userId, days = 7) {
    try {
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
            difficulty,
            prep_time_minutes,
            sopk_benefits,
            dietary_tags
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {

        return { data: [] };
      }

      return { data: data || [] };
    } catch (error) {

      return { data: [] };
    }
  },

  /**
   * Récupérer l'historique complet des recettes d'un utilisateur
   */
  async getRecipeHistory(userId, limit = 50) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_recipe_tracking')
        .select(`
          *,
          recipes(
            id,
            title,
            category,
            difficulty,
            prep_time_minutes,
            sopk_benefits,
            dietary_tags
          )
        `)
        .eq('user_id', userId)
        .order('date_made', { ascending: false })
        .limit(limit);

      if (error && error.code !== 'PGRST116') {

        return { data: [] };
      }

      return { data: data || [] };
    } catch (error) {

      return { data: [] };
    }
  },

  /**
   * Récupérer les recettes favorites d'un utilisateur
   */
  async getFavoriteRecipes(userId) {
    try {
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

      // Déduplication des recettes favorites
      const uniqueRecipes = [];
      const seenRecipeIds = new Set();

      for (const item of data || []) {
        if (!seenRecipeIds.has(item.recipe_id)) {
          seenRecipeIds.add(item.recipe_id);
          uniqueRecipes.push(item.recipes);
        }
      }

      return { data: uniqueRecipes };
    } catch (error) {

      return { data: [] };
    }
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
          recipes(
            category,
            difficulty,
            prep_time_minutes,
            sopk_benefits
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
        topBenefits: {}
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

      // Catégorie la plus cuisinée
      const categoryCount = {};
      const difficultyCount = {};
      const benefitsCount = {};

      trackings.forEach(tracking => {
        const recipe = tracking.recipes;
        if (recipe) {
          // Catégories
          categoryCount[recipe.category] = (categoryCount[recipe.category] || 0) + 1;

          // Difficultés
          difficultyCount[recipe.difficulty] = (difficultyCount[recipe.difficulty] || 0) + 1;

          // Bénéfices SOPK
          recipe.sopk_benefits?.forEach(benefit => {
            benefitsCount[benefit] = (benefitsCount[benefit] || 0) + 1;
          });

          // Temps de préparation
          if (tracking.preparation_time_actual) {
            stats.totalCookingTime += tracking.preparation_time_actual;
          } else if (recipe.prep_time_minutes) {
            stats.totalCookingTime += recipe.prep_time_minutes;
          }
        }
      });

      // Trouvée la catégorie/difficulté préférée
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

      return { data: stats };
    } catch (error) {

      return { data: null };
    }
  },

  /**
   * Supprimer un tracking de recette
   */
  async deleteRecipeTracking(trackingId) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('user_recipe_tracking')
        .delete()
        .eq('id', trackingId);

      if (error) {

        throw error;
      }

      return { success: true };
    } catch (error) {

      throw error;
    }
  },

  /**
   * Obtenir des recommandations basées sur l'historique
   */
  async getPersonalizedRecommendations(userId) {
    try {
      const { data: stats } = await this.getUserCookingStats(userId);
      const { data: favorites } = await this.getFavoriteRecipes(userId);

      // Logique de recommandation simple
      const recommendations = {
        message: '',
        suggestedCategories: [],
        suggestedDifficulties: []
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
      }

      return { data: recommendations };
    } catch (error) {

      return { data: null };
    }
  }
};

export default recipeTrackingService;