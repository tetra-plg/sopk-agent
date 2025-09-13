const DashboardView = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-6 md:mb-8 lg:mb-10 text-center">
        <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-lavande) 0%, var(--color-primary-bleu-ciel) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
          Bonjour Sarah 🌸
        </h1>
        <p className="font-emotional italic text-base md:text-lg px-4"
           style={{ color: 'var(--color-text-secondaire)' }}>
          Prête à prendre soin de toi aujourd'hui ?
        </p>
      </header>

      {/* Grid responsive mobile-first */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Widget État du jour - Prend toute la largeur sur mobile */}
        <div className="card-dashboard p-4 md:p-6 col-span-1 sm:col-span-2 lg:col-span-1 transform hover:scale-105 transition-transform duration-200">
          <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-primary-lavande)' }}>
            ✨ État du jour
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--color-text-secondaire)' }}>Humeur</span>
              <span className="font-medium badge-lavande">7/10 😊</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--color-text-secondaire)' }}>Fatigue</span>
              <span className="font-medium badge-bleu-ciel">3/5 😴</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--color-text-secondaire)' }}>Douleurs</span>
              <span className="font-medium badge-vert-sauge">1/5 ✨</span>
            </div>
          </div>
          <button className="w-full mt-4 btn-primary">
            📝 Compléter journal
          </button>
        </div>

        {/* Widget Nutrition */}
        <div className="card-nutrition p-4 md:p-6 transform hover:scale-105 transition-transform duration-200">
          <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-accent-vert-sauge)' }}>
            🥗 Idée repas
          </h3>
          <div className="mb-4">
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>Bowl Quinoa-Avocat</h4>
            <div className="flex gap-2 text-sm">
              <span className="badge-vert-sauge">⏱️ 15min</span>
              <span className="badge-vert-sauge">🟢 IG bas</span>
            </div>
          </div>
          <p className="text-sm font-emotional italic mb-4" style={{ color: 'var(--color-text-secondaire)' }}>
            💚 Parfait contre la fatigue
          </p>
          <div className="flex gap-2">
            <button className="flex-1 btn-accent-vert text-sm">
              Voir recette
            </button>
            <button className="btn-accent-vert px-3">
              ✅
            </button>
          </div>
        </div>

        {/* Widget Bien-être */}
        <div className="card-stress p-4 md:p-6 transform hover:scale-105 transition-transform duration-200">
          <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-primary-bleu-ciel)' }}>
            🧘 Pause bien-être
          </h3>
          <div className="mb-4">
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondaire)' }}>
              🌟 3 sessions cette semaine
            </p>
            <p className="text-sm font-medium text-motivational">
              Belle régularité !
            </p>
          </div>
          <button className="w-full btn-secondary">
            🧘 Respiration 5min
          </button>
        </div>
      </div>

      {/* Section Conseil du jour */}
      <div className="mt-6 md:mt-8 card-sopk p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #FFF 0%, #EDE9FE 100%)' }}>
        <h2 className="font-heading text-lg md:text-xl font-semibold mb-3 md:mb-4"
            style={{ color: 'var(--color-primary-lavande)' }}>
          💡 Conseil du jour
        </h2>
        <p className="font-emotional italic text-sm md:text-base lg:text-lg"
           style={{ color: 'var(--color-text-principal)' }}>
          "Les oméga-3 peuvent aider à réduire l'inflammation liée au SOPK.
          Pense à inclure du saumon, des noix ou des graines de lin dans tes repas !"
        </p>
      </div>

      {/* Actions rapides - Cachées sur mobile car déjà dans la bottom nav */}
      <div className="hidden md:block mt-6 md:mt-8">
        <h2 className="font-heading text-lg md:text-xl font-semibold mb-3 md:mb-4"
            style={{ color: 'var(--color-text-principal)' }}>
          ⚡ Actions rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: '📝', label: 'Journal', style: 'btn-primary' },
            { icon: '🧘', label: 'Respiration', style: 'btn-secondary' },
            { icon: '🍽️', label: 'Nutrition', style: 'btn-accent-vert' },
            { icon: '🏃', label: 'Activité', style: 'btn-accent-corail' },
            { icon: '📊', label: 'Stats', style: 'btn-primary' }
          ].map((action) => (
            <button
              key={action.label}
              className={`${action.style} p-4 flex flex-col items-center justify-center`}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;