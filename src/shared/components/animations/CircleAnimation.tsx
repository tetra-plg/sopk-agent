/**
 * 🌊 Composant d'Animation Circulaire pour Respiration
 *
 * Animation fluide et apaisante qui s'adapte aux phases de respiration
 * avec les couleurs SOPK et des effets visuels subtils.
 */

import { useState, useEffect } from 'react';

const CircleAnimation = ({
  phase = 'inhale',
  progress = 0,
  isActive = false,
  size = 200,
  className = ''
}) => {
  const [animationClass, setAnimationClass] = useState('');

  // Couleurs selon la phase (couleurs SOPK)
  const phaseColors = {
    inhale: 'var(--color-accent-vert-sauge)', // #6EE7B7
    hold: 'var(--color-primary-bleu-ciel)', // #93C5FD
    exhale: 'var(--color-accent-corail)', // #FB7185
    pause: 'var(--color-primary-lavande)' // #A78BFA
  };

  // Tailles selon la phase et le progrès
  const getCircleScale = () => {
    if (!isActive) return 0.8;

    const minScale = 0.7;
    const maxScale = 1.2;

    switch (phase) {
      case 'inhale':
        return minScale + (maxScale - minScale) * progress;
      case 'hold':
        return maxScale;
      case 'exhale':
        return maxScale - (maxScale - minScale) * progress;
      case 'pause':
        return minScale;
      default:
        return minScale;
    }
  };

  // Opacité dynamique
  const getOpacity = () => {
    if (!isActive) return 0.3;
    return 0.4 + 0.4 * progress; // Entre 0.4 et 0.8
  };

  // Effet de pulsation lors des changements de phase
  useEffect(() => {
    if (isActive) {
      setAnimationClass('animate-pulse');
      const timer = setTimeout(() => setAnimationClass(''), 300);
      return () => clearTimeout(timer);
    }
  }, [phase, isActive]);

  const currentColor = phaseColors[phase] || phaseColors.inhale;
  const scale = getCircleScale();
  const opacity = getOpacity();

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Cercle de fond statique */}
      <div
        className="absolute rounded-full border-2"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          borderColor: currentColor,
          opacity: 0.2
        }}
      />

      {/* Cercle principal animé */}
      <div
        className={`absolute rounded-full transition-all duration-500 ease-in-out ${animationClass}`}
        style={{
          width: size * scale,
          height: size * scale,
          background: `radial-gradient(circle, ${currentColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
          boxShadow: isActive ? `0 0 60px ${currentColor}40` : 'none',
          transform: isActive ? 'scale(1)' : 'scale(0.8)',
          filter: isActive ? 'blur(0px)' : 'blur(1px)'
        }}
      />

      {/* Cercles concentriques pour effet de profondeur */}
      {isActive && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: size * scale * 0.7,
              height: size * scale * 0.7,
              backgroundColor: 'white',
              opacity: 0.1,
              transition: 'all 500ms ease-in-out'
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: size * scale * 0.4,
              height: size * scale * 0.4,
              backgroundColor: currentColor,
              opacity: 0.2,
              transition: 'all 500ms ease-in-out'
            }}
          />
        </>
      )}

      {/* Particules d'ambiance */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => {
            const angle = (i * 60) * (Math.PI / 180);
            const radius = (size / 2) * 0.8;
            const x = 50 + (radius / size) * 50 * Math.cos(angle);
            const y = 50 + (radius / size) * 50 * Math.sin(angle);

            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: currentColor,
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.3 * progress,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Indication de phase au centre - design amélioré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center transition-all duration-500">
          {/* Icon de phase avec design moderne */}
          <div className="mb-4">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-500 shadow-lg"
              style={{
                backgroundColor: isActive ? `${currentColor}15` : 'transparent',
                border: `3px solid ${currentColor}`,
                transform: `scale(${isActive ? (1 + progress * 0.2) : 1})`
              }}
            >
              <div
                className="text-2xl font-bold transition-all duration-300"
                style={{
                  color: currentColor,
                  transform: `scale(${1 + progress * 0.1})`
                }}
              >
                {phase === 'inhale' && '↑'}
                {phase === 'hold' && '●'}
                {phase === 'exhale' && '↓'}
                {phase === 'pause' && '○'}
              </div>
            </div>
          </div>

          {/* Barre de progrès moderne */}
          {isActive && (
            <div className="relative w-12 h-12 mx-auto">
              <svg
                className="w-12 h-12 transform -rotate-90"
                viewBox="0 0 48 48"
              >
                {/* Background circle */}
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-10"
                  style={{ color: currentColor }}
                />
                {/* Progress circle */}
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${113.1 * progress} 113.1`}
                  strokeLinecap="round"
                  className="transition-all duration-200 filter drop-shadow-sm"
                  style={{
                    color: currentColor,
                    filter: `drop-shadow(0 0 8px ${currentColor}40)`
                  }}
                />
              </svg>

              {/* Petit point indicateur de progression */}
              <div
                className="absolute w-2 h-2 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: currentColor,
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${progress * 360}deg) translateY(-18px)`,
                  boxShadow: `0 0 10px ${currentColor}80`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircleAnimation;