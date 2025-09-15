/**
 * 📈 Graphique Symptômes Dashboard
 *
 * Visualise l'évolution des symptômes SOPK sur les derniers jours
 */

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../../../core/auth/AuthContext';
import { symptomsService } from '../../cycle/services/symptomsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SymptomsChart = () => {
  const { user } = useAuth();
  const [symptomsData, setSymptomsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSymptomsHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Charger les 7 derniers jours de symptômes
        const days = 7;
        const promises = [];
        const dates = [];

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          dates.push({
            date: dateString,
            label: date.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric'
            })
          });
          promises.push(symptomsService.getSymptomsByDate(user.id, dateString));
        }

        const results = await Promise.all(promises);
        const symptomsWithDates = results.map((result, index) => ({
          ...dates[index],
          symptoms: result.data
        }));

        setSymptomsData(symptomsWithDates);
      } catch (error) {
        console.error('Error loading symptoms history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSymptomsHistory();
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

  if (symptomsData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📈 Évolution des symptômes
        </h3>
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📝</div>
          <p>Commence ton journal quotidien pour voir l'évolution !</p>
        </div>
      </div>
    );
  }

  // Préparer les données pour le graphique
  const labels = symptomsData.map(day => day.label);
  const fatigueData = symptomsData.map(day => day.symptoms?.fatigue_level || 0);
  const painData = symptomsData.map(day => day.symptoms?.pain_level || 0);
  const stressData = symptomsData.map(day => day.symptoms?.stress_level || 0);
  const moodData = symptomsData.map(day => day.symptoms?.mood_level || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Fatigue',
        data: fatigueData,
        borderColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Douleur',
        data: painData,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Stress',
        data: stressData,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Humeur',
        data: moodData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
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
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  // Calculer les moyennes
  const avgFatigue = (fatigueData.reduce((a, b) => a + b, 0) / fatigueData.filter(x => x > 0).length || 0).toFixed(1);
  const avgPain = (painData.reduce((a, b) => a + b, 0) / painData.filter(x => x > 0).length || 0).toFixed(1);
  const avgStress = (stressData.reduce((a, b) => a + b, 0) / stressData.filter(x => x > 0).length || 0).toFixed(1);
  const avgMood = (moodData.reduce((a, b) => a + b, 0) / moodData.filter(x => x > 0).length || 0).toFixed(1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        📈 Évolution des symptômes (7 jours)
      </h3>

      {/* Moyennes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{avgFatigue}</div>
          <div className="text-xs text-gray-600">Fatigue moy.</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{avgPain}</div>
          <div className="text-xs text-gray-600">Douleur moy.</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{avgStress}</div>
          <div className="text-xs text-gray-600">Stress moy.</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{avgMood}</div>
          <div className="text-xs text-gray-600">Humeur moy.</div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-48">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Légende des niveaux */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Échelle: 1 = Très faible • 2 = Faible • 3 = Modéré • 4 = Fort • 5 = Très fort
      </div>
    </div>
  );
};

export default SymptomsChart;