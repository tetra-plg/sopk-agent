const DashboardView = () => {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          👋 Bonjour !
        </h1>
        <p className="text-gray-600">
          Voici ton tableau de bord SOPK du jour
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget Symptômes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 État du jour
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Humeur</span>
              <span className="font-medium">7/10 😊</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fatigue</span>
              <span className="font-medium">3/5 😴</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Douleurs</span>
              <span className="font-medium">1/5 🤕</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors">
            📝 Compléter journal
          </button>
        </div>

        {/* Widget Nutrition */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🍽️ Idée repas
          </h3>
          <div className="mb-4">
            <h4 className="font-medium mb-2">Bowl Quinoa-Avocat</h4>
            <div className="flex gap-2 text-sm text-gray-600">
              <span>⏱️ 15min</span>
              <span>🟢 IG bas</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            💚 Parfait contre la fatigue
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors">
              Voir recette
            </button>
            <button className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors">
              ✅
            </button>
          </div>
        </div>

        {/* Widget Bien-être */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🧘 Pause bien-être
          </h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              🌟 3 sessions cette semaine
            </p>
            <p className="text-sm text-green-700 font-medium">
              Belle régularité !
            </p>
          </div>
          <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            🧘 Respiration 5min
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">⚡ Actions rapides</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[
            { icon: '📝', label: 'Journal', color: 'bg-purple-500' },
            { icon: '🧘', label: 'Respiration', color: 'bg-blue-500' },
            { icon: '🍽️', label: 'Nutrition', color: 'bg-green-500' },
            { icon: '🏃', label: 'Activité', color: 'bg-orange-500' },
            { icon: '📊', label: 'Stats', color: 'bg-gray-500' }
          ].map((action) => (
            <button
              key={action.label}
              className={`${action.color} text-white p-4 rounded-xl min-w-[80px] hover:opacity-90 transition-opacity`}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-xs font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;