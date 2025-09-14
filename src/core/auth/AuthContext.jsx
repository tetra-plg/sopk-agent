/**
 * 🔐 Contexte d'Authentification
 *
 * Context React pour gérer l'état d'authentification de l'utilisateur
 * avec Supabase Auth.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../shared/services/supabase';
import userProfileService from '../../shared/services/userProfileService';

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
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription avec création automatique de profil
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

      // Créer automatiquement un profil basique si l'utilisateur est créé
      if (data.user && !error) {
        try {
          const firstName = metadata.first_name ||
                           metadata.preferred_name ||
                           metadata.name?.split(' ')[0] ||
                           email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);

          await userProfileService.saveUserProfile(data.user.id, {
            first_name: firstName,
            preferred_name: firstName,
            date_of_birth: null,
            sopk_diagnosis_year: null,
            current_symptoms: [],
            severity_level: null,
            timezone: 'Europe/Paris',
            language_preference: 'fr',
            primary_goals: [],
            notification_preferences: {
              daily_reminder: true,
              weekly_summary: true,
              new_features: false
            }
          });
        } catch (profileError) {
          // Profil non créé mais utilisateur créé - pas bloquant
          console.warn('Profil utilisateur non créé automatiquement:', profileError);
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      setLoading(true);

      // Nettoyer directement le localStorage et l'état - plus fiable
      localStorage.removeItem(`supabase.auth.token`);
      localStorage.removeItem(`sb-127.0.0.1-auth-token`);

      // Tenter signOut Supabase mais ignorer les erreurs
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (supabaseError) {
        // Ignorer toutes les erreurs Supabase lors du logout
        console.log('Session Supabase déjà expirée/invalide (normal)');
      }

      // Nettoyer l'état côté client
      setUser(null);
      return { success: true };
    } catch (error) {
      console.warn('Erreur lors de la déconnexion (non critique):', error.message);
      // Force logout côté client même en cas d'erreur totale
      setUser(null);
      return { success: true };
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