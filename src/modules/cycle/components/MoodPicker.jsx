import { MOOD_EMOJIS, getEmojiForMood } from '../utils/symptomsValidation';

export default function MoodPicker({
  value,
  onChange,
  title = "Comment vous sentez-vous ?",
  className = ''
}) {
  const moodLevels = [
    { value: 1, label: 'Très mal', color: 'bg-red-50 border-red-200 text-red-700' },
    { value: 2, label: 'Mal', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { value: 3, label: 'Pas terrible', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { value: 4, label: 'Moyen', color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
    { value: 5, label: 'Correct', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { value: 6, label: 'Bien', color: 'bg-green-50 border-green-200 text-green-700' },
    { value: 7, label: 'Très bien', color: 'bg-green-50 border-green-200 text-green-700' },
    { value: 8, label: 'Super', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { value: 9, label: 'Excellent', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { value: 10, label: 'Parfait', color: 'bg-pink-50 border-pink-200 text-pink-700' }
  ];

  const handleMoodSelect = (moodValue) => {
    onChange(moodValue);
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Current mood display */}
        {value && (
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl">{getEmojiForMood(value)}</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {moodLevels.find(m => m.value === value)?.label}
              </p>
              <p className="text-sm text-gray-500">
                {value}/10
              </p>
            </div>
          </div>
        )}

        {!value && (
          <p className="text-sm text-gray-600">
            Choisissez l'emoji qui correspond à votre humeur
          </p>
        )}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {moodLevels.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            className={`
              relative p-3 rounded-xl border-2 transition-all duration-200
              hover:scale-105 active:scale-95
              ${value === mood.value
                ? `${mood.color} border-current shadow-md ring-2 ring-offset-2 ring-current/20`
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
              }
            `}
            aria-label={`Humeur ${mood.label} (${mood.value}/10)`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">
                {MOOD_EMOJIS[mood.value]}
              </div>
              <div className="text-xs font-medium">
                {mood.value}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Scale indicators */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <span className="text-base">😢</span>
          Très mal
        </span>
        <span className="flex items-center gap-1">
          Parfait
          <span className="text-base">🥰</span>
        </span>
      </div>

      {/* Quick mood buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleMoodSelect(3)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${value === 3
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          😐 Neutre
        </button>

        <button
          onClick={() => handleMoodSelect(6)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${value === 6
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          😊 Bien
        </button>

        <button
          onClick={() => handleMoodSelect(9)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${value === 9
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          😄 Excellent
        </button>
      </div>
    </div>
  );
}