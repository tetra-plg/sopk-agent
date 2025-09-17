import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { symptomsService } from '../../cycle/services/symptomsService';
import userProfileService from '../../../shared/services/userProfileService';
import { useMealSuggestions } from '../../nutrition/hooks/useMealSuggestions';
import MealDetailModal from '../../nutrition/components/MealDetailModal';
import TrackingSuccess from '../../nutrition/components/TrackingSuccess';
import BreathingSession from '../../stress/components/BreathingSession';
import CookingModeView from '../../nutrition/views/CookingModeView';
import { useBreathingTechniques } from '../../stress/hooks/useBreathingTechniques';
import DailyJournalView from '../../cycle/views/DailyJournalView';
import StateEvolutionTracker from '../components/StateEvolutionTracker';
import NutritionTracker from '../components/NutritionTracker';
import StressManagementTracker from '../components/StressManagementTracker';
import SwipeContainer from '../../../shared/components/SwipeContainer';
import SymptomsCard from '../components/SymptomsCard';
import NutritionCard from '../components/NutritionCard';
import WellnessCard from '../components/WellnessCard';
import ActivityCard from '../components/ActivityCard';
import type { Recipe } from '../../../types/database';

const DashboardView = ({ onNavigate }) => {
  const { user } = useAuth();
  const { techniques } = useBreathingTechniques();
  const [currentView, setCurrentView] = useState('dashboard');
  const [todaySymptoms, setTodaySymptoms] = useState(null);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [, _setLoadingProfile] = useState(true);

  // États pour les modales nutrition
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [trackedMeal, setTrackedMeal] = useState(null);
  const [showTrackingSuccess, setShowTrackingSuccess] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

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
        _setLoadingProfile(false);
        return;
      }

      try {
        const { data } = await userProfileService.getUserProfile(user.id);
        setUserProfile(data);
      } catch {
        // Profil optionnel, pas d'erreur bloquante
      } finally {
        _setLoadingProfile(false);
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
      } catch {
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
    } catch {
      // Gestion d'erreur silencieuse
    }
  };

  const _handleQuickTrackMeal = async () => {
    const quickSuggestion = mealSuggestions.getQuickSuggestion();
    if (quickSuggestion) {
      await handleTrackMeal(quickSuggestion.id, quickSuggestion.category);
    }
  };

  const handleStartBreathingExercise = () => {
    setShowBreathingSession(true);
  };

  const handleStartCooking = (recipe) => {
    setCookingRecipe(recipe);
  };

  // Obtenir la suggestion du jour
  const todaySuggestion: Recipe | null = mealSuggestions.getQuickSuggestion();

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
    <div className="p-3 md:p-6 lg:p-8">
      <header className="mb-4 md:mb-8 lg:mb-10 text-center mt-6">
        <h1 className="font-heading text-xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-3"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-lavande) 0%, var(--color-primary-bleu-ciel) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
          Bonjour {getDisplayName()} 🌸
        </h1>
        <p className="font-emotional italic text-sm md:text-lg px-4"
           style={{ color: 'var(--color-text-secondaire)' }}>
          Prête à prendre soin de toi aujourd'hui ?
        </p>
      </header>

      <div className="mt-6 md:mt-8">
        {/* Version mobile avec swipe */}
        <div className="block lg:hidden">
          <SwipeContainer>
            <SymptomsCard
              todaySymptoms={todaySymptoms}
              loadingSymptoms={loadingSymptoms}
              onEditJournal={() => setCurrentView('journal')}
            />
            <NutritionCard
              todaySuggestion={todaySuggestion}
              loading={mealSuggestions.loading}
              onShowMealDetails={handleShowMealDetails}
              onNavigate={onNavigate}
            />
            <WellnessCard
              techniques={techniques}
              onStartBreathingExercise={handleStartBreathingExercise}
            />
            <ActivityCard
              onNavigate={onNavigate}
            />
          </SwipeContainer>
        </div>

      
        {/* Version desktop avec grid */}
        <div className="hidden lg:grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 items-stretch">
          <div className="col-span-1">
            {/* Carte État du jour */}
            <SymptomsCard
              todaySymptoms={todaySymptoms}
              loadingSymptoms={loadingSymptoms}
              onEditJournal={() => setCurrentView('journal')}
            />
          </div>

          <div className="col-span-1">
            {/* Carte Nutrition */}
            <NutritionCard
              todaySuggestion={todaySuggestion}
              loading={mealSuggestions.loading}
              onShowMealDetails={handleShowMealDetails}
              onNavigate={onNavigate}
            />
          </div>

          <div className="col-span-1">
            {/* Carte Bien-être */}
            <WellnessCard
              techniques={techniques}
              onStartBreathingExercise={handleStartBreathingExercise}
            />
          </div>

          <div className="col-span-1">
            {/* Carte Activité */}
            <ActivityCard
              onNavigate={onNavigate}
            />
          </div>
        </div>
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
        <div className="hidden lg:grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 items-stretch">
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
          onStartCooking={handleStartCooking}
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
          onRateMeal={() => {
            setShowTrackingSuccess(false);
            setTrackedMeal(null);
          }}
        />
      )}

      {/* Mode cuisine guidé */}
      {cookingRecipe && (
        <div className="fixed inset-0 z-50">
          <CookingModeView
            recipeId={cookingRecipe.id}
            onBack={() => setCookingRecipe(null)}
            onComplete={() => {
              setCookingRecipe(null);
              // Optionnel : afficher une notification de succès
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardView;