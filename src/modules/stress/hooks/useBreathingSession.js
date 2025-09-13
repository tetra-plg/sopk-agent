/**
 * 🫁 Hook de Session de Respiration
 *
 * Hook principal pour gérer une session complète de respiration guidée
 * avec cycles, phases et tracking des données.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTimer } from '../../../shared/hooks/useTimer';
import {
  getTechnique,
  getCycleDuration,
  getTotalCycles,
  getCurrentPhase
} from '../utils/breathingTechniques';

export const useBreathingSession = (techniqueId, userId = null) => {
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

  if (!technique) {
    throw new Error(`Technique "${techniqueId}" non trouvée`);
  }

  const cycleDuration = getCycleDuration(technique.pattern);
  const totalCycles = getTotalCycles(technique);

  // Configuration du timer principal
  const timer = useTimer(technique.duration, {
    onTick: (timeLeft, elapsedTime) => {
      // Calculer dans quel cycle nous sommes
      const cycle = Math.floor(elapsedTime / cycleDuration);
      const timeInCurrentCycle = elapsedTime % cycleDuration;

      // Obtenir la phase actuelle
      const phaseData = getCurrentPhase(technique.pattern, timeInCurrentCycle);


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

  // Démarrer la session
  const startSession = useCallback(async () => {
    if (!technique) return;


    setSessionStarted(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeInPhase(0);
    setPhaseProgress(0);
    setPhaseDuration(technique.pattern[0]);
    sessionStartTimeRef.current = Date.now();
    cycleStartTimeRef.current = Date.now();

    timer.start();
  }, [technique, timer, cycleDuration, totalCycles]);

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
    setPhaseDuration(technique?.pattern[0] || 0);
    setStressBefore(null);
    setStressAfter(null);
    setFeelingAfter(null);
    setSessionNotes('');
    sessionStartTimeRef.current = null;
    cycleStartTimeRef.current = null;
  }, [timer, technique]);

  // Calculer les statistiques de session
  const getSessionData = useCallback(() => {
    const actualDuration = technique.duration - timer.timeLeft;
    const completedCycles = currentCycle + (timer.isCompleted ? 1 : 0);

    return {
      technique: techniqueId,
      duration_seconds: Math.round(actualDuration),
      completed: timer.isCompleted,
      interruption_reason: !timer.isCompleted && timer.timeLeft < technique.duration
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
    if (!technique) return 0;
    return (technique.duration - timer.timeLeft) / technique.duration;
  }, [technique, timer.timeLeft]);

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