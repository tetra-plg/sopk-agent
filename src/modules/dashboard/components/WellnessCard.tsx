/**
 * 🧘 Carte Pause bien-être - Respiration/Stress
 *
 * Affiche une technique de respiration avec possibilité de démarrage
 */

interface WellnessCardProps {
  techniques: any[];
  onStartBreathingExercise: () => void;
}

const WellnessCard = ({ techniques, onStartBreathingExercise }: WellnessCardProps) => {
  return (
    <div className="card-stress p-4 md:p-6 transform hover:scale-105 transition-transform duration-200 flex flex-col">
      <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--color-primary-bleu-ciel)' }}>
        🧘 Pause bien-être
      </h3>
      <div className="mb-4">
        <div className="mb-3">
          {techniques.length > 0 && (() => {
            const quickTechnique = techniques.find(t => t.id === 'quick') || techniques[0];
            return (
              <>
                <h4 className="font-medium mb-1" style={{ color: 'var(--color-text-principal)' }}>
                  {quickTechnique.name}
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondaire)' }}>
                  {quickTechnique.description} • {Math.floor(quickTechnique.duration_seconds / 60)} min
                </p>
              </>
            );
          })()}
        </div>
        <div className="flex gap-2 text-xs">
          <span className="badge-bleu-ciel">⚡ Express</span>
          <span className="badge-bleu-ciel">🫁 Anti-stress</span>
        </div>
      </div>
      <div className="flex-grow"></div>
      <button
        onClick={onStartBreathingExercise}
        className="w-full btn-secondary"
      >
        {techniques.length > 0 && (techniques.find(t => t.id === 'quick') || techniques[0])?.icon} Commencer maintenant
      </button>
    </div>
  );
};

export default WellnessCard;