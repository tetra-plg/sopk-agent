const NutritionView = () => {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🍽️ Nutrition SOPK
        </h1>
        <p className="text-gray-600">
          Suggestions repas et recettes à index glycémique bas
        </p>
      </header>

      <div className="space-y-8">
        {/* Suggestions du moment */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            💫 Suggestions pour toi
          </h2>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border">
            <p className="text-sm text-gray-600 mb-3">
              😴 Tu sembles fatiguée aujourd'hui
            </p>
            <h3 className="text-lg font-semibold mb-2">Bowl Quinoa-Avocat Protéiné</h3>
            <div className="flex gap-2 text-sm text-gray-600 mb-4">
              <span>⏱️ 15 min</span>
              <span>🟢 IG très bas</span>
              <span>💪 Riche en protéines</span>
            </div>
            <p className="text-sm text-green-700 font-medium mb-4">
              ⚡ Idéal pour retrouver de l'énergie stable
            </p>
            <div className="flex gap-3">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Voir la recette
              </button>
              <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors">
                Autres suggestions
              </button>
            </div>
          </div>
        </section>

        {/* Navigation rapide */}
        <section>
          <h2 className="text-xl font-semibold mb-4">🗂️ Explorer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-left">
              <div className="text-2xl mb-2">🥗</div>
              <h3 className="font-semibold text-lg mb-1">Suggestions repas</h3>
              <p className="text-sm text-gray-600">Idées adaptées à tes symptômes</p>
            </button>

            <button className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-left">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold text-lg mb-1">Recettes IG bas</h3>
              <p className="text-sm text-gray-600">Bibliothèque complète avec instructions</p>
            </button>
          </div>
        </section>

        {/* Recettes populaires */}
        <section>
          <h2 className="text-xl font-semibold mb-4">⭐ Recettes populaires</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Omelette aux épinards',
                time: '10 min',
                rating: '4.8',
                category: 'Petit-déjeuner',
                benefits: 'Protéines'
              },
              {
                title: 'Salade de lentilles',
                time: '20 min',
                rating: '4.6',
                category: 'Déjeuner',
                benefits: 'Anti-inflammatoire'
              },
              {
                title: 'Saumon aux légumes',
                time: '25 min',
                rating: '4.9',
                category: 'Dîner',
                benefits: 'Oméga-3'
              }
            ].map((recipe, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-orange-100 to-green-100 rounded-lg mb-3 flex items-center justify-center text-3xl">
                  🍽️
                </div>
                <h3 className="font-semibold mb-1">{recipe.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>⭐ {recipe.rating}</span>
                  <span>•</span>
                  <span>⏱️ {recipe.time}</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {recipe.category}
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    {recipe.benefits}
                  </span>
                </div>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Voir la recette
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NutritionView;