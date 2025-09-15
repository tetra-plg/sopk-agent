/**
 * 📊 Graphique Nutrition Dashboard
 *
 * Visualise les statistiques de consommation alimentaire
 */

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../../core/auth/AuthContext';
import trackingService from '../../nutrition/services/trackingService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const NutritionChart = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await trackingService.getUserCookingStats(user.id, 30);
        setStats(data);
      } catch (error) {
        console.error('Error loading nutrition stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalRecipesMade === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Mes habitudes nutrition
        </h3>
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🍽️</div>
          <p>Commence à tracker tes repas pour voir tes statistiques !</p>
        </div>
      </div>
    );
  }

  // Données pour le graphique des types de repas
  const mealTypeData = {
    labels: Object.keys(stats.mealTypeDistribution).map(type => {
      const labels = {
        breakfast: 'Petit-déj',
        lunch: 'Déjeuner',
        dinner: 'Dîner',
        snack: 'Collation'
      };
      return labels[type] || type;
    }),
    datasets: [
      {
        data: Object.values(stats.mealTypeDistribution),
        backgroundColor: [
          '#FED7AA', // Orange clair pour breakfast
          '#BFDBFE', // Bleu clair pour lunch
          '#C7D2FE', // Indigo clair pour dinner
          '#F3E8FF', // Violet clair pour snack
        ],
        borderColor: [
          '#F97316', // Orange pour breakfast
          '#3B82F6', // Bleu pour lunch
          '#6366F1', // Indigo pour dinner
          '#8B5CF6', // Violet pour snack
        ],
        borderWidth: 2,
      },
    ],
  };

  // Données pour le graphique des bénéfices SOPK
  const benefitsData = {
    labels: Object.keys(stats.topBenefits),
    datasets: [
      {
        label: 'Bénéfices SOPK recherchés',
        data: Object.values(stats.topBenefits),
        backgroundColor: '#6EE7B7',
        borderColor: '#10B981',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '60%',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        📊 Mes habitudes nutrition
      </h3>

      {/* Statistiques générales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalRecipesMade}</div>
          <div className="text-xs text-gray-600">Repas trackés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.averageTasteRating}/5</div>
          <div className="text-xs text-gray-600">Note moyenne</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.favoriteRate}%</div>
          <div className="text-xs text-gray-600">Favoris</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.averageCookingTime}min</div>
          <div className="text-xs text-gray-600">Temps moyen</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Répartition par type de repas */}
        {Object.keys(stats.mealTypeDistribution).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Répartition des repas</h4>
            <div className="h-48">
              <Doughnut data={mealTypeData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Bénéfices SOPK les plus recherchés */}
        {Object.keys(stats.topBenefits).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Focus SOPK</h4>
            <div className="h-48">
              <Bar data={benefitsData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionChart;