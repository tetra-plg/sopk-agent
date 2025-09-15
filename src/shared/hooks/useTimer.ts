/**
 * 🕐 Hook Timer Réutilisable
 *
 * Hook personnalisé pour gérer les timers avec contrôles
 * (start, pause, resume, reset) et callbacks.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Types pour le hook useTimer
interface TimerOptions {
  onTick?: (timeLeft: number, elapsed: number) => void;
  onComplete?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  tickInterval?: number;
  autoStart?: boolean;
}

export const useTimer = (initialDuration = 0, options: TimerOptions = {}) => {
  const {
    onTick = () => {},
    onComplete = () => {},
    onStart = () => {},
    onPause = () => {},
    onReset = () => {},
    tickInterval = 100, // 100ms pour animations fluides
    autoStart = false
  } = options;

  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(initialDuration);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef(0);

  // Fonction de tick du timer
  const tick = useCallback(() => {
    setTimeLeft(prevTime => {
      const newTime = prevTime - (tickInterval / 1000);

      if (newTime <= 0) {
        setIsRunning(false);
        setIsPaused(false);
        onComplete();
        return 0;
      }

      setTotalElapsed(prev => prev + (tickInterval / 1000));
      onTick(newTime, currentDuration - newTime);
      return newTime;
    });
  }, [tickInterval, onTick, onComplete, currentDuration]);

  // Démarrer le timer
  const start = useCallback(() => {
    if (timeLeft <= 0) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - pausedTimeRef.current;

    intervalRef.current = setInterval(tick, tickInterval);
    onStart();
  }, [timeLeft, tick, tickInterval, onStart]);

  // Mettre en pause
  const pause = useCallback(() => {
    if (!isRunning) return;

    setIsRunning(false);
    setIsPaused(true);
    pausedTimeRef.current = Date.now() - startTimeRef.current;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onPause();
  }, [isRunning, onPause]);

  // Reprendre
  const resume = useCallback(() => {
    if (!isPaused) return;
    start();
  }, [isPaused, start]);

  // Arrêter
  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    pausedTimeRef.current = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset
  const reset = useCallback(() => {
    stop();
    setTimeLeft(initialDuration);
    setTotalElapsed(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
    onReset();
  }, [initialDuration, stop, onReset]);

  // Définir une nouvelle durée
  const setDuration = useCallback((newDuration: number) => {
    const wasRunning = isRunning;
    stop();
    setTimeLeft(newDuration);
    setCurrentDuration(newDuration);
    setTotalElapsed(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;

    if (wasRunning && autoStart) {
      setTimeout(() => start(), 0);
    }
  }, [isRunning, stop, autoStart, start]);

  // Calculer le progrès
  const progress = currentDuration > 0 ? (currentDuration - timeLeft) / currentDuration : 0;
  const progressPercent = Math.round(progress * 100);

  // Formater le temps
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.floor(Math.abs(seconds) % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formattedTimeLeft = formatTime(timeLeft);
  const formattedTotalTime = formatTime(currentDuration);
  const formattedElapsed = formatTime(totalElapsed);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-start si demandé
  useEffect(() => {
    if (autoStart && initialDuration > 0 && !isRunning && !isPaused) {
      start();
    }
  }, [autoStart, initialDuration, isRunning, isPaused, start]);

  return {
    // État du timer
    timeLeft,
    totalElapsed,
    isRunning,
    isPaused,
    isCompleted: timeLeft === 0,
    progress,
    progressPercent,

    // Temps formatés
    formattedTimeLeft,
    formattedTotalTime,
    formattedElapsed,

    // Contrôles
    start,
    pause,
    resume,
    stop,
    reset,
    setDuration,

    // Utilitaires
    formatTime
  };
};