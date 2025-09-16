/**
 * 🍽️ Hook Suggestions de Repas
 *
 * Hook principal pour la gestion des suggestions nutritionnelles
 * personnalisées selon le contexte SOPK et les préférences utilisateur.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import nutritionService from '../services/nutritionService';
import trackingService from '../services/trackingService';
import SuggestionEngine from '../utils/suggestionLogic';

export const useMealSuggestions = (context = {}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allMeals, setAllMeals] = useState([]);

  // Mémoriser les valeurs du contexte pour éviter les re-renders
  const stableContext = useMemo(() => ({
    userId: context.userId,
    symptoms: context.symptoms || [],
    cyclePhase: context.cyclePhase,
    timeOfDay: context.timeOfDay,
    maxPrepTime: context.maxPrepTime || 30
  }), [context.userId, JSON.stringify(context.symptoms || []), context.cyclePhase, context.timeOfDay, context.maxPrepTime]);

  // Chargement initial de tous les repas
  const loadAllMeals = useCallback(async () => {
    try {
      const { data } = await nutritionService.getAllMealSuggestions();
      setAllMeals(data || []);
    } catch (err) {
      console.error('❌ useMealSuggestions - Erreur chargement:', err);
      setAllMeals([]);
    }
  }, []);

  // Génération des suggestions personnalisées
  const generateSuggestions = useCallback(async (customContext = {}) => {
    if (allMeals.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Enrichir le contexte avec les données utilisateur
      const enrichedContext = {
        ...stableContext,
        ...customContext,
        allMeals
      };

      // Récupérer les préférences utilisateur si disponible
      if (enrichedContext.userId) {
        const { data: preferences } = await nutritionService.getUserPreferences(
          enrichedContext.userId
        );
        enrichedContext.preferences = preferences || {};
      }

      // Récupérer l'historique récent si disponible
      if (enrichedContext.userId) {
        const { data: recentMeals } = await trackingService.getRecentMeals(
          enrichedContext.userId,
          7
        );
        enrichedContext.recentMeals = recentMeals || [];
      }

      // Générer les suggestions avec l'algorithme
      const newSuggestions = SuggestionEngine.generateSuggestions(enrichedContext);
      setSuggestions(newSuggestions);

    } catch (err) {

      setError(err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [allMeals, stableContext]);

  // Rafraîchir les suggestions
  const refreshSuggestions = useCallback(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  // Tracker un repas choisi
  const trackMealChosen = useCallback(async (mealId, mealType, feedback = {}) => {
    if (!stableContext.userId) {

      return;
    }

    try {
      await trackingService.trackMealConsumption(
        stableContext.userId,
        mealId,
        mealType,
        feedback
      );

      // Regénérer les suggestions pour prendre en compte le nouveau choix
      generateSuggestions();

      return { success: true };
    } catch (err) {

      return { success: false, error: err };
    }
  }, [stableContext.userId, generateSuggestions]);

  // Obtenir une suggestion rapide (pour dashboard)
  const getQuickSuggestion = useCallback(() => {
    if (suggestions.length === 0) return null;
    return suggestions[0];
  }, [suggestions]);

  // Rechercher des repas avec filtres
  const searchMeals = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await nutritionService.searchMeals(filters);
      return { data: data || [] };
    } catch (err) {

      setError(err);
      return { data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtenir repas par catégorie
  const getMealsByCategory = useCallback(async (category) => {
    try {
      const { data } = await nutritionService.getMealsByCategory(category);
      return { data: data || [] };
    } catch (err) {

      return { data: [] };
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadAllMeals();
  }, [loadAllMeals]);

  // Génération automatique quand les données sont prêtes
  useEffect(() => {
    if (allMeals.length > 0) {
      generateSuggestions();
    }
  }, [allMeals, stableContext.symptoms, stableContext.cyclePhase, generateSuggestions]);

  return {
    // Données
    suggestions,
    allMeals,
    loading,
    error,

    // Actions
    refreshSuggestions,
    trackMealChosen,
    searchMeals,
    getMealsByCategory,

    // Utilitaires
    getQuickSuggestion,

    // État interne
    isReady: allMeals.length > 0
  };
};