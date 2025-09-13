const ActivityView = () => {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏃 Activité Physique
        </h1>
        <p className="text-gray-600">
          Séances adaptées au SOPK pour bouger en douceur
        </p>
      </header>

      <div className="space-y-8">
        {/* Recommandation du jour */}
        <section className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            💫 Recommandée pour toi
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            😴 Niveau de fatigue modéré • 🤕 Douleurs légères
          </p>
          <h3 className="text-lg font-semibold mb-2">Yoga Anti-crampes</h3>
          <div className="flex gap-2 text-sm text-gray-600 mb-4">
            <span>⏱️ 15 min</span>
            <span>🟢 Débutant</span>
            <span>🧘 Doux</span>
          </div>
          <p className="text-sm text-green-700 font-medium mb-4">
            🎯 Parfait pour soulager tes douleurs et détendre ton bassin
          </p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            ▶️ Commencer la séance
          </button>
        </section>

        {/* Catégories d'activités */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📚 Types d'activités</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Yoga', icon: '🧘', count: 12, color: 'bg-purple-100 text-purple-700' },
              { name: 'Mobilité', icon: '🤸', count: 8, color: 'bg-green-100 text-green-700' },
              { name: 'Cardio doux', icon: '🚶', count: 6, color: 'bg-blue-100 text-blue-700' },
              { name: 'Renforcement', icon: '💪', count: 10, color: 'bg-orange-100 text-orange-700' }
            ].map((category) => (
              <button
                key={category.name}
                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <span className={`text-sm px-2 py-1 rounded ${category.color}`}>
                  {category.count} séances
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Séances rapides */}
        <section>
          <h2 className="text-xl font-semibold mb-4">⚡ Séances rapides (5-15 min)</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Étirements matinaux',
                duration: '8 min',
                difficulty: 'Très facile',
                type: 'Mobilité',
                icon: '🌅'
              },
              {
                title: 'Marche énergique',
                duration: '10 min',
                difficulty: 'Facile',
                type: 'Cardio',
                icon: '🚶'
              },
              {
                title: 'Yoga du soir',
                duration: '12 min',
                difficulty: 'Facile',
                type: 'Relaxation',
                icon: '🌙'
              }
            ].map((session, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{session.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{session.title}</h3>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span>⏱️ {session.duration}</span>
                      <span>•</span>
                      <span>{session.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {session.type}
                  </span>
                </div>
                <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                  ▶️ Commencer
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Historique */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📈 Ton activité</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600">Séances cette semaine</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">58</div>
                <div className="text-sm text-gray-600">Minutes d'activité</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">⭐</div>
                <div className="text-sm text-gray-600">Régularité excellente</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Dernières séances :</h3>
              <div className="space-y-2">
                {[
                  { name: 'Yoga anti-crampes', date: 'Hier', duration: '15 min', rating: '⭐⭐⭐⭐⭐' },
                  { name: 'Marche énergique', date: 'Lundi', duration: '20 min', rating: '⭐⭐⭐⭐⭐' },
                  { name: 'Étirements', date: 'Dimanche', duration: '10 min', rating: '⭐⭐⭐⭐⭐' }
                ].map((session, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{session.name}</div>
                      <div className="text-xs text-gray-600">{session.date} • {session.duration}</div>
                    </div>
                    <div className="text-xs">{session.rating}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ActivityView;