/**
 * 📊 Vue Historique Nutrition
 *
 * Affichage de l'historique des repas consommés avec stats et insights.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import trackingService from '../services/trackingService';
import NutritionTag from '../../../shared/components/ui/NutritionTag';
import PrepTimeIndicator from '../../../shared/components/ui/PrepTimeIndicator';

const NutritionHistoryView = ({ onBack }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(7); // 7 jours par défaut

  useEffect(() => {
    loadHistory();
    loadStats();
  }, [selectedPeriod, user?.id]);

  const loadHistory = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data } = await trackingService.getMealHistory(user.id, 20);
      setHistory(data || []);
    } catch (error) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const { data } = await trackingService.getNutritionStats(user.id, selectedPeriod);
      calculateStats(data || []);
    } catch (error) {
      setStats(null);
    }
  };

  const handleDeleteMeal = async (trackingId, mealTitle) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${mealTitle}" de votre historique ?`)) {
      return;
    }

    try {
      await trackingService.deleteMealTracking(trackingId);
      // Recharger l'historique après suppression
      await loadHistory();
      await loadStats();
    } catch (error) {
      alert('Erreur lors de la suppression du repas. Veuillez réessayer.');
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats(null);
      return;
    }

    const totalMeals = data.length;
    const avgSatisfaction = data
      .filter(item => item.taste_rating)
      .reduce((sum, item) => sum + item.taste_rating, 0) /
      data.filter(item => item.taste_rating).length;

    const favoriteCount = data.filter(item => item.would_make_again).length;
    const lowGICount = data.filter(item =>
      item.recipes?.glycemic_index_category === 'low'
    ).length;

    const nutrientFrequency = {};
    data.forEach(item => {
      item.recipes?.main_nutrients?.forEach(nutrient => {
        nutrientFrequency[nutrient] = (nutrientFrequency[nutrient] || 0) + 1;
      });
    });

    const topNutrient = Object.entries(nutrientFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    setStats({
      totalMeals,
      avgSatisfaction: avgSatisfaction || 0,
      favoritePercentage: Math.round((favoriteCount / totalMeals) * 100),
      lowGIPercentage: Math.round((lowGICount / totalMeals) * 100),
      topNutrient,
      nutrientFrequency
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: '🌅 Petit-déj',
      lunch: '🍽️ Déjeuner',
      dinner: '🌙 Dîner',
      snack: '🥨 Collation'
    };
    return labels[type] || type;
  };

  const getRatingEmoji = (rating) => {
    if (!rating) return '😐';
    if (rating <= 2) return '😞';
    if (rating === 3) return '😐';
    if (rating === 4) return '😊';
    return '😍';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ← Retour
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📊 Mon Historique Nutrition
            </h1>
            <p className="text-gray-600">
              Suivi de tes habitudes alimentaires et insights personnalisés
            </p>
          </div>
        </div>
      </header>

      {/* Filtres période */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 7, label: '7 derniers jours' },
            { value: 14, label: '2 semaines' },
            { value: 30, label: '1 mois' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats résumées */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.totalMeals}</div>
            <div className="text-sm text-gray-600">Repas trackés</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgSatisfaction.toFixed(1)}/5
            </div>
            <div className="text-sm text-gray-600">Satisfaction moyenne</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{stats.favoritePercentage}%</div>
            <div className="text-sm text-gray-600">Repas à refaire</div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{stats.lowGIPercentage}%</div>
            <div className="text-sm text-gray-600">Index glycémique bas</div>
          </div>
        </div>
      )}

      {/* Message d'encouragement */}
      {stats && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-8 border">
          <h3 className="font-semibold text-gray-800 mb-2">
            🎯 Tes insights SOPK
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            {stats.lowGIPercentage >= 70 && (
              <p>✅ Excellent ! Tu privilégies les aliments à IG bas (bon pour l'insuline)</p>
            )}
            {stats.favoritePercentage >= 60 && (
              <p>😍 Tu découvres plein de repas que tu aimes refaire</p>
            )}
            {stats.topNutrient && (
              <p>
                🥗 Ton nutriment star : <NutritionTag type={stats.topNutrient} size="xs" />
              </p>
            )}
            {stats.avgSatisfaction >= 4 && (
              <p>🌟 Tes choix alimentaires te satisfont vraiment !</p>
            )}
          </div>
        </div>
      )}

      {/* Historique des repas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📋 Historique détaillé</h2>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de ton historique...</p>
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aucun repas tracké pour l'instant
            </h3>
            <p className="text-gray-600 mb-4">
              Commence à tracker tes repas pour voir ton historique ici !
            </p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {entry.recipes?.title || 'Repas supprimé'}
                    </h3>
                    <div className="flex gap-2 items-center text-sm text-gray-600 mt-1">
                      <span>{getMealTypeLabel(entry.meal_type)}</span>
                      <span>•</span>
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.taste_rating && (
                      <span className="text-lg" title={`${entry.taste_rating}/5`}>
                        {getRatingEmoji(entry.taste_rating)}
                      </span>
                    )}
                    {entry.would_make_again && (
                      <span className="text-green-600 text-sm">❤️ Favori</span>
                    )}
                    <button
                      onClick={() => handleDeleteMeal(entry.id, entry.recipes?.title || 'ce repas')}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Supprimer ce repas"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {entry.recipes && (
                  <div className="flex gap-2 flex-wrap">
                    <PrepTimeIndicator
                      minutes={entry.recipes.prep_time_minutes}
                      variant="badge"
                      size="xs"
                    />
                    {entry.recipes.main_nutrients?.slice(0, 3).map(nutrient => (
                      <NutritionTag key={nutrient} type={nutrient} size="xs" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionHistoryView;