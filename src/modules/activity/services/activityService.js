/**
 * 🏃‍♀️ Service pour la gestion des sessions d'activité physique
 *
 * Gère les opérations CRUD sur les sessions d'activité et le tracking utilisateur.
 */

import { supabase } from '../../../shared/services/supabase';

const activityService = {
  // ===== GESTION DES SESSIONS =====

  /**
   * Récupère toutes les sessions d'activité disponibles
   */
  async getSessions(filters = {}) {
    try {
      let query = supabase
        .from('activity_sessions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Filtres optionnels
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters.max_duration) {
        query = query.lte('duration_minutes', filters.max_duration);
      }

      if (filters.sopk_symptoms && filters.sopk_symptoms.length > 0) {
        query = query.overlaps('sopk_symptoms', filters.sopk_symptoms);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur récupération sessions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getSessions:', error);
      throw error;
    }
  },

  /**
   * Récupère une session par son ID
   */
  async getSessionById(sessionId) {
    try {
      const { data, error } = await supabase
        .from('activity_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erreur récupération session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans getSessionById:', error);
      throw error;
    }
  },

  /**
   * Récupère les sessions par catégorie
   */
  async getSessionsByCategory(category) {
    return this.getSessions({ category });
  },

  // ===== TRACKING UTILISATEUR =====

  /**
   * Démarre une nouvelle session pour un utilisateur
   */
  async startSession(userId, sessionId, preSessionData = {}) {
    try {
      const { data, error } = await supabase
        .from('user_activity_tracking')
        .insert({
          user_id: userId,
          session_id: sessionId,
          status: 'started',
          pre_energy_level: preSessionData.energyLevel,
          pre_pain_level: preSessionData.painLevel,
          pre_mood_score: preSessionData.moodScore,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur démarrage session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans startSession:', error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une session en cours
   */
  async updateSession(trackingId, updateData) {
    try {
      const { data, error } = await supabase
        .from('user_activity_tracking')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingId)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour session:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans updateSession:', error);
      throw error;
    }
  },

  /**
   * Termine une session avec feedback post-session
   */
  async completeSession(trackingId, postSessionData = {}) {
    try {
      const updateData = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: postSessionData.durationSeconds,
        completion_percentage: postSessionData.completionPercentage || 100,
        post_energy_level: postSessionData.energyLevel,
        post_pain_level: postSessionData.painLevel,
        post_mood_score: postSessionData.moodScore,
        session_notes: postSessionData.notes,
        difficulty_felt: postSessionData.difficultyFelt
      };

      return await this.updateSession(trackingId, updateData);
    } catch (error) {
      console.error('Erreur dans completeSession:', error);
      throw error;
    }
  },

  /**
   * Abandonne une session
   */
  async abandonSession(trackingId, reason = '') {
    try {
      const updateData = {
        status: 'abandoned',
        session_notes: reason,
        completion_percentage: 0
      };

      return await this.updateSession(trackingId, updateData);
    } catch (error) {
      console.error('Erreur dans abandonSession:', error);
      throw error;
    }
  },

  // ===== HISTORIQUE ET STATISTIQUES =====

  /**
   * Récupère l'historique des sessions d'un utilisateur
   */
  async getUserHistory(userId, filters = {}) {
    try {
      let query = supabase
        .from('user_activity_tracking')
        .select(`
          *,
          activity_sessions (
            title,
            category,
            duration_minutes,
            thumbnail_url
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      // Filtres optionnels
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.dateFrom) {
        query = query.gte('started_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('started_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur récupération historique:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getUserHistory:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques d'activité d'un utilisateur
   */
  async getUserStats(userId, period = 'week') {
    try {
      const endDate = new Date();
      let startDate = new Date();

      // Définir la période
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const { data, error } = await supabase
        .from('user_activity_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString());

      if (error) {
        console.error('Erreur récupération stats:', error);
        throw error;
      }

      const sessions = data || [];

      // Calculer les statistiques
      const stats = {
        totalSessions: sessions.length,
        totalMinutes: sessions.reduce((sum, session) => sum + (session.duration_seconds / 60), 0),
        avgEnergyImprovement: 0,
        avgPainReduction: 0,
        avgMoodImprovement: 0,
        completionRate: 100,
        mostFrequentCategory: null,
        currentStreak: 0
      };

      // Moyennes d'amélioration
      if (sessions.length > 0) {
        const sessionsWithFeedback = sessions.filter(s =>
          s.pre_energy_level && s.post_energy_level &&
          s.pre_pain_level && s.post_pain_level &&
          s.pre_mood_score && s.post_mood_score
        );

        if (sessionsWithFeedback.length > 0) {
          stats.avgEnergyImprovement = sessionsWithFeedback.reduce((sum, s) =>
            sum + (s.post_energy_level - s.pre_energy_level), 0) / sessionsWithFeedback.length;

          stats.avgPainReduction = sessionsWithFeedback.reduce((sum, s) =>
            sum + (s.pre_pain_level - s.post_pain_level), 0) / sessionsWithFeedback.length;

          stats.avgMoodImprovement = sessionsWithFeedback.reduce((sum, s) =>
            sum + (s.post_mood_score - s.pre_mood_score), 0) / sessionsWithFeedback.length;
        }
      }

      return stats;
    } catch (error) {
      console.error('Erreur dans getUserStats:', error);
      throw error;
    }
  },

  /**
   * Récupère les recommandations personnalisées
   */
  async getPersonalizedRecommendations(userId) {
    try {
      // Récupérer l'historique récent pour analyser les préférences
      const recentHistory = await this.getUserHistory(userId, {
        limit: 10,
        status: 'completed'
      });

      // Logique de recommandation basée sur l'historique
      const recommendations = [];

      if (recentHistory.length === 0) {
        // Utilisateur nouveau - recommandations par défaut
        const beginnerSessions = await this.getSessions({
          difficulty_level: 1,
          max_duration: 15
        });

        recommendations.push(...beginnerSessions.slice(0, 3));
      } else {
        // Recommandations basées sur les préférences
        const completedCategories = [...new Set(recentHistory.map(h => h.activity_sessions?.category).filter(Boolean))];

        for (const category of completedCategories) {
          const sessions = await this.getSessionsByCategory(category);
          const notDoneYet = sessions.filter(s =>
            !recentHistory.some(h => h.session_id === s.id)
          );

          if (notDoneYet.length > 0) {
            recommendations.push(notDoneYet[0]);
          }
        }
      }

      return recommendations.slice(0, 5); // Max 5 recommandations
    } catch (error) {
      console.error('Erreur dans getPersonalizedRecommendations:', error);
      throw error;
    }
  }
};

export default activityService;