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
        date_cooked: new Date().toISOString().split('T')[0],
        servings_made: 1,
        taste_rating: feedback.satisfaction_rating || null,
        difficulty_rating: feedback.difficulty_felt === 'easier' ? 5 :
                         feedback.difficulty_felt === 'as_expected' ? 3 :
                         feedback.difficulty_felt === 'harder' ? 1 : null,
        would_make_again: feedback.will_remake || null,
        notes: mealType ? `Type de repas: ${mealType}` : null
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
          difficulty,
          is_simple_suggestion
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
          prep_time_minutes,
          is_simple_suggestion
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
          prep_time_minutes,
          is_simple_suggestion
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
        will_cook_again,
        recipes(
          category,
          main_nutrients,
          difficulty,
          glycemic_index_category,
          is_simple_suggestion
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
   * Obtenir les repas favoris d'un utilisateur (basé sur will_cook_again = true)
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
          is_simple_suggestion
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
  }
};

export default trackingService;