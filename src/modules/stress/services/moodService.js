/**
 * 😊 Service Mood Journal
 *
 * Gestion du tracking émotionnel quotidien pour utilisatrices SOPK.
 */

import { getSupabaseClient } from '../../../shared/services/supabaseDev';

const moodService = {
  /**
   * Sauvegarder ou mettre à jour l'humeur du jour
   */
  async saveMoodEntry(userId, date, moodData) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('mood_entries')
      .upsert({
        user_id: userId,
        date: typeof date === 'string' ? date : date.toISOString().split('T')[0],
        mood_emoji: moodData.mood_emoji,
        mood_score: moodData.mood_score,
        mood_tags: moodData.mood_tags || [],
        notes: moodData.notes || '',
        context_triggers: moodData.context_triggers || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })
      .select('*')
      .single();

    if (error) {

      throw error;
    }

    return { data, error };
  },

  /**
   * Récupérer l'humeur d'une date spécifique
   */
  async getMoodEntry(userId, date) {
    try {
      const client = getSupabaseClient();
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

      const { data, error } = await client
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .maybeSingle();

      // Gestion silencieuse des erreurs - ne pas bloquer l'interface
      if (error) {
        // Log uniquement en développement
        if (process.env.NODE_ENV === 'development') {
          // Mood entry not found - normal if no data
        }
        return { data: null, error: null };
      }

      return { data: data || null, error: null };
    } catch (err) {
      // Capture toute erreur réseau ou autre
      if (process.env.NODE_ENV === 'development') {
        // Error fetching mood entry - returning empty
      }
      return { data: null, error: null };
    }
  },

  /**
   * Récupérer l'historique des humeurs
   */
  async getMoodHistory(userId, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const client = getSupabaseClient();

      const { data, error } = await client
        .from('mood_entries')
        .select('date, mood_emoji, mood_score, mood_tags, context_triggers, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('date', { ascending: false });

      // Gestion silencieuse des erreurs
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          // Mood history not found - normal if no data
        }
        return { data: [], error: null };
      }

      return { data: data || [], error: null };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // Error fetching mood history - returning empty
      }
      return { data: [], error: null };
    }
  },

  /**
   * Obtenir statistiques de l'humeur
   */
  async getMoodStats(userId, period = 'week') {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 7;
    const { data: history, error } = await this.getMoodHistory(userId, days);

    if (error || !history.length) {
      return {
        avgMood: null,
        trendDirection: 'stable',
        commonEmotions: [],
        totalEntries: 0
      };
    }

    // Calculer moyenne
    const validScores = history.filter(h => h.mood_score).map(h => h.mood_score);
    const avgMood = validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length * 10) / 10
      : null;

    // Calculer tendance (comparaison première vs dernière moitié)
    let trendDirection = 'stable';
    if (validScores.length > 4) {
      const firstHalf = validScores.slice(0, Math.floor(validScores.length / 2));
      const secondHalf = validScores.slice(Math.floor(validScores.length / 2));

      const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.5) trendDirection = 'up';
      else if (secondAvg < firstAvg - 0.5) trendDirection = 'down';
    }

    // Émotions les plus fréquentes
    const emotionCounts = {};
    history.forEach(entry => {
      if (entry.mood_emoji) {
        emotionCounts[entry.mood_emoji] = (emotionCounts[entry.mood_emoji] || 0) + 1;
      }
    });

    const commonEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion, count]) => ({ emotion, count }));

    return {
      avgMood,
      trendDirection,
      commonEmotions,
      totalEntries: history.length
    };
  },

  /**
   * Supprimer une entrée d'humeur
   */
  async deleteMoodEntry(userId, date) {
    const client = getSupabaseClient();
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    const { error } = await client
      .from('mood_entries')
      .delete()
      .eq('user_id', userId)
      .eq('date', dateStr);

    if (error) {

      throw error;
    }

    return { success: true };
  },

  /**
   * Obtenir les patterns d'humeur pour suggestions
   */
  async getMoodPatterns(userId, days = 14) {
    const { data: history, error } = await this.getMoodHistory(userId, days);

    if (error || !history.length) {
      return { patterns: [], insights: [] };
    }

    const patterns = [];
    const insights = [];

    // Pattern de stress récurrent
    const stressedDays = history.filter(entry =>
      entry.mood_tags?.includes('stressed') ||
      (entry.mood_score && entry.mood_score <= 3)
    );

    if (stressedDays.length >= 3) {
      patterns.push({
        type: 'stress_frequent',
        frequency: stressedDays.length,
        severity: 'medium'
      });

      insights.push({
        type: 'suggestion',
        message: `Tu as eu ${stressedDays.length} journées difficiles ces 2 semaines. As-tu essayé nos exercices de respiration ?`,
        action: 'breathing_exercises',
        priority: 'high'
      });
    }

    // Pattern humeur basse
    const lowMoodDays = history.filter(entry =>
      entry.mood_score && entry.mood_score <= 4
    );

    if (lowMoodDays.length >= Math.floor(days * 0.3)) {
      patterns.push({
        type: 'mood_low_frequent',
        frequency: lowMoodDays.length,
        severity: 'high'
      });

      insights.push({
        type: 'encouragement',
        message: 'Tu traverses une période difficile. Prendre soin de ta santé mentale est important.',
        action: 'self_care_tips',
        priority: 'high'
      });
    }

    return { patterns, insights };
  }
};

export default moodService;