import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import userProfileService from '../../../shared/services/userProfileService';

const ProfileEditView = ({ onNavigate }) => {
  const { user } = useAuth();
  const [_, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    preferred_name: '',
    date_of_birth: '',
    sopk_diagnosis_year: '',
    current_symptoms: [],
    severity_level: '',
    primary_goals: [],
    notification_preferences: {
      daily_reminder: true,
      weekly_summary: true,
      new_features: false
    }
  });

  // Options pour les formulaires
  const symptomsOptions = [
    { value: 'irregular_cycles', label: 'Cycles irréguliers' },
    { value: 'weight_gain', label: 'Prise de poids' },
    { value: 'hair_loss', label: 'Perte de cheveux' },
    { value: 'acne', label: 'Acné' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'mood_swings', label: 'Sautes d\'humeur' },
    { value: 'insulin_resistance', label: 'Résistance à l\'insuline' },
    { value: 'sleep_issues', label: 'Troubles du sommeil' }
  ];

  const severityOptions = [
    { value: 'mild', label: 'Léger' },
    { value: 'moderate', label: 'Modéré' },
    { value: 'severe', label: 'Sévère' }
  ];

  const goalsOptions = [
    { value: 'weight_management', label: 'Gestion du poids' },
    { value: 'cycle_regulation', label: 'Régulation des cycles' },
    { value: 'stress_management', label: 'Gestion du stress' },
    { value: 'nutrition_improvement', label: 'Amélioration nutrition' },
    { value: 'symptom_tracking', label: 'Suivi des symptômes' },
    { value: 'fitness_goals', label: 'Objectifs fitness' }
  ];

  // Charger le profil existant
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        const { data } = await userProfileService.getUserProfile(user.id);

        if (data) {
          setProfile(data);
          setFormData({
            first_name: data.first_name || '',
            preferred_name: data.preferred_name || '',
            date_of_birth: data.date_of_birth || '',
            sopk_diagnosis_year: data.sopk_diagnosis_year || '',
            current_symptoms: data.current_symptoms || [],
            severity_level: data.severity_level || '',
            primary_goals: data.primary_goals || [],
            notification_preferences: {
              daily_reminder: data.notification_preferences?.daily_reminder ?? true,
              weekly_summary: data.notification_preferences?.weekly_summary ?? true,
              new_features: data.notification_preferences?.new_features ?? false
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Gestion des changements de formulaire
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleNotificationChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [field]: checked
      }
    }));
  };

  // Sauvegarder le profil
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      const { data } = await userProfileService.saveUserProfile(user.id, formData);
      setProfile(data);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès ! ✨' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde du profil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-fond-clair)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg font-heading" style={{ color: 'var(--color-primary-lavande)' }}>
            Chargement de ton profil...
          </p>
          <p className="text-emotional text-sm mt-2">
            Quelques instants pour personnaliser ton expérience 🌸
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-fond-clair)' }}>
      {/* Header avec gradient doux */}
      <div className="sticky top-0 z-10 shadow-sm"
           style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #EEF2FF 100%)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate && onNavigate('/dashboard')}
              className="p-3 rounded-xl hover:bg-white/70 transition-all duration-200"
              style={{ color: 'var(--color-primary-lavande)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                   style={{ backgroundColor: 'var(--color-primary-lavande)', color: 'white' }}>
                👤
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold" style={{ color: 'var(--color-text-principal)' }}>
                  Mon Profil
                </h1>
                <p className="text-emotional text-sm">
                  Personnalise ton expérience SOPK 🌸
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message de feedback avec style SOPK */}
      {message && (
        <div className={`mx-4 mt-4 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200' :
          'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <span className="text-lg">✨</span>
            ) : (
              <span className="text-lg">⚠️</span>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSave} className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Informations personnelles */}
        <div className="card-dashboard p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                 style={{ backgroundColor: 'var(--color-primary-lavande)', color: 'white' }}>
              📝
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold" style={{ color: 'var(--color-text-principal)' }}>
                Informations personnelles
              </h2>
              <p className="text-emotional text-sm">Les bases pour mieux te connaître</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Prénom *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="input-sopk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Nom d'usage
              </label>
              <input
                type="text"
                value={formData.preferred_name}
                onChange={(e) => handleInputChange('preferred_name', e.target.value)}
                className="input-sopk"
                placeholder="Comment souhaitez-vous être appelée ?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="input-sopk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Année de diagnostic SOPK
              </label>
              <input
                type="number"
                value={formData.sopk_diagnosis_year}
                onChange={(e) => handleInputChange('sopk_diagnosis_year', parseInt(e.target.value) || '')}
                min="1950"
                max={new Date().getFullYear()}
                className="input-sopk"
                placeholder="Ex: 2020"
              />
            </div>
          </div>
        </div>

        {/* Symptômes actuels */}
        <div className="card-stress p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                 style={{ backgroundColor: 'var(--color-primary-bleu-ciel)', color: 'white' }}>
              🩺
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold" style={{ color: 'var(--color-text-principal)' }}>
                Symptômes actuels
              </h2>
              <p className="text-emotional text-sm">Pour un suivi personnalisé</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {symptomsOptions.map((symptom) => (
              <label key={symptom.value} className="flex items-center p-4 border border-white/20 rounded-xl hover:bg-white/40 cursor-pointer transition-all duration-200 group">
                <input
                  type="checkbox"
                  checked={formData.current_symptoms.includes(symptom.value)}
                  onChange={(e) => handleArrayChange('current_symptoms', symptom.value, e.target.checked)}
                  className="mr-3 w-5 h-5 rounded-md border-2 border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-sm font-medium group-hover:text-purple-700 transition-colors" style={{ color: 'var(--color-text-principal)' }}>
                  {symptom.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Niveau de sévérité */}
        <div className="card-activite p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                 style={{ backgroundColor: 'var(--color-accent-corail)', color: 'white' }}>
              📊
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold" style={{ color: 'var(--color-text-principal)' }}>
                Niveau de sévérité
              </h2>
              <p className="text-emotional text-sm">Aide-nous à mieux t'accompagner</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {severityOptions.map((severity) => (
              <label key={severity.value} className="flex items-center p-4 border border-white/20 rounded-xl hover:bg-white/40 cursor-pointer transition-all duration-200 group">
                <input
                  type="radio"
                  name="severity_level"
                  value={severity.value}
                  checked={formData.severity_level === severity.value}
                  onChange={(e) => handleInputChange('severity_level', e.target.value)}
                  className="mr-3 w-5 h-5 text-pink-500 border-gray-300 focus:ring-pink-500 focus:ring-2"
                />
                <span className="text-sm font-medium group-hover:text-pink-700 transition-colors" style={{ color: 'var(--color-text-principal)' }}>
                  {severity.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Objectifs principaux */}
        <div className="card-nutrition p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                 style={{ backgroundColor: 'var(--color-accent-vert-sauge)', color: 'white' }}>
              🎯
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold" style={{ color: 'var(--color-text-principal)' }}>
                Objectifs principaux
              </h2>
              <p className="text-emotional text-sm">Tes priorités pour ton bien-être</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalsOptions.map((goal) => (
              <label key={goal.value} className="flex items-center p-4 border border-white/20 rounded-xl hover:bg-white/40 cursor-pointer transition-all duration-200 group">
                <input
                  type="checkbox"
                  checked={formData.primary_goals.includes(goal.value)}
                  onChange={(e) => handleArrayChange('primary_goals', goal.value, e.target.checked)}
                  className="mr-3 w-5 h-5 rounded-md border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm font-medium group-hover:text-green-700 transition-colors" style={{ color: 'var(--color-text-principal)' }}>
                  {goal.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Boutons d'action avec style SOPK */}
        <div className="flex gap-4 pt-6 pb-8">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/dashboard')}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Annuler
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <span className="text-lg">💾</span>
                Sauvegarder
              </>
            )}
          </button>
        </div>

        {/* Message motivationnel en bas */}
        <div className="text-center py-4">
          <p className="text-motivational text-sm">
            Chaque petite information nous aide à mieux t'accompagner dans ton parcours SOPK 🌸
          </p>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditView;