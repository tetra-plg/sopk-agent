/**
 * 🍽️ Service Recettes Détaillées
 *
 * Gestion des recettes complètes avec mode cuisine guidé SOPK.
 */

import { supabase } from '../../../shared/services/supabase';
import { supabaseDev, isDevelopment } from '../../../shared/services/supabaseDev';

const getSupabaseClient = () => {
  return isDevelopment ? supabaseDev : supabase;
};

const recipeService = {
  /**
   * Récupérer toutes les recettes
   */
  async getAllRecipes(filters = {}) {
    try {
      const client = getSupabaseClient();
      let query = client
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtres optionnels
      if (filters.category && filters.category !== 'any') {
        query = query.eq('category', filters.category);
      }

      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters.maxPrepTime) {
        query = query.lte('prep_time_minutes', filters.maxPrepTime);
      }

      if (filters.sopkBenefits && filters.sopkBenefits.length > 0) {
        query = query.overlaps('sopk_benefits', filters.sopkBenefits);
      }

      if (filters.dietaryTags && filters.dietaryTags.length > 0) {
        query = query.overlaps('dietary_tags', filters.dietaryTags);
      }

      if (filters.season) {
        query = query.overlaps('season', [filters.season]);
      }

      if (filters.glycemicIndex) {
        query = query.eq('glycemic_index_category', filters.glycemicIndex);
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {

        throw error;
      }

      return { data: data || [] };
    } catch (error) {

      return { data: [] };
    }
  },

  /**
   * Récupérer une recette par ID
   */
  async getRecipeById(recipeId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error && error.code !== 'PGRST116') {

        throw error;
      }

      return { data: data || null };
    } catch (error) {

      return { data: null };
    }
  },

  /**
   * Rechercher des recettes par mots-clés
   */
  async searchRecipes(searchTerm) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('recipes')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('title');

      if (error && error.code !== 'PGRST116') {

        throw error;
      }

      return { data: data || [] };
    } catch (error) {

      return { data: [] };
    }
  },

  /**
   * Récupérer recettes par bénéfices SOPK
   */
  async getRecipesByBenefits(benefits = []) {
    if (benefits.length === 0) {
      return { data: [] };
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('recipes')
        .select('*')
        .overlaps('sopk_benefits', benefits)
        .order('prep_time_minutes');

      if (error && error.code !== 'PGRST116') {

        throw error;
      }

      return { data: data || [] };
    } catch (error) {

      return { data: [] };
    }
  },

  /**
   * Récupérer recettes par catégorie
   */
  async getRecipesByCategory(category) {
    return this.getAllRecipes({ category });
  },

  /**
   * Récupérer recettes rapides (< 20 min)
   */
  async getQuickRecipes() {
    return this.getAllRecipes({ maxPrepTime: 20 });
  },

  /**
   * Récupérer recettes pour débutants
   */
  async getBeginnerRecipes() {
    return this.getAllRecipes({ difficulty: 'beginner' });
  },

  /**
   * Récupérer recettes par saison
   */
  async getSeasonalRecipes(season = null) {
    const currentSeason = season || this.getCurrentSeason();
    return this.getAllRecipes({ season: currentSeason });
  },

  /**
   * Récupérer les recettes les mieux notées
   * (basé sur les trackings utilisateur)
   */
  async getTopRatedRecipes(limit = 10) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .rpc('get_top_rated_recipes', { recipe_limit: limit });

      if (error) {
        // Fallback si la fonction RPC n'existe pas encore
        return this.getAllRecipes();
      }

      return { data: data || [] };
    } catch (error) {

      // Fallback
      return this.getAllRecipes();
    }
  },

  /**
   * Créer une nouvelle recette (pour admin)
   */
  async createRecipe(recipeData) {
    try {
      const client = getSupabaseClient();

      // Validation des données requises
      if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
        throw new Error('Données requises manquantes: title, ingredients, instructions');
      }

      const { data, error } = await client
        .from('recipes')
        .insert({
          title: recipeData.title,
          description: recipeData.description || '',
          category: recipeData.category,
          prep_time_minutes: recipeData.prep_time_minutes,
          cook_time_minutes: recipeData.cook_time_minutes || 0,
          servings: recipeData.servings || 4,
          difficulty: recipeData.difficulty,
          glycemic_index_category: recipeData.glycemic_index_category,
          nutritional_info: recipeData.nutritional_info || {},
          sopk_benefits: recipeData.sopk_benefits || [],
          allergen_info: recipeData.allergen_info || [],
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          equipment_needed: recipeData.equipment_needed || [],
          variations: recipeData.variations || [],
          storage_tips: recipeData.storage_tips || '',
          season: recipeData.season || ['spring', 'summer', 'autumn', 'winter'],
          dietary_tags: recipeData.dietary_tags || []
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
   * Mettre à jour une recette
   */
  async updateRecipe(recipeId, updates) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('recipes')
        .update(updates)
        .eq('id', recipeId)
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
   * Supprimer une recette
   */
  async deleteRecipe(recipeId) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) {

        throw error;
      }

      return { success: true };
    } catch (error) {

      throw error;
    }
  },

  /**
   * Utilitaire: déterminer la saison actuelle
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1; // Janvier = 1
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  },

  /**
   * Obtenir les statistiques des recettes
   */
  async getRecipeStats() {
    try {
      const { data: recipes } = await this.getAllRecipes();

      const stats = {
        total: recipes.length,
        byCategory: {},
        byDifficulty: {},
        averagePrepTime: 0,
        mostCommonBenefits: {}
      };

      recipes.forEach(recipe => {
        // Par catégorie
        stats.byCategory[recipe.category] = (stats.byCategory[recipe.category] || 0) + 1;

        // Par difficulté
        stats.byDifficulty[recipe.difficulty] = (stats.byDifficulty[recipe.difficulty] || 0) + 1;

        // Bénéfices SOPK les plus fréquents
        recipe.sopk_benefits?.forEach(benefit => {
          stats.mostCommonBenefits[benefit] = (stats.mostCommonBenefits[benefit] || 0) + 1;
        });
      });

      // Temps de préparation moyen
      const totalPrepTime = recipes.reduce((sum, recipe) => sum + recipe.prep_time_minutes, 0);
      stats.averagePrepTime = recipes.length > 0 ? Math.round(totalPrepTime / recipes.length) : 0;

      return { data: stats };
    } catch (error) {

      return { data: null };
    }
  }
};

export default recipeService;