const StressView = () => {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🧘 Bien-être & Stress
        </h1>
        <p className="text-gray-600">
          Outils pour gérer le stress et améliorer ton bien-être
        </p>
      </header>

      <div className="space-y-8">
        {/* État actuel */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">Comment te sens-tu ?</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-600">Niveau de stress :</span>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(level => (
                <button
                  key={level}
                  className={`w-6 h-6 rounded ${level <= 6 ? 'bg-blue-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">6/10</span>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            💡 Un exercice de respiration pourrait t'aider à te détendre
          </p>
        </section>

        {/* Exercices de respiration */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🌬️ Exercices de respiration
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Cohérence cardiaque',
                duration: '5 min',
                description: 'Équilibre ton système nerveux',
                icon: '🔵',
                benefits: 'Anti-stress'
              },
              {
                name: 'Respiration 4-4-4-4',
                duration: '3 min',
                description: 'Pour la concentration',
                icon: '⏹️',
                benefits: 'Focus'
              },
              {
                name: 'Technique rapide',
                duration: '2 min',
                description: 'Anti-stress express',
                icon: '⚡',
                benefits: 'Urgence'
              }
            ].map((exercise, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{exercise.icon}</div>
                  <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>
                  <div className="flex justify-center gap-2 text-sm text-gray-600">
                    <span>⏱️ {exercise.duration}</span>
                    <span>•</span>
                    <span>{exercise.benefits}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center mb-4">
                  {exercise.description}
                </p>
                <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  ▶️ Commencer
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Journal d'humeur */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            😊 Journal d'humeur
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Comment te sens-tu maintenant ?
              </label>
              <div className="flex gap-2 justify-center">
                {['😢', '😔', '😐', '🙂', '😊', '😄'].map((emoji, index) => (
                  <button
                    key={emoji}
                    className={`text-3xl p-2 rounded-full ${
                      index === 3 ? 'bg-blue-100 scale-110' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Note sur 10 :
              </label>
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="7"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>1</span>
                <span>7/10</span>
                <span>10</span>
              </div>
            </div>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
              ✅ Enregistrer
            </button>
          </div>
        </section>

        {/* Statistiques */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📈 Cette semaine</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Sessions respiration</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">7.2</div>
              <div className="text-sm text-gray-600">Humeur moyenne</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
              <div className="text-2xl font-bold text-purple-600">↗️</div>
              <div className="text-sm text-gray-600">Tendance positive</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StressView;