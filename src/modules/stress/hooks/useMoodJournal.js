/**
 * 😊 useMoodJournal Hook
 *
 * Hook pour gérer l'état du journal d'humeur avec auto-save.
 */

import { useState, useEffect, useCallback } from 'react';
import moodService from '../services/moodService';
import { useAuth } from '../../../core/auth/AuthContext';

export const useMoodJournal = (currentDate = new Date()) => {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState({
    primary_emotion: '',
    mood_score: 5,
    emotion_tags: [],
    mood_notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);

  const dateString = currentDate.toISOString().split('T')[0];

  // Charger les données existantes
  const loadMoodData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await moodService.getMoodEntry(user.id, dateString);

      if (data) {
        setMoodData({
          primary_emotion: data.primary_emotion || '',
          mood_score: data.mood_score || 5,
          emotion_tags: data.emotion_tags || [],
          mood_notes: data.mood_notes || ''
        });
        setLastSaved(new Date(data.updated_at));
      } else {
        // Réinitialiser avec valeurs par défaut - normal si pas de données
        setMoodData({
          primary_emotion: '',
          mood_score: 5,
          emotion_tags: [],
          mood_notes: ''
        });
        setLastSaved(null);
      }
      setHasChanges(false);
    } catch (err) {
      // Gestion silencieuse des erreurs - ne pas affoler l'utilisateur
      if (process.env.NODE_ENV === 'development') {
        console.log('Could not load mood data (normal on first visit):', err.message);
      }
      // Valeurs par défaut en cas d'erreur
      setMoodData({
        primary_emotion: '',
        mood_score: 5,
        emotion_tags: [],
        mood_notes: ''
      });
      setLastSaved(null);
      setHasChanges(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, dateString]);

  // Charger au montage et changement de date
  useEffect(() => {
    loadMoodData();
  }, [loadMoodData]);

  // Sauvegarder les données
  const saveMoodData = useCallback(async (dataToSave = moodData) => {
    if (!user?.id || !dataToSave.primary_emotion) return { success: false, error: 'Données incomplètes' };

    setIsLoading(true);
    setError(null);

    try {
      await moodService.saveMoodEntry(user.id, dateString, dataToSave);
      setLastSaved(new Date());
      setHasChanges(false);
      return { success: true };
    } catch (err) {
      console.error('Erreur sauvegarde mood:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, dateString, moodData]);

  // Auto-save avec debounce
  useEffect(() => {
    if (!hasChanges || !moodData.primary_emotion) return;

    const timeoutId = setTimeout(() => {
      saveMoodData();
    }, 2000); // Auto-save après 2 secondes d'inactivité

    return () => clearTimeout(timeoutId);
  }, [hasChanges, moodData, saveMoodData]);

  // Mettre à jour un champ
  const updateField = useCallback((field, value) => {
    setMoodData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    setError(null);
  }, []);

  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setMoodData({
      primary_emotion: '',
      mood_score: 5,
      emotion_tags: [],
      mood_notes: ''
    });
    setHasChanges(false);
    setError(null);
    setLastSaved(null);
  }, []);

  // Sauvegarder manuellement
  const forceSave = useCallback(async () => {
    return await saveMoodData();
  }, [saveMoodData]);

  // Vérifier si le formulaire est vide
  const isEmpty = !moodData.primary_emotion &&
                  moodData.mood_score === 5 &&
                  moodData.emotion_tags.length === 0 &&
                  !moodData.mood_notes;

  return {
    // Données
    moodData,
    currentDate,

    // États
    isLoading,
    hasChanges,
    lastSaved,
    error,
    isEmpty,

    // Actions
    updateField,
    resetForm,
    forceSave,
    loadMoodData
  };
};