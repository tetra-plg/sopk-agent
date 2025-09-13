/**
 * 🌬️ Service Techniques de Respiration
 *
 * Gestion des appels API pour récupérer les techniques de respiration
 * depuis la base de données Supabase.
 */

import { supabase } from '../../../shared/services/supabase';
import { supabaseDev, isDevelopment } from '../../../shared/services/supabaseDev';

const getSupabaseClient = () => {
  return isDevelopment ? supabaseDev : supabase;
};

const breathingTechniquesService = {
  /**
   * Récupérer toutes les techniques de respiration actives
   */
  async getAllTechniques() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('breathing_techniques')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur récupération techniques:', error);
      throw error;
    }

    return { data: data || [] };
  },

  /**
   * Récupérer une technique par son ID
   */
  async getTechniqueById(techniqueId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('breathing_techniques')
      .select('*')
      .eq('id', techniqueId)
      .eq('is_active', true)
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur récupération technique:', error);
      throw error;
    }

    return { data: data?.[0] || null };
  },

  /**
   * Récupérer les techniques par niveau de difficulté
   */
  async getTechniquesByDifficulty(difficulty) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('breathing_techniques')
      .select('*')
      .eq('difficulty', difficulty)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur récupération techniques par difficulté:', error);
      throw error;
    }

    return { data: data || [] };
  },

  /**
   * Récupérer les techniques recommandées pour débutants
   */
  async getBeginnerTechniques() {
    return this.getTechniquesByDifficulty('beginner');
  }
};

export default breathingTechniquesService;