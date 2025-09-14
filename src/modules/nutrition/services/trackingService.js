/**
 * 📊 Service Tracking Nutrition
 *
 * Gestion du suivi des repas consommés par les utilisatrices.
 */

import { supabase } from '../../../shared/services/supabase';
import { supabaseDev, isDevelopment } from '../../../shared/services/supabaseDev';

const getSupabaseClient = () => {
  return isDevelopment ? supabaseDev : supabase;
};

const trackingService = {
  /**
   * Enregistrer un repas consommé
   */
  async trackMealConsumption(userId, mealId, mealType, feedback = {}) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_meal_tracking')
      .insert({
        user_id: userId,
        meal_id: mealId,
        meal_type: mealType,
        date: new Date().toISOString().split('T')[0],
        satisfaction_rating: feedback.satisfaction_rating || null,
        difficulty_felt: feedback.difficulty_felt || null,
        will_remake: feedback.will_remake || null
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
      .from('user_meal_tracking')
      .select(`
        *,
        meal_suggestions(
          id,
          name,
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
      .from('user_meal_tracking')
      .select(`
        *,
        meal_suggestions(
          id,
          name,
          category,
          main_nutrients,
          difficulty,
          prep_time_minutes
        )
      `)
      .eq('user_id', userId)
      .eq('date', today)
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
      .from('user_meal_tracking')
      .select(`
        *,
        meal_suggestions(
          id,
          name,
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
      .from('user_meal_tracking')
      .select(`
        meal_type,
        satisfaction_rating,
        will_remake,
        meal_suggestions(
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
      .from('user_meal_tracking')
      .update({
        satisfaction_rating: feedback.satisfaction_rating,
        difficulty_felt: feedback.difficulty_felt,
        will_remake: feedback.will_remake
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
      .from('user_meal_tracking')
      .delete()
      .eq('id', trackingId);

    if (error) {

      throw error;
    }

    return { success: true };
  },

  /**
   * Obtenir les repas favoris d'un utilisateur (basé sur will_remake = true)
   */
  async getFavoriteMeals(userId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_meal_tracking')
      .select(`
        meal_id,
        meal_suggestions(
          id,
          name,
          category,
          difficulty,
          prep_time_minutes,
          main_nutrients
        )
      `)
      .eq('user_id', userId)
      .eq('will_remake', true)
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {

      return { data: [] };
    }

    // Déduplication des repas favoris
    const uniqueMeals = [];
    const seenMealIds = new Set();

    for (const item of data || []) {
      if (!seenMealIds.has(item.meal_id)) {
        seenMealIds.add(item.meal_id);
        uniqueMeals.push(item.meal_suggestions);
      }
    }

    return { data: uniqueMeals };
  }
};

export default trackingService;