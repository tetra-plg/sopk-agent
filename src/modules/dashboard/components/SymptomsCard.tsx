/**
 * 📝 Carte État du jour - Symptômes
 *
 * Affiche l'état des symptômes du jour avec possibilité de modification
 */

interface SymptomsCardProps {
  todaySymptoms: any;
  loadingSymptoms: boolean;
  onEditJournal: () => void;
}

const SymptomsCard = ({ todaySymptoms, loadingSymptoms, onEditJournal }: SymptomsCardProps) => {
  return (
    <div className="card-dashboard p-3 md:p-6 col-span-1 sm:col-span-2 lg:col-span-1 transform hover:scale-105 transition-transform duration-200 flex flex-col h-full min-h-[320px]">
      <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: 'var(--color-primary-lavande)' }}>
        ✨ État du jour
      </h3>

      {loadingSymptoms ? (
        <div className="space-y-3">
          <div className="animate-pulse flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="animate-pulse flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="animate-pulse flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Fatigue */}
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--color-text-secondaire)' }}>Fatigue</span>
            <span className="font-medium badge-bleu-ciel">
              {todaySymptoms?.fatigue_level ? `${todaySymptoms.fatigue_level}/5 ${todaySymptoms.fatigue_level <= 2 ? '🌟' : todaySymptoms.fatigue_level <= 3 ? '😴' : '😵'}` : 'Non renseigné'}
            </span>
          </div>

          {/* Douleurs */}
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--color-text-secondaire)' }}>Douleurs</span>
            <span className="font-medium badge-vert-sauge">
              {todaySymptoms?.pain_level ? `${todaySymptoms.pain_level}/5 ${todaySymptoms.pain_level <= 2 ? '✨' : todaySymptoms.pain_level <= 3 ? '😐' : '😣'}` : 'Non renseigné'}
            </span>
          </div>

          {/* Flux menstruel */}
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--color-text-secondaire)' }}>Règles</span>
            <span className="font-medium badge-lavande">
              {todaySymptoms?.period_flow ? `${todaySymptoms.period_flow}/5 🩸` : 'Aucun flux'}
            </span>
          </div>
        </div>
      )}

      <div className="flex-grow"></div>
      <button
        onClick={onEditJournal}
        className="w-full mt-4 btn-primary"
      >
        📝 {todaySymptoms ? 'Modifier journal' : 'Compléter journal'}
      </button>
    </div>
  );
};

export default SymptomsCard;