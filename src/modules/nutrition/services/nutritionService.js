/**
 * 🍽️ Service Nutrition
 *
 * Gestion des appels API pour les suggestions et préférences nutrition.
 */

import { supabase } from '../../../shared/services/supabase';
import { supabaseDev, isDevelopment } from '../../../shared/services/supabaseDev';

const getSupabaseClient = () => {
  return isDevelopment ? supabaseDev : supabase;
};

const nutritionService = {
  /**
   * Récupérer toutes les suggestions de repas
   */
  async getAllMealSuggestions() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('meal_suggestions')
      .select('*')
      .order('name');

    if (error && error.code !== 'PGRST116') {

      throw error;
    }

    return { data: data || [] };
  },

  /**
   * Rechercher des repas par critères
   */
  async searchMeals(filters = {}) {
    const client = getSupabaseClient();
    let query = client.from('meal_suggestions').select('*');

    if (filters.category && filters.category !== 'any') {
      query = query.eq('category', filters.category);
    }

    if (filters.maxPrepTime) {
      query = query.lte('prep_time_minutes', filters.maxPrepTime);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.symptomTargets && filters.symptomTargets.length > 0) {
      query = query.overlaps('symptom_targets', filters.symptomTargets);
    }

    if (filters.cyclePhase && filters.cyclePhase !== 'any') {
      query = query.overlaps('cycle_phases', [filters.cyclePhase, 'any']);
    }

    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      query = query.overlaps('dietary_restrictions', filters.dietaryRestrictions);
    }

    const { data, error } = await query.order('name');

    if (error && error.code !== 'PGRST116') {

      throw error;
    }

    return { data: data || [] };
  },

  /**
   * Obtenir un repas par ID
   */
  async getMealById(mealId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('meal_suggestions')
      .select('*')
      .eq('id', mealId)
      .limit(1);

    if (error && error.code !== 'PGRST116') {

      throw error;
    }

    return { data: data?.[0] || null };
  },

  /**
   * Obtenir repas par catégorie
   */
  async getMealsByCategory(category) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('meal_suggestions')
      .select('*')
      .eq('category', category)
      .order('prep_time_minutes');

    if (error && error.code !== 'PGRST116') {

      throw error;
    }

    return { data: data || [] };
  },

  /**
   * Obtenir repas pour symptômes spécifiques
   */
  async getMealsForSymptoms(symptoms = []) {
    if (symptoms.length === 0) {
      return { data: [] };
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('meal_suggestions')
      .select('*')
      .overlaps('symptom_targets', symptoms)
      .order('prep_time_minutes');

    if (error && error.code !== 'PGRST116') {

      throw error;
    }

    return { data: data || [] };
  },

  /**
   * Obtenir les préférences nutrition d'un utilisateur
   */
  async getUserPreferences(userId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_nutrition_preferences')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error && error.code !== 'PGRST116') {

      return { data: null };
    }

    return { data: data?.[0] || null };
  },

  /**
   * Sauvegarder les préférences nutrition d'un utilisateur
   */
  async saveUserPreferences(userId, preferences) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('user_nutrition_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      }, {
        onConflict: 'user_id'
      })
      .select('*')
      .limit(1);

    if (error) {

      throw error;
    }

    return { data: data?.[0] };
  }
};

export default nutritionService;