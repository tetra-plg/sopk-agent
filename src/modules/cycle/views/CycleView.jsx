const CycleView = () => {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📝 Journal Quotidien
        </h1>
        <p className="text-gray-600">
          Suivi de tes symptômes et cycle menstruel
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Mercredi 13 septembre 2024
            </h2>
            <div className="flex gap-4 text-sm">
              <button className="px-3 py-1 bg-gray-100 rounded-full">← Hier</button>
              <button className="px-3 py-1 bg-gray-100 rounded-full opacity-50">Demain →</button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Règles */}
            <div>
              <label className="block text-lg font-medium mb-3">
                🩸 Mes règles
              </label>
              <div className="flex gap-2">
                {['Aucune', 'Légères', 'Normales', 'Abondantes', 'Très abondantes'].map((level, index) => (
                  <button
                    key={level}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      index === 0 ? 'bg-pink-100 text-pink-700 border-2 border-pink-300' : 'bg-gray-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Fatigue */}
            <div>
              <label className="block text-lg font-medium mb-3">
                😴 Ma fatigue
              </label>
              <input
                type="range"
                min="0"
                max="5"
                defaultValue="3"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Aucune</span>
                <span>Modérée (3/5)</span>
                <span>Très forte</span>
              </div>
            </div>

            {/* Douleurs */}
            <div>
              <label className="block text-lg font-medium mb-3">
                🤕 Mes douleurs
              </label>
              <input
                type="range"
                min="0"
                max="5"
                defaultValue="1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Aucune</span>
                <span>Légères (1/5)</span>
                <span>Très fortes</span>
              </div>
            </div>

            {/* Humeur */}
            <div>
              <label className="block text-lg font-medium mb-3">
                😊 Mon humeur
              </label>
              <div className="flex gap-2 justify-center mb-3">
                {['😢', '😔', '😐', '🙂', '😊', '😄'].map((emoji, index) => (
                  <button
                    key={emoji}
                    className={`text-3xl p-2 rounded-full ${
                      index === 4 ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="text-center text-sm text-gray-600">
                Note: 7/10
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-lg font-medium mb-3">
                📝 Notes (optionnel)
              </label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows="3"
                placeholder="Comment te sens-tu aujourd'hui ?"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-center text-green-600 text-sm">
              <span className="mr-2">✅</span>
              Données sauvegardées automatiquement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleView;