/**
 * 🫁 Hook Techniques de Respiration
 *
 * Hook pour la gestion des techniques de respiration depuis la base de données.
 */

import { useState, useEffect, useCallback } from 'react';
import breathingTechniquesService from '../services/breathingTechniquesService';

export const useBreathingTechniques = () => {
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des techniques
  const loadTechniques = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await breathingTechniquesService.getAllTechniques();
      setTechniques(data || []);
    } catch (err) {
      console.error('Erreur chargement techniques:', err);
      setError(err);
      setTechniques([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadTechniques();
  }, [loadTechniques]);

  // Obtenir une technique par ID
  const getTechnique = useCallback((techniqueId) => {
    return techniques.find(t => t.id === techniqueId) || null;
  }, [techniques]);

  // Filtrer par difficulté
  const getTechniquesByDifficulty = useCallback((difficulty) => {
    return techniques.filter(t => t.difficulty === difficulty);
  }, [techniques]);

  return {
    techniques,
    loading,
    error,
    getTechnique,
    getTechniquesByDifficulty,
    refreshTechniques: loadTechniques,
    isReady: !loading && techniques.length > 0
  };
};