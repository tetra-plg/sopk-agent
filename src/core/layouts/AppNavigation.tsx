import { useState, useEffect } from 'react';
import { useConstants } from '../contexts/ConstantsContext';
import { useAuth } from '../auth/AuthContext';
import userProfileService from '../../shared/services/userProfileService';

const AppNavigation = ({ children, currentRoute = '/dashboard', onRouteChange }) => {
  const { routes } = useConstants();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const version = "1.1"

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const { data } = await userProfileService.getUserProfile(user.id);
          setUserProfile(data);
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const getDisplayName = () => {
    if (userProfile?.preferred_name) return userProfile.preferred_name;
    if (user?.user_metadata?.first_name) return user.user_metadata.first_name;
    if (user?.email) return user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
    return 'Utilisatrice';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfileAccess = () => {
    onRouteChange && onRouteChange(routes.profile);
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: routes.dashboard, label: 'Accueil', icon: '🏠' },
    { path: routes.journal, label: 'Journal', icon: '📝' },
    { path: routes.nutrition, label: 'Nutrition', icon: '🍽️' },
    { path: routes.stress, label: 'Bien-être', icon: '🧘' },
    { path: routes.activity, label: 'Activité', icon: '🏃' }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-fond-clair)' }}>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 shadow-md"
              style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #EEF2FF 100%)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                 style={{ backgroundColor: 'var(--color-primary-lavande)' }}>
              🌸
            </div>
            <h1 className="font-heading text-lg font-bold"
                style={{ color: 'var(--color-primary-lavande)' }}>
              SOPK <span className="font-light text-xs">v{version}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleProfileAccess}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{ color: 'var(--color-primary-lavande)' }}
            >
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium hidden sm:block">{getDisplayName()}</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-all hover:bg-red-50"
              style={{ color: '#EF4444' }}
              title="Se déconnecter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
             onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 shadow-xl"
               style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #FFF 100%)' }}
               onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mb-6 p-2"
                style={{ color: 'var(--color-primary-lavande)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    onRouteChange && onRouteChange(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-all ${
                    currentRoute === item.path ? 'shadow-md' : ''
                  }`}
                  style={{
                    backgroundColor: currentRoute === item.path ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
                    color: currentRoute === item.path ? 'var(--color-primary-lavande)' : 'var(--color-text-principal)'
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:block fixed left-0 top-0 h-full w-64 shadow-lg z-30"
           style={{ background: 'linear-gradient(180deg, #EDE9FE 0%, #EEF2FF 100%)' }}>
        <div className="p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                 style={{ backgroundColor: 'var(--color-primary-lavande)' }}>
              🌸
            </div>
          </div>
          <h1 className="font-heading text-xl font-bold"
              style={{ color: 'var(--color-primary-lavande)' }}>
            SOPK Companion
          </h1>
          <p className="text-sm font-emotional italic mt-1"
             style={{ color: 'var(--color-text-secondaire)' }}>
            Ton espace bien-être
          </p>
          <span className="text-xs font-light">
            Version {version}
          </span>
        </div>

        <div className="mt-6">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => onRouteChange && onRouteChange(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 ${
                currentRoute === item.path
                  ? 'border-r-4'
                  : 'hover:pl-8'
              }`}
              style={{
                backgroundColor: currentRoute === item.path ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
                borderColor: currentRoute === item.path ? 'var(--color-primary-lavande)' : 'transparent',
                color: currentRoute === item.path ? 'var(--color-primary-lavande)' : 'var(--color-text-principal)'
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Profile and Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t"
             style={{ borderColor: 'rgba(167, 139, 250, 0.2)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                 style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)', color: 'var(--color-primary-lavande)' }}>
              👤
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm" style={{ color: 'var(--color-text-principal)' }}>
                {getDisplayName()}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondaire)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleProfileAccess}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all hover:pl-4"
              style={{
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                color: 'var(--color-primary-lavande)'
              }}
            >
              <span className="text-sm">⚙️</span>
              <span className="font-medium text-sm">Profil</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 py-2 rounded-lg transition-all hover:bg-red-50"
              style={{ color: '#EF4444' }}
              title="Se déconnecter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - avec padding pour header mobile et sidebar desktop */}
      <main className="flex-1 pt-16 md:pt-0 md:ml-64 pb-20 md:pb-0"
            style={{ backgroundColor: 'var(--color-fond-clair)' }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 shadow-lg border-t"
           style={{ backgroundColor: 'white' }}>
        <div className="flex justify-around items-center py-2">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              onClick={() => onRouteChange && onRouteChange(item.path)}
              className="flex flex-col items-center justify-center p-2 min-w-[60px]"
              style={{
                color: currentRoute === item.path
                  ? 'var(--color-primary-lavande)'
                  : 'var(--color-text-secondaire)'
              }}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppNavigation;