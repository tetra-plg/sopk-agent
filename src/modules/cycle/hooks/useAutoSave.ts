import { useEffect, useRef, useCallback } from 'react';
import { symptomsService } from '../services/symptomsService';

export function useAutoSave({
  userId,
  formData: _formData,
  currentDate,
  hasChanges,
  getValidatedData,
  getFormattedDate,
  markAsSaved,
  setLoadingState,
  debounceDelay = 2000 // 2 secondes
}) {
  const saveTimeoutRef = useRef(null);
  const lastSaveRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const performSave = useCallback(async (dateKey, data) => {
    if (!userId || !isMountedRef.current) return { success: false };

    try {
      setLoadingState(true);

      const { error } = await symptomsService.saveDailyEntry(
        userId,
        dateKey,
        data
      );

      if (!isMountedRef.current) return { success: false };

      if (error) {
        return { success: false, error };
      }

      markAsSaved();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      if (isMountedRef.current) {
        setLoadingState(false);
      }
    }
  }, [userId, setLoadingState, markAsSaved]);

  const scheduleAutoSave = useCallback(() => {
    if (!hasChanges || !userId) return;

    // Annuler la sauvegarde précédente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const dateKey = getFormattedDate();
    const dataToSave = getValidatedData();

    // Vérifier si les données ont réellement changé
    const currentDataKey = JSON.stringify({ dateKey, data: dataToSave });
    if (currentDataKey === lastSaveRef.current) {
      return;
    }

    // Programmer la nouvelle sauvegarde
    saveTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      saveTimeoutRef.current = null;
      const result = await performSave(dateKey, dataToSave);
      if (result.success) {
        lastSaveRef.current = currentDataKey;

      }
    }, debounceDelay);
  }, [hasChanges, userId, debounceDelay, getFormattedDate, getValidatedData, performSave]);

  const forceSave = useCallback(async () => {
    if (!hasChanges || !userId) return { success: true };

    // Annuler l'auto-save en attente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const dateKey = getFormattedDate();
    const dataToSave = getValidatedData();

    const result = await performSave(dateKey, dataToSave);
    if (result.success) {
      lastSaveRef.current = JSON.stringify({ dateKey, data: dataToSave });

    }

    return result;
  }, [hasChanges, userId, getFormattedDate, getValidatedData, performSave]);

  // Déclencher l'auto-save quand les données changent
  useEffect(() => {
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // Sauvegarde forcée lors du changement de date
  useEffect(() => {
    // Reset de la référence de dernière sauvegarde pour la nouvelle date
    lastSaveRef.current = null;

    // Ne pas sauvegarder automatiquement lors du changement de date
    // La sauvegarde sera gérée par le composant parent si nécessaire
  }, [currentDate]);

  // Cleanup des timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sauvegarde avant unmount
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges && userId) {
        // Sauvegarde synchrone en cas de fermeture de page
        e.preventDefault();
        e.returnValue = '';
        forceSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Sauvegarde finale lors du cleanup
      if (hasChanges && userId && isMountedRef.current) {
        forceSave();
      }
    };
  }, [hasChanges, userId, forceSave]);

  return {
    forceSave,
    isAutoSaveScheduled: saveTimeoutRef.current !== null
  };
}