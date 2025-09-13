import { useState } from 'react';

export default function NotesInput({
  value = '',
  onChange,
  placeholder = "Ajoutez des notes sur votre journée...",
  maxLength = 1000,
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars <= 100;

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Notes personnelles
        </h3>
        <div className={`text-sm transition-colors ${
          isNearLimit ? 'text-orange-600' : 'text-gray-400'
        }`}>
          {value.length}/{maxLength}
        </div>
      </div>

      {/* Textarea */}
      <div className={`
        relative rounded-lg border-2 transition-all duration-200
        ${isFocused ? 'border-purple-300 ring-2 ring-purple-200' : 'border-gray-200'}
        ${isNearLimit ? 'border-orange-300' : ''}
      `}>
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full p-4 bg-transparent border-0 resize-none focus:outline-none placeholder-gray-400"
          rows={4}
          maxLength={maxLength}
        />

        {/* Character count warning */}
        {isNearLimit && (
          <div className="absolute bottom-2 right-2">
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {remainingChars} restants
            </span>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Décrivez comment vous vous sentez, vos symptômes ou tout autre détail important
        </p>

        {value.length > 0 && (
          <button
            onClick={() => onChange('')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      {value.length === 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500 mb-2">Suggestions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Fatigue inhabituelle',
              'Douleurs abdominales',
              'Bien dormi',
              'Stress au travail',
              'Activité physique',
              'Changement d\'alimentation'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onChange(suggestion)}
                className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}