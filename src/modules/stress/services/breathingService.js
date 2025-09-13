/**
 * 🫁 SOPK Companion - Service de Respiration Guidée
 *
 * Service principal pour gérer les sessions de respiration,
 * les sauvegardes et les statistiques utilisateur.
 */

import { supabase } from '../../../shared/services/supabase';
import { validateSessionData } from '../utils/breathingTechniques';

/**
 * Service de gestion des sessions de respiration
 */
export const breathingService = {
  /**
   * Sauvegarde une session de respiration
   * @param {string} userId - ID de l'utilisateur
   * @param {object} sessionData - Données de la session
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  async saveSession(userId, sessionData) {
    try {
      // Validation des données
      const validation = validateSessionData(sessionData);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      const { data, error } = await supabase
        .from('breathing_sessions')
        .insert({
          user_id: userId,
          technique: sessionData.technique,
          duration_seconds: sessionData.duration_seconds,
          completed: sessionData.completed || false,
          interruption_reason: sessionData.interruption_reason || null,
          stress_before: sessionData.stress_before || null,
          stress_after: sessionData.stress_after || null,
          feeling_after: sessionData.feeling_after || null
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Session de respiration sauvegardée:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupère les sessions du jour pour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<{error: Error|null, data: Array|null}>}
   */
  async getTodaySessions(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('breathing_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération sessions du jour:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupère les statistiques hebdomadaires d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  async getWeeklyStats(userId) {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const { data: sessions, error } = await supabase
        .from('breathing_sessions')
        .select('technique, duration_seconds, stress_before, stress_after, completed, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calcul des statistiques
      const completedSessions = sessions.filter(s => s.completed);
      const stats = {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        totalMinutes: Math.round(completedSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60),
        averageStressReduction: calculateAverageStressReduction(completedSessions),
        favoriteTechnique: getFavoriteTechnique(completedSessions),
        dailyStats: groupSessionsByDay(sessions),
        completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupère les statistiques globales d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {number} days - Nombre de jours à analyser (défaut: 30)
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  async getAllTimeStats(userId, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data: sessions, error } = await supabase
        .from('breathing_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const completedSessions = sessions.filter(s => s.completed);
      const stats = {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        totalMinutes: Math.round(completedSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60),
        averageStressReduction: calculateAverageStressReduction(completedSessions),
        bestStressReduction: getBestStressReduction(completedSessions),
        streakDays: calculateStreak(sessions),
        techniquesUsed: getTechniquesStats(completedSessions),
        monthlyTrend: getMonthlyTrend(completedSessions)
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération statistiques globales:', error);
      return { data: null, error };
    }
  },

  /**
   * Met à jour une session existante (pour ajouter feedback par exemple)
   * @param {string} sessionId - ID de la session
   * @param {object} updates - Données à mettre à jour
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  async updateSession(sessionId, updates) {
    try {
      const { data, error } = await supabase
        .from('breathing_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur mise à jour session:', error);
      return { data: null, error };
    }
  }
};

// =====================================================
// FONCTIONS UTILITAIRES POUR LES STATISTIQUES
// =====================================================

/**
 * Calcule la réduction moyenne du stress
 * @param {Array} sessions - Sessions complétées avec données de stress
 * @returns {number} Réduction moyenne (0 si pas de données)
 */
function calculateAverageStressReduction(sessions) {
  const sessionsWithStress = sessions.filter(s =>
    s.stress_before !== null && s.stress_after !== null
  );

  if (sessionsWithStress.length === 0) return 0;

  const totalReduction = sessionsWithStress.reduce((sum, session) =>
    sum + (session.stress_before - session.stress_after), 0
  );

  return Math.round((totalReduction / sessionsWithStress.length) * 10) / 10;
}

/**
 * Trouve la technique favorite
 * @param {Array} sessions - Sessions complétées
 * @returns {string|null} Technique la plus utilisée
 */
function getFavoriteTechnique(sessions) {
  if (sessions.length === 0) return null;

  const techniqueCount = sessions.reduce((count, session) => {
    count[session.technique] = (count[session.technique] || 0) + 1;
    return count;
  }, {});

  return Object.keys(techniqueCount).reduce((a, b) =>
    techniqueCount[a] > techniqueCount[b] ? a : b
  );
}

/**
 * Trouve la meilleure réduction de stress
 * @param {Array} sessions - Sessions avec données de stress
 * @returns {number} Meilleure réduction
 */
function getBestStressReduction(sessions) {
  const reductions = sessions
    .filter(s => s.stress_before !== null && s.stress_after !== null)
    .map(s => s.stress_before - s.stress_after);

  return reductions.length > 0 ? Math.max(...reductions) : 0;
}

/**
 * Groupe les sessions par jour
 * @param {Array} sessions - Liste des sessions
 * @returns {object} Sessions groupées par date
 */
function groupSessionsByDay(sessions) {
  return sessions.reduce((groups, session) => {
    const date = new Date(session.created_at).toDateString();
    groups[date] = (groups[date] || 0) + 1;
    return groups;
  }, {});
}

/**
 * Calcule la série de jours consécutifs
 * @param {Array} sessions - Sessions complétées
 * @returns {number} Nombre de jours consécutifs
 */
function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  const completedSessions = sessions.filter(s => s.completed);
  const sessionDates = [...new Set(
    completedSessions.map(s => new Date(s.created_at).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let currentDate = new Date();

  for (const sessionDate of sessionDates) {
    const checkDate = currentDate.toDateString();

    if (sessionDate === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0 && sessionDate === new Date().toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Obtient les statistiques par technique
 * @param {Array} sessions - Sessions complétées
 * @returns {object} Statistiques par technique
 */
function getTechniquesStats(sessions) {
  const stats = sessions.reduce((acc, session) => {
    const technique = session.technique;
    if (!acc[technique]) {
      acc[technique] = {
        count: 0,
        totalMinutes: 0,
        averageStressReduction: 0,
        stressReductions: []
      };
    }

    acc[technique].count++;
    acc[technique].totalMinutes += Math.round(session.duration_seconds / 60);

    if (session.stress_before !== null && session.stress_after !== null) {
      acc[technique].stressReductions.push(session.stress_before - session.stress_after);
    }

    return acc;
  }, {});

  // Calculer les moyennes
  Object.keys(stats).forEach(technique => {
    const reductions = stats[technique].stressReductions;
    if (reductions.length > 0) {
      stats[technique].averageStressReduction = Math.round(
        (reductions.reduce((sum, r) => sum + r, 0) / reductions.length) * 10
      ) / 10;
    }
    delete stats[technique].stressReductions; // Nettoyer
  });

  return stats;
}

/**
 * Obtient la tendance mensuelle
 * @param {Array} sessions - Sessions complétées
 * @returns {Array} Données pour graphique de tendance
 */
function getMonthlyTrend(sessions) {
  const last30Days = [];
  const today = new Date();

  // Générer les 30 derniers jours
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last30Days.push({
      date: date.toISOString().split('T')[0],
      sessions: 0,
      totalMinutes: 0
    });
  }

  // Compter les sessions par jour
  sessions.forEach(session => {
    const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
    const dayData = last30Days.find(day => day.date === sessionDate);
    if (dayData) {
      dayData.sessions++;
      dayData.totalMinutes += Math.round(session.duration_seconds / 60);
    }
  });

  return last30Days;
}