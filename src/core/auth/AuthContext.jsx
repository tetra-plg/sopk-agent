/**
 * 🔐 Contexte d'Authentification
 *
 * Context React pour gérer l'état d'authentification de l'utilisateur
 * avec Supabase Auth.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../shared/services/supabase';

// Créer le contexte
export const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
  signUp: () => {}
});

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORAIRE: Utilisateur de test pour développement
    // TODO: Remettre l'authentification réelle pour production
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@sopk-companion.com',
      app_metadata: {},
      user_metadata: {}
    };

    setUser(mockUser);
    setLoading(false);
    console.log('🧪 Mode test: utilisateur fictif connecté');

    // Code réel commenté pour test
    /*
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur récupération session:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Erreur auth:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    */
  }, []);

  // Fonction de connexion
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};