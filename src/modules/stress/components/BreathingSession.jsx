/**
 * 🫁 Session de Respiration Active
 *
 * Composant principal pour une session de respiration guidée complète
 * avec animation, contrôles et feedback utilisateur.
 */

import { useState, useEffect, useRef } from 'react';
import { useBreathingSession } from '../hooks/useBreathingSession';
import { phaseInstructions } from '../utils/breathingTechniques';
import { useAudioGuide } from '../../../shared/hooks/useAudioGuide';
import CircleAnimation from '../../../shared/components/animations/CircleAnimation';

const BreathingSession = ({
  techniqueId,
  userId = null,
  onComplete = () => {},
  onExit = () => {},
  className = ''
}) => {
  const session = useBreathingSession(techniqueId, userId);
  const audioGuide = useAudioGuide();
  const [showPreparation, setShowPreparation] = useState(true);
  const [stressBeforeSet, setStressBeforeSet] = useState(false);

  // États pour le feedback de fin
  const [showCompletionFeedback, setShowCompletionFeedback] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Références pour éviter les répétitions audio
  const lastAnnouncedPhase = useRef('');
  const sessionStartTime = useRef(null);
  const lastEncouragementTime = useRef(0);

  // Démarrer la session après préparation
  const handleStartSession = async () => {
    if (!stressBeforeSet) {
      alert('Veuillez évaluer votre niveau de stress avant de commencer');
      return;
    }

    setShowPreparation(false);
    sessionStartTime.current = Date.now();

    // Son de début de session
    audioGuide.playNotificationSound('complete');

    await session.startSession();
  };

  // Gestion de la complétion de session
  useEffect(() => {
    if (session.isCompleted && !showCompletionFeedback) {
      const data = session.getSessionData();
      const stressReduction = session.stressBefore && session.stressAfter
        ? session.stressBefore - session.stressAfter
        : 0;

      // Son de fin de session
      audioGuide.playNotificationSound('complete');

      setShowCompletionFeedback(true);
      setCompletionData(data);
    }
  }, [session.isCompleted, showCompletionFeedback, session, audioGuide]);

  // Gestion des sons audio pendant la session
  useEffect(() => {
    if (!session.isActive || !session.isRunning) return;

    const currentPhase = session.currentPhase;
    const isNewPhase = currentPhase !== lastAnnouncedPhase.current;

    if (isNewPhase) {
      lastAnnouncedPhase.current = currentPhase;

      // Son différent selon la phase
      const soundMap = {
        'inhale': 'gentle',
        'hold': 'soft',
        'exhale': 'gentle',
        'pause': 'soft'
      };

      audioGuide.playNotificationSound(soundMap[currentPhase] || 'soft');
    }

    // Son subtle pour les 3 dernières secondes de chaque phase
    const timeRemaining = session.phaseDuration - session.timeInPhase;
    if (timeRemaining > 0 && timeRemaining <= 3 && Number.isInteger(timeRemaining)) {
      // Son plus discret pour le countdown
      audioGuide.playNotificationSound('soft');
    }

  }, [session.currentPhase, session.timeInPhase, session.currentCycle, session.isActive, session.isRunning, audioGuide]);

  // Préparation - Évaluation du stress initial
  if (showPreparation) {
    return (
      <div className={`max-w-md mx-auto p-6 ${className}`}>
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
            style={{
              backgroundColor: `${session.technique.color}20`,
              color: session.technique.color
            }}
          >
            {session.technique.icon}
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
            {session.technique.name}
          </h2>
          <p className="text-gray-600 mb-1">
            {session.technique.description}
          </p>
          <p className="text-sm text-gray-500">
            ⏱️ {session.formattedTimeLeft} • 🔄 {session.totalCycles} cycles
          </p>
        </div>

        {/* Évaluation stress initial */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Comment te sens-tu maintenant ? (niveau de stress)
          </label>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">😌 Détendue</span>
            <span className="text-xs text-gray-500">😰 Très stressée</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={session.stressBefore || 5}
            onChange={(e) => {
              session.setStressBefore(parseInt(e.target.value));
              setStressBeforeSet(true);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #6EE7B7 0%, ${session.technique.color} 50%, #FB7185 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <span key={n}>{n}</span>
            ))}
          </div>
          {session.stressBefore && (
            <p className="text-center mt-2 text-sm text-gray-600">
              Niveau actuel : <span className="font-medium">{session.stressBefore}/10</span>
            </p>
          )}
        </div>

        {/* Options audio */}
        <div className="bg-gradient-to-r from-accent-vert-sauge/10 to-primary-bleu-ciel/10 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800 mb-1">🔊 Sons de guidance</h3>
              <p className="text-xs text-gray-600">Sons subtils pour suivre les phases les yeux fermés</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={audioGuide.isEnabled}
                onChange={(e) => audioGuide.setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-vert-sauge"></div>
            </label>
          </div>
          {!audioGuide.isSupported && (
            <p className="text-xs text-yellow-600 mt-2">⚠️ Guide audio non supporté sur ce navigateur</p>
          )}
        </div>

        {/* Instructions de préparation */}
        <div className="bg-gradient-to-r from-primary-lavande/10 to-primary-bleu-ciel/10 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-2">📋 Avant de commencer :</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Trouve une position confortable</li>
            <li>• {audioGuide.isEnabled ? 'Autorise le son pour les notifications subtiles' : 'Mets ton téléphone en mode silencieux'}</li>
            <li>• Respire naturellement et détends-toi</li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={onExit}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={handleStartSession}
            disabled={!stressBeforeSet}
            className="flex-2 px-8 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minWidth: '60%' }}
          >
            {stressBeforeSet ? '🚀 Commencer' : 'Évalue ton stress d\'abord'}
          </button>
        </div>
      </div>
    );
  }

  // Feedback de complétion
  if (showCompletionFeedback) {
    return (
      <CompletionFeedback
        sessionData={completionData}
        technique={session.technique}
        stressBefore={session.stressBefore}
        onStressAfterChange={session.setStressAfter}
        onFeelingChange={session.setFeelingAfter}
        onComplete={(data) => {
          onComplete({ ...completionData, ...data });
          setShowCompletionFeedback(false);
        }}
        onNewSession={() => {
          session.resetSession();
          setShowPreparation(true);
          setShowCompletionFeedback(false);
        }}
        className={className}
      />
    );
  }

  // Session active
  return (
    <div className={`max-w-md mx-auto p-6 text-center ${className}`}>
      {/* Header avec technique et temps */}
      <div className="mb-8">
        <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">
          {session.technique.name}
        </h2>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
          <span>⏱️ {session.formattedTimeLeft}</span>
          <span>🔄 {session.currentCycle}/{session.totalCycles}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${session.progressPercent}%`,
              backgroundColor: session.technique.color
            }}
          />
        </div>
      </div>

      {/* Animation principale */}
      <div className="mb-8">
        <CircleAnimation
          phase={session.currentPhase}
          progress={session.phaseProgress}
          isActive={session.isRunning}
          size={240}
          className="mx-auto"
        />
      </div>

      {/* Instructions de respiration */}
      <div className="mb-8">
        <div className="text-2xl font-medium text-gray-800 mb-2">
          {session.instructions.text}
        </div>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
          <span>{phaseInstructions[session.currentPhase]?.emoji}</span>
          <span>
            {Math.ceil(session.instructions.timeRemaining)}s restantes
          </span>
        </div>
      </div>

      {/* Contrôles de session */}
      <div className="flex flex-col items-center gap-4 mb-6">
        {/* Boutons principaux */}
        <div className="flex justify-center gap-4">
          {!session.isRunning ? (
            <button
              onClick={session.startSession}
              className="px-8 py-3 btn-primary flex items-center gap-2"
            >
              <span>▶️</span>
              <span>Commencer</span>
            </button>
          ) : session.isPaused ? (
            <button
              onClick={session.resumeSession}
              className="px-8 py-3 btn-accent-vert flex items-center gap-2"
            >
              <span>▶️</span>
              <span>Reprendre</span>
            </button>
          ) : (
            <button
              onClick={session.pauseSession}
              className="px-8 py-3 btn-secondary flex items-center gap-2"
            >
              <span>⏸️</span>
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={() => {
              audioGuide.stopSpeaking();
              session.stopSession();
              onExit();
            }}
            className="px-6 py-3 btn-accent-corail flex items-center gap-2"
          >
            <span>⏹️</span>
            <span>Arrêter</span>
          </button>
        </div>

        {/* Contrôle audio discret */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => audioGuide.setIsEnabled(!audioGuide.isEnabled)}
            className={`p-2 rounded-lg transition-all ${
              audioGuide.isEnabled
                ? 'bg-accent-vert-sauge/20 text-accent-vert-sauge'
                : 'bg-gray-100 text-gray-400'
            }`}
            title={audioGuide.isEnabled ? 'Désactiver le guide audio' : 'Activer le guide audio'}
          >
            <span className="text-lg">{audioGuide.isEnabled ? '🔊' : '🔇'}</span>
          </button>
          <span className="text-xs text-gray-500">
            {audioGuide.isEnabled ? 'Sons activés' : 'Sons désactivés'}
          </span>
        </div>
      </div>

      {/* Indication de stress initial */}
      <div className="text-xs text-gray-500">
        Stress initial : {session.stressBefore}/10
      </div>
    </div>
  );
};

// =====================================================
// COMPOSANT DE FEEDBACK DE COMPLÉTION
// =====================================================

const CompletionFeedback = ({
  sessionData,
  technique,
  stressBefore,
  onStressAfterChange,
  onFeelingChange,
  onComplete,
  onNewSession,
  className = ''
}) => {
  const [stressAfter, setStressAfter] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [notes, setNotes] = useState('');

  const handleComplete = () => {
    onComplete({
      stress_after: stressAfter,
      feeling_after: feeling,
      notes: notes.trim() || null
    });
  };

  const stressImprovement = stressBefore && stressAfter
    ? stressBefore - stressAfter
    : 0;

  const getImprovementMessage = () => {
    if (stressImprovement > 3) return { text: 'Excellent ! 🌟', color: 'text-green-600' };
    if (stressImprovement > 1) return { text: 'Très bien ! 👏', color: 'text-green-600' };
    if (stressImprovement > 0) return { text: 'Bien joué ! 👍', color: 'text-blue-600' };
    if (stressImprovement === 0) return { text: 'Pas mal ! 😊', color: 'text-yellow-600' };
    return { text: 'Prends soin de toi 💙', color: 'text-purple-600' };
  };

  const message = getImprovementMessage();

  return (
    <div className={`max-w-md mx-auto p-6 ${className}`}>
      {/* Félicitations */}
      <div className="text-center mb-8">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
          style={{
            backgroundColor: `${technique.color}20`,
            color: technique.color
          }}
        >
          ✨
        </div>
        <h2 className={`text-2xl font-heading font-bold mb-2 ${message.color}`}>
          {message.text}
        </h2>
        <p className="text-gray-600">
          Session de {technique.name} terminée
        </p>
        <p className="text-sm text-gray-500">
          ⏱️ {Math.round(sessionData.duration_seconds / 60)} minutes
        </p>
      </div>

      {/* Évaluation post-session */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Comment te sens-tu maintenant ?
        </label>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">😌 Détendue</span>
          <span className="text-xs text-gray-500">😰 Toujours stressée</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={stressAfter || 5}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setStressAfter(value);
            onStressAfterChange(value);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6EE7B7 0%, ${technique.color} 50%, #FB7185 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <span key={n}>{n}</span>
          ))}
        </div>
        {stressAfter && (
          <p className="text-center mt-2 text-sm text-gray-600">
            Niveau actuel : <span className="font-medium">{stressAfter}/10</span>
            {stressImprovement > 0 && (
              <span className="text-green-600 ml-2">
                (-{stressImprovement} points !)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Sentiment général */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Ton ressenti général :
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'calmer', label: '😌 Plus calme', color: 'green' },
            { value: 'same', label: '😐 Pareil', color: 'yellow' },
            { value: 'better', label: '😊 Bien mieux', color: 'blue' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setFeeling(option.value);
                onFeelingChange(option.value);
              }}
              className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                feeling === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes optionnelles */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optionnel) :
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Comment s'est passée la session ?"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
          rows="3"
          maxLength="200"
        />
      </div>

      {/* Actions finales */}
      <div className="flex gap-3">
        <button
          onClick={onNewSession}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          🔄 Nouvelle session
        </button>
        <button
          onClick={handleComplete}
          disabled={!stressAfter}
          className="flex-2 px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: '60%' }}
        >
          ✅ Terminer
        </button>
      </div>
    </div>
  );
};

export default BreathingSession;