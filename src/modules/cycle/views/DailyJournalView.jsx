import { useEffect, useState } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import { symptomsService } from '../services/symptomsService';
import { useJournalForm } from '../hooks/useJournalForm';
import { useAutoSave } from '../hooks/useAutoSave';

import DateNavigator from '../../../shared/components/DateNavigator';
import SymptomSlider from '../components/SymptomSlider';
import MoodPicker from '../components/MoodPicker';
import NotesInput from '../components/NotesInput';

import {
  BeakerIcon,
  BoltSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function DailyJournalView({ onBack }) {
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const journalForm = useJournalForm(new Date(), user?.id);
  const {
    currentDate,
    formData,
    isLoading,
    hasChanges,
    lastSaved,
    updateField,
    resetForm,
    changeDate,
    markAsSaved,
    setLoadingState,
    getValidatedData,
    getFormattedDate,
    canSave,
    isEmpty
  } = journalForm;

  const { forceSave, isAutoSaveScheduled } = useAutoSave({
    userId: user?.id,
    formData,
    currentDate,
    hasChanges,
    getValidatedData,
    getFormattedDate,
    markAsSaved,
    setLoadingState
  });

  // Charger les données existantes lors du changement de date
  useEffect(() => {
    let isCancelled = false;

    const loadDayData = async () => {
      if (!user?.id) return;

      setIsInitialLoading(true);
      setLoadError(null);

      try {
        const dateString = getFormattedDate();
        const { data, error } = await symptomsService.getDailyEntry(user.id, dateString);

        if (isCancelled) return;

        if (error) {
          throw error;
        }

        resetForm(data);
      } catch (error) {
        if (isCancelled) return;

        // Ne pas afficher d'erreur pour l'absence de données (comportement normal)
        if (error.status !== 406 && error.code !== 'PGRST116') {
          console.error('❌ Erreur chargement données jour:', error);
          setLoadError(error);
        }
        resetForm(); // Reset avec valeurs par défaut
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    loadDayData();

    return () => {
      isCancelled = true;
    };
  }, [currentDate, user?.id]);

  const handleDateChange = async (newDate) => {
    // Sauvegarder avant de changer de date
    if (hasChanges) {
      await forceSave();
    }
    changeDate(newDate);
  };

  const handleManualSave = async () => {
    const result = await forceSave();
    if (result.success) {
      console.log('✅ Sauvegarde manuelle réussie');
    } else {
      console.error('❌ Erreur sauvegarde manuelle:', result.error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: '#6B7280' }}>Veuillez vous connecter pour accéder au journal</p>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#A78BFA' }}></div>
          <p style={{ color: '#6B7280' }}>Chargement de votre journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          {onBack && (
            <div className="flex items-center mb-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.target.style.color = '#1F2937'}
                onMouseLeave={(e) => e.target.style.color = '#6B7280'}
              >
                <span>←</span>
                <span>Retour</span>
              </button>
            </div>
          )}

          <DateNavigator
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />

          {/* Save status */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="flex items-center gap-2" style={{ color: '#93C5FD' }}>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Sauvegarde en cours...</span>
                </div>
              )}

              {!isLoading && hasChanges && (
                <div style={{ color: '#FB7185' }}>
                  <span>• Modifications non sauvegardées</span>
                </div>
              )}

              {!isLoading && !hasChanges && lastSaved && (
                <div style={{ color: '#6EE7B7' }}>
                  <span>✓ Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {isAutoSaveScheduled && (
                <div className="text-xs" style={{ color: '#93C5FD' }}>
                  <span>Auto-save dans 2s...</span>
                </div>
              )}
            </div>

            {canSave && (
              <button
                onClick={handleManualSave}
                disabled={isLoading}
                className="px-3 py-1 text-white text-xs rounded-xl disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#A78BFA' }}
                onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#9333EA')}
                onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#A78BFA')}
              >
                Sauvegarder
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loadError && (
          <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185' }}>
            <p className="text-sm" style={{ color: '#FB7185' }}>
              Erreur lors du chargement des données. Veuillez rafraîchir la page.
            </p>
          </div>
        )}

        {/* Period Flow */}
        <SymptomSlider
          type="period"
          value={formData.period_flow}
          onChange={(value) => updateField('period_flow', value)}
          title="Flux menstruel"
          description="Indiquez l'intensité de vos règles aujourd'hui"
          icon={<BeakerIcon className="h-6 w-6" />}
        />

        {/* Fatigue Level */}
        <SymptomSlider
          type="fatigue"
          value={formData.fatigue_level}
          onChange={(value) => updateField('fatigue_level', value)}
          title="Niveau de fatigue"
          description="Comment évaluez-vous votre niveau d'énergie ?"
          icon={<BoltSlashIcon className="h-6 w-6" />}
        />

        {/* Pain Level */}
        <SymptomSlider
          type="pain"
          value={formData.pain_level}
          onChange={(value) => updateField('pain_level', value)}
          title="Niveau de douleur"
          description="Ressentez-vous des douleurs ou inconforts ?"
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        />

        {/* Mood Picker */}
        <MoodPicker
          value={formData.mood_score}
          onChange={(value) => updateField('mood_score', value)}
          title="Comment vous sentez-vous aujourd'hui ?"
        />

        {/* Notes */}
        <NotesInput
          value={formData.notes}
          onChange={(value) => updateField('notes', value)}
          placeholder="Décrivez votre journée, vos ressentis, ou tout autre détail important..."
        />

        {/* Empty state encouragement */}
        {isEmpty && !hasChanges && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#1F2937' }}>
              Commencez votre journal quotidien
            </h3>
            <p className="max-w-md mx-auto" style={{ color: '#6B7280' }}>
              Prenez quelques minutes pour enregistrer comment vous vous sentez aujourd'hui.
              Vos données vous aideront à mieux comprendre vos cycles.
            </p>
          </div>
        )}

        {/* Footer spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}