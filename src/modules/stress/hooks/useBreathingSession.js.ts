/**
 * 🫁 Hook de Session de Respiration
 *
 * Hook principal pour gérer une session complète de respiration guidée
 * avec cycles, phases et tracking des données.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTimer } from '../../../shared/hooks/useTimer';
import {
  getCycleDuration,
  getTotalCycles,
  getCurrentPhase
} from '../utils/breathingTechniques';
import { useBreathingTechniques } from './useBreathingTechniques';

export const useBreathingSession = (techniqueId, userId = null) => {
  const { techniques, getTechnique, loading: techniquesLoading, isReady } = useBreathingTechniques();
  const technique = getTechnique(techniqueId);

  // États de la session
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);

  // Données de feedback utilisateur
  const [stressBefore, setStressBefore] = useState(null);
  const [stressAfter, setStressAfter] = useState(null);
  const [feelingAfter, setFeelingAfter] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');

  // Référence pour les callbacks
  const sessionStartTimeRef = useRef(null);
  const cycleStartTimeRef = useRef(null);

  // Gérer l'état de chargement et les erreurs de manière plus gracieuse
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isReady && !technique) {
      setError(`Technique "${techniqueId}" non trouvée`);
    } else if (technique) {
      setError(null);
    }
  }, [technique, techniqueId, isReady]);

  // Adapter les données de la technique BDD pour les fonctions utilitaires
  const adaptedTechnique = technique ? {
    duration: technique.duration_seconds,
    pattern: technique.pattern || [4, 4, 4, 4] // fallback
  } : null;

  const cycleDuration = adaptedTechnique ? getCycleDuration(adaptedTechnique.pattern) : 0;
  const totalCycles = adaptedTechnique ? getTotalCycles(adaptedTechnique) : 0;

  // Configuration du timer principal - TOUJOURS appelé pour respecter les règles des hooks
  const timer = useTimer(0, {
    onTick: (timeLeft, elapsedTime) => {
      if (!adaptedTechnique) return;

      // Calculer dans quel cycle nous sommes
      const cycle = Math.floor(elapsedTime / cycleDuration);
      const timeInCurrentCycle = elapsedTime % cycleDuration;

      // Obtenir la phase actuelle
      const phaseData = getCurrentPhase(adaptedTechnique.pattern, timeInCurrentCycle);

      setCurrentCycle(Math.min(cycle, totalCycles - 1));
      setCurrentPhase(phaseData.phase);
      setTimeInPhase(phaseData.timeInPhase);
      setPhaseProgress(phaseData.progress);
      setPhaseDuration(phaseData.phaseDuration);
    },
    onComplete: () => {
      setSessionStarted(false);
    },
    tickInterval: 100 // 100ms pour animations fluides
  });

  // Mettre à jour la durée du timer quand la technique est chargée
  // On utilise une ref pour éviter de re-déclencher setDuration après qu'elle ait été appelée
  const lastSetDurationRef = useRef(0);

  useEffect(() => {
    if (technique?.duration_seconds && technique.duration_seconds !== lastSetDurationRef.current) {
      timer.setDuration(technique.duration_seconds);
      lastSetDurationRef.current = technique.duration_seconds;
    }
  }, [technique?.duration_seconds, timer]);

  // Démarrer la session
  const startSession = useCallback(async () => {
    if (!technique) return;

    // S'assurer que le timer a bien la bonne durée avant de démarrer
    // On vérifie aussi avec la ref pour éviter de re-définir la durée
    if (technique.duration_seconds && lastSetDurationRef.current !== technique.duration_seconds) {
      timer.setDuration(technique.duration_seconds);
      lastSetDurationRef.current = technique.duration_seconds;
    }

    setSessionStarted(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeInPhase(0);
    setPhaseProgress(0);
    setPhaseDuration(adaptedTechnique?.pattern[0] || 4);
    sessionStartTimeRef.current = Date.now();
    cycleStartTimeRef.current = Date.now();

    timer.start();
  }, [technique, adaptedTechnique, timer, cycleDuration, totalCycles]);

  // Mettre en pause
  const pauseSession = useCallback(() => {
    timer.pause();
  }, [timer]);

  // Reprendre
  const resumeSession = useCallback(() => {
    timer.resume();
  }, [timer]);

  // Arrêter la session
  const stopSession = useCallback(() => {
    timer.stop();
    setSessionStarted(false);
  }, [timer]);

  // Reset de la session
  const resetSession = useCallback(() => {
    timer.reset();
    setSessionStarted(false);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeInPhase(0);
    setPhaseProgress(0);
    setPhaseDuration(adaptedTechnique?.pattern[0] || 4);
    setStressBefore(null);
    setStressAfter(null);
    setFeelingAfter(null);
    setSessionNotes('');
    sessionStartTimeRef.current = null;
    cycleStartTimeRef.current = null;
  }, [timer, adaptedTechnique]);

  // Calculer les statistiques de session
  const getSessionData = useCallback(() => {
    const actualDuration = (technique?.duration_seconds || 0) - timer.timeLeft;
    const completedCycles = currentCycle + (timer.isCompleted ? 1 : 0);

    return {
      technique: techniqueId,
      duration_seconds: Math.round(actualDuration),
      completed: timer.isCompleted,
      interruption_reason: !timer.isCompleted && timer.timeLeft < (technique?.duration_seconds || 0)
        ? 'user_stopped'
        : null,
      stress_before: stressBefore,
      stress_after: stressAfter,
      feeling_after: feelingAfter,
      cycles_completed: completedCycles,
      total_cycles: totalCycles,
      session_notes: sessionNotes.trim() || null
    };
  }, [
    techniqueId,
    technique,
    timer,
    currentCycle,
    totalCycles,
    stressBefore,
    stressAfter,
    feelingAfter,
    sessionNotes
  ]);

  // Instructions actuelles
  const getCurrentInstructions = useCallback(() => {
    const phaseInstructions = {
      inhale: 'Inspire profondément',
      hold: 'Retiens ta respiration',
      exhale: 'Expire lentement',
      pause: 'Petite pause'
    };

    return {
      text: phaseInstructions[currentPhase] || 'Respire naturellement',
      phase: currentPhase,
      timeRemaining: Math.max(0, phaseDuration - timeInPhase),
      progress: phaseProgress
    };
  }, [currentPhase, phaseDuration, timeInPhase, phaseProgress]);

  // Calculer le progrès global
  const getOverallProgress = useCallback(() => {
    if (!technique || !technique.duration_seconds) return 0;
    return (technique.duration_seconds - timer.timeLeft) / technique.duration_seconds;
  }, [technique, timer.timeLeft]);

  // RETOURS CONDITIONNELS APRÈS TOUS LES HOOKS
  // Si les techniques sont en cours de chargement, retourner un état de chargement
  if (techniquesLoading) {
    return {
      loading: true,
      error: null,
      technique: null,
      isActive: false,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      startSession: () => {},
      pauseSession: () => {},
      resumeSession: () => {},
      stopSession: () => {},
      resetSession: () => {},
      setStressBefore: () => {},
      setStressAfter: () => {},
      setFeelingAfter: () => {},
      setSessionNotes: () => {},
      getSessionData: () => ({}),
      getCurrentInstructions: () => ({}),
      getOverallProgress: () => 0
    };
  }

  // Si il y a une erreur, la retourner
  if (error) {
    return {
      loading: false,
      error,
      technique: null,
      isActive: false,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      startSession: () => {},
      pauseSession: () => {},
      resumeSession: () => {},
      stopSession: () => {},
      resetSession: () => {},
      setStressBefore: () => {},
      setStressAfter: () => {},
      setFeelingAfter: () => {},
      setSessionNotes: () => {},
      getSessionData: () => ({}),
      getCurrentInstructions: () => ({}),
      getOverallProgress: () => 0
    };
  }

  // État de la session pour l'UI
  const sessionState = {
    // État général
    isActive: sessionStarted,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
    isCompleted: timer.isCompleted,

    // Informations de technique
    technique,
    techniqueId,

    // Progrès et timing
    timeLeft: timer.timeLeft,
    totalElapsed: timer.totalElapsed,
    formattedTimeLeft: timer.formattedTimeLeft,
    overallProgress: getOverallProgress(),
    progressPercent: timer.progressPercent,

    // Cycle actuel
    currentCycle: currentCycle + 1, // +1 pour affichage (1-based)
    totalCycles,
    cycleProgress: currentCycle / totalCycles,

    // Phase actuelle
    currentPhase,
    timeInPhase,
    phaseProgress,
    phaseDuration,
    instructions: getCurrentInstructions(),

    // Données utilisateur
    stressBefore,
    stressAfter,
    feelingAfter,
    sessionNotes,

    // Données de session
    sessionData: getSessionData()
  };

  return {
    // État de la session
    ...sessionState,

    // États de chargement et d'erreur
    loading: false,
    error: null,

    // Actions de contrôle
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetSession,

    // Setters pour feedback utilisateur
    setStressBefore,
    setStressAfter,
    setFeelingAfter,
    setSessionNotes,

    // Utilitaires
    getSessionData,
    getCurrentInstructions,
    getOverallProgress
  };
};