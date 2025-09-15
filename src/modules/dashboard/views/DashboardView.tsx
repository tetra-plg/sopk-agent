import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { symptomsService } from '../../cycle/services/symptomsService';
import userProfileService from '../../../shared/services/userProfileService';
import { useMealSuggestions } from '../../nutrition/hooks/useMealSuggestions';
import MealDetailModal from '../../nutrition/components/MealDetailModal';
import TrackingSuccess from '../../nutrition/components/TrackingSuccess';
import BreathingSession from '../../stress/components/BreathingSession';
import { useBreathingTechniques } from '../../stress/hooks/useBreathingTechniques';
import DailyJournalView from '../../cycle/views/DailyJournalView';
import StateEvolutionTracker from '../components/StateEvolutionTracker';
import NutritionTracker from '../components/NutritionTracker';
import StressManagementTracker from '../components/StressManagementTracker';
import SwipeContainer from '../../../shared/components/SwipeContainer';

const DashboardView = ({ onNavigate }) => {
  const { user } = useAuth();
  const { techniques } = useBreathingTechniques();
  const [currentView, setCurrentView] = useState('dashboard');
  const [todaySymptoms, setTodaySymptoms] = useState(null);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // États pour les modales nutrition
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [trackedMeal, setTrackedMeal] = useState(null);
  const [showTrackingSuccess, setShowTrackingSuccess] = useState(false);

  // État pour la session de respiration
  const [showBreathingSession, setShowBreathingSession] = useState(false);

  // Hook pour les suggestions de repas
  const mealSuggestions = useMealSuggestions({
    userId: user?.id,
    symptoms: todaySymptoms ? [
      ...(todaySymptoms.fatigue_level >= 4 ? ['fatigue'] : []),
      ...(todaySymptoms.pain_level >= 3 ? ['pain'] : [])
    ] : [],
    timeOfDay: new Date().getHours() < 12 ? 'breakfast' :
               new Date().getHours() < 15 ? 'lunch' : 'dinner',
    maxPrepTime: 30
  });

  // Charger le profil utilisateur
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        const { data } = await userProfileService.getUserProfile(user.id);
        setUserProfile(data);
      } catch (error) {
        // Profil optionnel, pas d'erreur bloquante
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user?.id]);

  // Charger les symptômes du jour
  useEffect(() => {
    const loadTodaySymptoms = async () => {
      if (!user?.id) {
        setLoadingSymptoms(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await symptomsService.getDailyEntry(user.id, today);

        if (error && error.status !== 406 && error.code !== 'PGRST116') {
          // Erreur non bloquante
        } else {
          setTodaySymptoms(data);
        }
      } catch (error) {
        // Erreur non bloquante
      } finally {
        setLoadingSymptoms(false);
      }
    };

    loadTodaySymptoms();
  }, [user?.id]);

  // Vue journal quotidien
  if (currentView === 'journal') {
    return <DailyJournalView onBack={() => setCurrentView('dashboard')} />;
  }

  // Session de respiration
  if (showBreathingSession) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <BreathingSession
            techniqueId="quick"
            userId={user?.id}
            onComplete={() => {
              setShowBreathingSession(false);
            }}
            onExit={() => {
              setShowBreathingSession(false);
            }}
          />
        </div>
      </div>
    );
  }

  // Fonctions pour la gestion des repas
  const handleShowMealDetails = () => {
    const quickSuggestion = mealSuggestions.getQuickSuggestion();
    if (quickSuggestion) {
      setSelectedMeal(quickSuggestion);
      setShowMealModal(true);
    }
  };

  const handleTrackMeal = async (mealId, mealType) => {
    try {
      const result = await mealSuggestions.trackMealChosen(mealId, mealType, {
        satisfaction: 5,
        portion_size: 'normal'
      });

      if (result.success) {
        const meal = mealSuggestions.allMeals.find(m => m.id === mealId);
        setTrackedMeal(meal);
        setShowTrackingSuccess(true);
        setShowMealModal(false);
      }
    } catch (error) {

    }
  };

  const handleQuickTrackMeal = async () => {
    const quickSuggestion = mealSuggestions.getQuickSuggestion();
    if (quickSuggestion) {
      await handleTrackMeal(quickSuggestion.id, quickSuggestion.category);
    }
  };

  const handleStartBreathingExercise = () => {
    setShowBreathingSession(true);
  };

  // Obtenir la suggestion du jour
  const todaySuggestion = mealSuggestions.getQuickSuggestion();

  // Obtenir le nom d'affichage
  const getDisplayName = () => {
    // 1. Essayer le prénom du profil
    if (userProfile?.preferred_name) {
      return userProfile.preferred_name;
    }
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }

    // 2. Essayer les métadonnées utilisateur Supabase
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.user_metadata?.preferred_name) {
      return user.user_metadata.preferred_name;
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0]; // Premier prénom si nom complet
    }

    // 3. Extraire du nom dans app_metadata
    if (user?.app_metadata?.name) {
      return user.app_metadata.name.split(' ')[0];
    }

    // 4. Extraire de l'email (partie avant @)
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitaliser la première lettre
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    // 5. Fallback
    return 'Utilisatrice';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-6 md:mb-8 lg:mb-10 text-center">
        <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-lavande) 0%, var(--color-primary-bleu-ciel) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
          Bonjour {getDisplayName()} 🌸
        </h1>
        <p className="font-emotional italic text-base md:text-lg px-4"
           style={{ color: 'var(--color-text-secondaire)' }}>
          Prête à prendre soin de toi aujourd'hui ?
        </p>
      </header>

      {/* Grid responsive mobile-first */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Widget État du jour - Prend toute la largeur sur mobile */}
        <div className="card-dashboard p-4 md:p-6 col-span-1 sm:col-span-2 lg:col-span-1 transform hover:scale-105 transition-transform duration-200 flex flex-col">
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
            onClick={() => setCurrentView('journal')}
            className="w-full mt-4 btn-primary"
          >
            📝 {todaySymptoms ? 'Modifier journal' : 'Compléter journal'}
          </button>
        </div>

        {/* Widget Nutrition */}
        <div className="card-nutrition p-4 md:p-6 transform hover:scale-105 transition-transform duration-200 flex flex-col">
          <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-accent-vert-sauge)' }}>
            🥗 Idée repas
          </h3>

          {mealSuggestions.loading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ) : todaySuggestion ? (
            <>
              <div className="mb-4">
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                  {todaySuggestion.name}
                </h4>
                <div className="flex gap-2 text-sm">
                  <span className="badge-vert-sauge">⏱️ {todaySuggestion.prep_time_minutes}min</span>
                  {todaySuggestion.glycemic_index_category === 'low' && (
                    <span className="badge-vert-sauge">🟢 IG bas</span>
                  )}
                </div>
              </div>
              <p className="text-sm font-emotional italic mb-4" style={{ color: 'var(--color-text-secondaire)' }}>
                💚 {todaySuggestion.tips || 'Parfait pour votre bien-être'}
              </p>
              <div className="flex-grow"></div>
              <div className="flex gap-2">
                <button
                  onClick={handleShowMealDetails}
                  className="flex-1 btn-accent-vert text-sm"
                >
                  Voir recette
                </button>
                <button
                  onClick={handleQuickTrackMeal}
                  className="btn-accent-vert px-3"
                  title="Marquer comme consommé"
                >
                  ✅
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                  Aucune suggestion
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondaire)' }}>
                  Complétez votre journal pour des suggestions personnalisées
                </p>
              </div>
              <div className="flex-grow"></div>
              <button
                onClick={() => onNavigate ? onNavigate('/nutrition') : {}}
                className="w-full btn-accent-vert text-sm"
              >
                Explorer les repas
              </button>
            </>
          )}
        </div>

        {/* Widget Bien-être */}
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
            onClick={handleStartBreathingExercise}
            className="w-full btn-secondary"
          >
            {techniques.length > 0 && (techniques.find(t => t.id === 'quick') || techniques[0])?.icon} Commencer maintenant
          </button>
        </div>
      </div>

      {/* Section Conseil du jour */}
      <div className="mt-6 md:mt-8 card-sopk p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #FFF 0%, #EDE9FE 100%)' }}>
        <h2 className="font-heading text-lg md:text-xl font-semibold mb-3 md:mb-4"
            style={{ color: 'var(--color-primary-lavande)' }}>
          💡 Conseil du jour
        </h2>
        <p className="font-emotional italic text-sm md:text-base lg:text-lg"
           style={{ color: 'var(--color-text-principal)' }}>
          "Les oméga-3 peuvent aider à réduire l'inflammation liée au SOPK.
          Pense à inclure du saumon, des noix ou des graines de lin dans tes repas !"
        </p>
      </div>

      {/* Section Tracking */}
      <div className="mt-6 md:mt-8">
        <h2 className="font-heading text-lg md:text-xl font-semibold mb-4 md:mb-6 text-center"
            style={{ color: 'var(--color-primary-lavande)' }}>
          📊 Ton suivi personnalisé
        </h2>

        {/* Version mobile avec swipe */}
        <div className="block lg:hidden">
          <SwipeContainer>
            <StateEvolutionTracker />
            <NutritionTracker />
            <StressManagementTracker onStartBreathing={handleStartBreathingExercise} />
          </SwipeContainer>
        </div>

        {/* Version desktop avec grid */}
        <div className="hidden lg:grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div className="col-span-1">
            <StateEvolutionTracker />
          </div>

          <div className="col-span-1">
            <NutritionTracker />
          </div>

          <div className="col-span-1 lg:col-span-2 xl:col-span-1">
            <StressManagementTracker onStartBreathing={handleStartBreathingExercise} />
          </div>
        </div>
      </div>

      {/* Modales et composants overlay */}
      {showMealModal && selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          isOpen={showMealModal}
          onClose={() => {
            setShowMealModal(false);
            setSelectedMeal(null);
          }}
          onTrackMeal={handleTrackMeal}
        />
      )}

      {showTrackingSuccess && trackedMeal && (
        <TrackingSuccess
          meal={trackedMeal}
          isVisible={showTrackingSuccess}
          onClose={() => {
            setShowTrackingSuccess(false);
            setTrackedMeal(null);
          }}
          onViewHistory={() => {
            onNavigate && onNavigate('/nutrition/history');
            setShowTrackingSuccess(false);
            setTrackedMeal(null);
          }}
          onRateMeal={(rating) => {

            setShowTrackingSuccess(false);
            setTrackedMeal(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardView;