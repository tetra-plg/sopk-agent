/**
 * ⏱️ useSessionTimer - Hook pour le timer de session d'activité
 *
 * Gère le décompte du temps, pause/reprise et callbacks de fin.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export const useSessionTimer = ({
  totalDuration = 0, // Durée totale en secondes
  onComplete = null, // Callback appelé à la fin
  onTick = null, // Callback appelé à chaque seconde
  onStart = null, // Callback appelé au démarrage
  onPause = null, // Callback appelé à la pause
  onResume = null // Callback appelé à la reprise
}) => {
  const [elapsed, setElapsed] = useState(0); // Temps écoulé en secondes
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Références pour éviter les re-renders inutiles
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Calculer le temps restant
  const remaining = Math.max(totalDuration - elapsed, 0);

  // Calculer le pourcentage de progression
  const progress = totalDuration > 0 ? Math.min((elapsed / totalDuration) * 100, 100) : 0;

  // Fonction pour démarrer le timer
  const start = useCallback(() => {
    if (isCompleted) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - (pausedTimeRef.current || 0);

    // Callback de démarrage
    if (onStart && !pausedTimeRef.current) {
      onStart();
    }

    // Callback de reprise si c'était en pause
    if (onResume && pausedTimeRef.current) {
      onResume();
    }
  }, [isCompleted, onStart, onResume]);

  // Fonction pour mettre en pause
  const pause = useCallback(() => {
    if (!isRunning || isCompleted) return;

    setIsRunning(false);
    setIsPaused(true);
    pausedTimeRef.current = elapsed * 1000; // Convertir en millisecondes

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Callback de pause
    if (onPause) {
      onPause();
    }
  }, [isRunning, isCompleted, elapsed, onPause]);

  // Fonction pour reprendre
  const resume = useCallback(() => {
    if (!isPaused || isCompleted) return;
    start();
  }, [isPaused, isCompleted, start]);

  // Fonction pour arrêter le timer
  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Remettre à zéro
    setElapsed(0);
    setIsCompleted(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, []);

  // Fonction pour terminer manuellement
  const complete = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(true);
    setElapsed(totalDuration);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Callback de fin
    if (onComplete) {
      onComplete();
    }
  }, [totalDuration, onComplete]);

  // Fonction pour réinitialiser le timer
  const reset = useCallback(() => {
    stop();
    setElapsed(0);
    setIsCompleted(false);
  }, [stop]);

  // Effet pour gérer l'intervalle de mise à jour
  useEffect(() => {
    if (isRunning && !isCompleted && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const newElapsed = Math.floor((now - startTimeRef.current) / 1000);

        setElapsed(newElapsed);

        // Callback de tick
        if (onTick) {
          onTick(newElapsed, Math.max(totalDuration - newElapsed, 0));
        }

        // Vérifier si c'est terminé
        if (totalDuration > 0 && newElapsed >= totalDuration) {
          setIsRunning(false);
          setIsCompleted(true);
          setElapsed(totalDuration);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Callback de fin
          if (onComplete) {
            onComplete();
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isCompleted, totalDuration, onTick, onComplete]);

  // Nettoyer l'intervalle au démontage du composant
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Formater le temps en MM:SS
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Retourner l'état et les fonctions
  return {
    // État du timer
    elapsed,
    remaining,
    progress,
    totalDuration,
    isRunning,
    isPaused,
    isCompleted,

    // Actions
    start,
    pause,
    resume,
    stop,
    complete,
    reset,

    // Utilitaires
    formatTime,
    formattedElapsed: formatTime(elapsed),
    formattedRemaining: formatTime(remaining),
    formattedTotal: formatTime(totalDuration),

    // État combiné pour faciliter l'usage
    canStart: !isRunning && !isCompleted,
    canPause: isRunning && !isCompleted,
    canResume: isPaused && !isCompleted,
    canStop: isRunning || isPaused,
    canReset: elapsed > 0 || isCompleted
  };
};