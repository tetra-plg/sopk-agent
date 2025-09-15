/**
 * 👤 Service Profil Utilisateur
 *
 * Gestion des profils étendus des utilisatrices SOPK avec préférences et objectifs.
 */

import { getSupabaseClient } from './supabaseDev';

const userProfileService = {
  /**
   * Récupérer le profil complet d'un utilisateur
   */
  async getUserProfile(userId) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {

        return { data: null };
      }

      return { data: data || null };
    } catch (error) {

      return { data: null };
    }
  },

  /**
   * Créer ou mettre à jour le profil d'un utilisateur
   */
  async saveUserProfile(userId, profileData) {
    try {
      const client = getSupabaseClient();

      // Validation des données de base
      if (!profileData.first_name) {
        throw new Error('Le prénom est requis');
      }

      const { data, error } = await client
        .from('user_profiles')
        .upsert({
          user_id: userId,
          first_name: profileData.first_name,
          preferred_name: profileData.preferred_name || profileData.first_name,
          date_of_birth: profileData.date_of_birth || null,
          sopk_diagnosis_year: profileData.sopk_diagnosis_year || null,
          current_symptoms: profileData.current_symptoms || [],
          severity_level: profileData.severity_level || null,
          timezone: profileData.timezone || 'Europe/Paris',
          language_preference: profileData.language_preference || 'fr',
          primary_goals: profileData.primary_goals || [],
          notification_preferences: profileData.notification_preferences || {},
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
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
   * Mettre à jour partiellement le profil
   */
  async updateUserProfile(userId, updates) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
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
   * Supprimer le profil d'un utilisateur
   */
  async deleteUserProfile(userId) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {

        throw error;
      }

      return { success: true };
    } catch (error) {

      throw error;
    }
  },

  /**
   * Vérifier si un utilisateur a un profil complété
   */
  async isProfileComplete(userId) {
    try {
      const { data: profile } = await this.getUserProfile(userId);

      if (!profile) {
        return { complete: false, missing: ['all'] };
      }

      const required = ['first_name', 'date_of_birth', 'sopk_diagnosis_year'];
      const missing = required.filter(field => !profile[field]);

      return {
        complete: missing.length === 0,
        missing: missing,
        completionRate: Math.round(((required.length - missing.length) / required.length) * 100)
      };
    } catch (error) {

      return { complete: false, missing: ['unknown'] };
    }
  },

  /**
   * Mettre à jour les symptômes actuels
   */
  async updateCurrentSymptoms(userId, symptoms) {
    return this.updateUserProfile(userId, { current_symptoms: symptoms });
  },

  /**
   * Mettre à jour les objectifs
   */
  async updatePrimaryGoals(userId, goals) {
    return this.updateUserProfile(userId, { primary_goals: goals });
  },

  /**
   * Mettre à jour le niveau de sévérité
   */
  async updateSeverityLevel(userId, level) {
    return this.updateUserProfile(userId, { severity_level: level });
  },

  /**
   * Mettre à jour les préférences de notification
   */
  async updateNotificationPreferences(userId, preferences) {
    return this.updateUserProfile(userId, { notification_preferences: preferences });
  },

  /**
   * Calculer l'âge à partir de la date de naissance
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;

    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  },

  /**
   * Calculer la durée depuis le diagnostic SOPK
   */
  calculateYearsSinceDiagnosis(diagnosisYear) {
    if (!diagnosisYear) return null;
    return new Date().getFullYear() - diagnosisYear;
  },

  /**
   * Obtenir un résumé du profil pour affichage
   */
  async getProfileSummary(userId) {
    try {
      const { data: profile } = await this.getUserProfile(userId);

      if (!profile) {
        return { data: null };
      }

      const summary = {
        name: profile.preferred_name || profile.first_name,
        age: this.calculateAge(profile.date_of_birth),
        yearsSinceDiagnosis: this.calculateYearsSinceDiagnosis(profile.sopk_diagnosis_year),
        severityLevel: profile.severity_level,
        symptomsCount: profile.current_symptoms?.length || 0,
        goalsCount: profile.primary_goals?.length || 0,
        isComplete: (await this.isProfileComplete(userId)).complete
      };

      return { data: summary };
    } catch (error) {

      return { data: null };
    }
  },

  /**
   * Obtenir des recommandations personnalisées basées sur le profil
   */
  async getPersonalizedRecommendations(userId) {
    try {
      const { data: profile } = await this.getUserProfile(userId);

      if (!profile) {
        return {
          data: {
            message: "Complète ton profil pour recevoir des recommandations personnalisées !",
            recommendations: []
          }
        };
      }

      const recommendations = [];

      // Recommandations basées sur les symptômes
      if (profile.current_symptoms?.includes('fatigue')) {
        recommendations.push({
          type: 'activity',
          title: 'Exercices énergisants',
          description: 'Des séances courtes pour combattre la fatigue',
          action: 'explore_activities',
          priority: 'high'
        });
      }

      if (profile.current_symptoms?.includes('stress')) {
        recommendations.push({
          type: 'stress',
          title: 'Techniques de respiration',
          description: 'Apprendre à gérer le stress au quotidien',
          action: 'breathing_exercises',
          priority: 'high'
        });
      }

      if (profile.current_symptoms?.includes('irregular_cycles')) {
        recommendations.push({
          type: 'tracking',
          title: 'Suivi du cycle',
          description: 'Mieux comprendre ton cycle pour mieux le gérer',
          action: 'start_cycle_tracking',
          priority: 'medium'
        });
      }

      // Recommandations basées sur la sévérité
      if (profile.severity_level === 'severe') {
        recommendations.push({
          type: 'support',
          title: 'Ressources spécialisées',
          description: 'Accès à des ressources pour les cas plus complexes',
          action: 'view_resources',
          priority: 'high'
        });
      }

      // Recommandations pour nouveaux diagnostics
      const yearsSinceDiagnosis = this.calculateYearsSinceDiagnosis(profile.sopk_diagnosis_year);
      if (yearsSinceDiagnosis !== null && yearsSinceDiagnosis < 2) {
        recommendations.push({
          type: 'education',
          title: 'Guide débutant SOPK',
          description: 'Tout ce qu\'il faut savoir quand on débute',
          action: 'view_beginner_guide',
          priority: 'medium'
        });
      }

      return {
        data: {
          message: `Salut ${profile.preferred_name || profile.first_name} ! Voici tes recommandations personnalisées :`,
          recommendations: recommendations
        }
      };
    } catch (error) {

      return { data: null };
    }
  },

  /**
   * Obtenir les statistiques du profil pour le dashboard admin
   */
  async getProfileStatistics() {
    try {
      const client = getSupabaseClient();
      const { data: profiles, error } = await client
        .from('user_profiles')
        .select('severity_level, current_symptoms, primary_goals, sopk_diagnosis_year, date_of_birth');

      if (error) {

        return { data: null };
      }

      const stats = {
        totalProfiles: profiles.length,
        bySeverity: {},
        commonSymptoms: {},
        commonGoals: {},
        ageGroups: {},
        diagnosisYears: {}
      };

      profiles.forEach(profile => {
        // Par sévérité
        if (profile.severity_level) {
          stats.bySeverity[profile.severity_level] = (stats.bySeverity[profile.severity_level] || 0) + 1;
        }

        // Symptômes les plus fréquents
        profile.current_symptoms?.forEach(symptom => {
          stats.commonSymptoms[symptom] = (stats.commonSymptoms[symptom] || 0) + 1;
        });

        // Objectifs les plus fréquents
        profile.primary_goals?.forEach(goal => {
          stats.commonGoals[goal] = (stats.commonGoals[goal] || 0) + 1;
        });

        // Groupes d'âge
        const age = this.calculateAge(profile.date_of_birth);
        if (age) {
          const ageGroup = age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : '45+';
          stats.ageGroups[ageGroup] = (stats.ageGroups[ageGroup] || 0) + 1;
        }

        // Années de diagnostic
        if (profile.sopk_diagnosis_year) {
          const yearsSince = this.calculateYearsSinceDiagnosis(profile.sopk_diagnosis_year);
          const diagnosisGroup = yearsSince < 2 ? 'recent' : yearsSince < 5 ? 'intermediate' : 'experienced';
          stats.diagnosisYears[diagnosisGroup] = (stats.diagnosisYears[diagnosisGroup] || 0) + 1;
        }
      });

      return { data: stats };
    } catch (error) {

      return { data: null };
    }
  }
};

export default userProfileService;