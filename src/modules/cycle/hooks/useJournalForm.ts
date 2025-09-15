import { useState } from 'react';
import { validateDailySymptoms } from '../utils/symptomsValidation';
import { formatDateForAPI } from '../../../shared/utils/dateHelpers';

export function useJournalForm(initialDate = new Date(), userId = null) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [formData, setFormData] = useState({
    period_flow: null,
    fatigue_level: null,
    pain_level: null,
    mood_score: null,
    mood_emoji: null,
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const updateField = (field, value) => {
    setFormData(prev => {
      // Éviter les updates inutiles si la valeur n'a pas changé
      if (prev[field] === value) {
        return prev;
      }

      const newData = { ...prev, [field]: value };
      setHasChanges(true);
      return newData;
    });
  };

  const updateMultipleFields = (updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      setHasChanges(true);
      return newData;
    });
  };

  const resetForm = (newData = null) => {
    const defaultData = {
      period_flow: null,
      fatigue_level: null,
      pain_level: null,
      mood_score: null,
      mood_emoji: null,
      notes: ''
    };

    const dataToSet = newData || defaultData;

    setFormData(prev => {
      // Éviter un re-render si les données n'ont pas changé
      const prevString = JSON.stringify(prev);
      const newString = JSON.stringify(dataToSet);

      if (prevString === newString) {
        return prev;
      }

      return dataToSet;
    });

    setHasChanges(false);
  };

  const getValidatedData = () => {
    return validateDailySymptoms(formData);
  };

  const getFormattedDate = () => {
    return formatDateForAPI(currentDate);
  };

  const changeDate = (newDate) => {
    setCurrentDate(newDate);
    setHasChanges(false);
    setLastSaved(null);
  };

  const markAsSaved = () => {
    setHasChanges(false);
    setLastSaved(new Date());
  };

  const setLoadingState = (loading) => {
    setIsLoading(loading);
  };

  return {
    // State
    currentDate,
    formData,
    isLoading,
    hasChanges,
    lastSaved,

    // Actions
    updateField,
    updateMultipleFields,
    resetForm,
    changeDate,
    markAsSaved,
    setLoadingState,

    // Computed
    getValidatedData,
    getFormattedDate,

    // Status helpers
    canSave: hasChanges && !isLoading && userId,
    isEmpty: Object.values(formData).every(value =>
      value === null || value === undefined || value === ''
    )
  };
}