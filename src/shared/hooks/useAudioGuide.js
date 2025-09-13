/**
 * 🔊 Hook de Guide Audio pour Respiration
 *
 * Utilise la Web Speech API pour générer des instructions audio
 * permettant une pratique de respiration les yeux fermés.
 */

import { useCallback, useRef, useState } from 'react';

export const useAudioGuide = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSupported, setIsSupported] = useState(typeof window !== 'undefined' && 'speechSynthesis' in window);
  const currentUtteranceRef = useRef(null);

  // Configuration de la voix
  const getVoice = useCallback(() => {
    if (!isSupported) return null;

    const voices = speechSynthesis.getVoices();

    // Préférer une voix française féminine
    let preferredVoice = voices.find(voice =>
      voice.lang.startsWith('fr') && voice.name.toLowerCase().includes('female')
    );

    // Fallback sur n'importe quelle voix française
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => voice.lang.startsWith('fr'));
    }

    // Fallback final sur la voix par défaut
    return preferredVoice || voices[0] || null;
  }, [isSupported]);

  // Arrêter la parole en cours
  const stopSpeaking = useCallback(() => {
    if (isSupported && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
  }, [isSupported]);

  // Parler un texte avec des paramètres optimisés pour la méditation
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !isEnabled || !text.trim()) return;

    // Arrêter la parole en cours
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoice();

    if (voice) {
      utterance.voice = voice;
    }

    // Configuration pour un ton apaisant
    utterance.rate = options.rate || 0.7; // Plus lent pour la méditation
    utterance.pitch = options.pitch || 0.9; // Légèrement plus grave
    utterance.volume = options.volume || 0.8; // Volume modéré

    // Callbacks optionnels
    if (options.onStart) {
      utterance.onstart = options.onStart;
    }
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    currentUtteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, isEnabled, getVoice, stopSpeaking]);

  // Instructions spécifiques pour chaque phase
  const announcePhase = useCallback((phase, duration, isFirstTime = false) => {
    if (!isEnabled) return;

    const messages = {
      inhale: isFirstTime ? 'Inspirez profondément par le nez' : 'Inspirez',
      hold: isFirstTime ? 'Retenez votre respiration' : 'Retenez',
      exhale: isFirstTime ? 'Expirez lentement par la bouche' : 'Expirez',
      pause: isFirstTime ? 'Petite pause' : 'Pause'
    };

    const message = messages[phase] || 'Continuez';
    speak(message, { rate: 0.8, pitch: 0.9 });
  }, [speak, isEnabled]);

  // Son de début de session
  const announceStart = useCallback((techniqueName) => {
    if (!isEnabled) return;

    speak(`Commençons l'exercice ${techniqueName}. Installez-vous confortablement et fermez les yeux si vous le souhaitez.`, {
      rate: 0.8,
      onEnd: () => {
        // Petite pause avant de commencer
        setTimeout(() => {
          speak('Prêt ? C\'est parti.', { rate: 0.7 });
        }, 1000);
      }
    });
  }, [speak, isEnabled]);

  // Compte à rebours pour fin de phase
  const countDown = useCallback((secondsLeft) => {
    if (!isEnabled || secondsLeft > 3 || secondsLeft <= 0) return;

    // Seulement pour les 3 dernières secondes
    speak(secondsLeft.toString(), {
      rate: 0.6,
      pitch: 0.8,
      volume: 0.6
    });
  }, [speak, isEnabled]);

  // Encouragements pendant la session
  const giveEncouragement = useCallback(() => {
    if (!isEnabled) return;

    const encouragements = [
      'Très bien, continuez à ce rythme',
      'Parfait, vous trouvez votre rythme',
      'Excellent, restez concentrée sur votre respiration',
      'Bien, laissez-vous porter par ce rythme apaisant'
    ];

    const message = encouragements[Math.floor(Math.random() * encouragements.length)];
    speak(message, { rate: 0.7, volume: 0.7 });
  }, [speak, isEnabled]);

  // Annonce de fin de session
  const announceCompletion = useCallback((stressReduction) => {
    if (!isEnabled) return;

    let message = 'Bravo ! Votre session est terminée.';

    if (stressReduction > 0) {
      message += ` Vous avez réduit votre stress de ${stressReduction} points. Excellent travail !`;
    }

    message += ' Prenez un moment pour revenir à l\'instant présent et rouvrez les yeux quand vous êtes prête.';

    speak(message, { rate: 0.8 });
  }, [speak, isEnabled]);

  // Sons de notification subtils (utilisation de beep courts)
  const playNotificationSound = useCallback((type = 'soft') => {
    if (!isEnabled) return;

    // Utiliser des tons doux pour les notifications
    const frequencies = {
      soft: 220,      // La grave
      gentle: 330,    // Mi
      complete: 440   // La medium
    };

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine'; // Son doux

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback silencieux si Web Audio API n'est pas supportée
      console.log('Audio notification not supported');
    }
  }, [isEnabled]);

  return {
    // État
    isEnabled,
    isSupported,

    // Contrôles
    setIsEnabled,
    stopSpeaking,

    // Instructions vocales
    announcePhase,
    announceStart,
    announceCompletion,
    countDown,
    giveEncouragement,

    // Sons
    playNotificationSound,

    // Fonction générique
    speak
  };
};