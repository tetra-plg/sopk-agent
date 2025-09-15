/**
 * 🔐 Contexte d'Authentification
 *
 * Context React pour gérer l'état d'authentification de l'utilisateur
 * avec Supabase Auth.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../shared/services/supabase';
import type { AuthContextType } from '@/types';

// Créer le contexte avec le bon type
export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => ({ data: null, error: null, success: false }),
  signOut: async () => {},
  signUp: async () => ({ data: null, error: null, success: false }),
  updateProfile: async () => ({ data: null, error: null, success: false })
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
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile] = useState<any>(null);
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
      } catch {
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
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data: data.user, error: null, success: true };
    } catch (error) {
      return { data: null, error: (error as Error).message, success: false };
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription avec création automatique de profil
  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
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

      // Le profil sera créé automatiquement par un trigger SQL côté Supabase
      // lors de l'insertion dans auth.users

      return { data: data.user, error: null, success: true };
    } catch (error) {
      return { data: null, error: (error as Error).message, success: false };
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
      } catch {
        // Ignorer toutes les erreurs Supabase lors du logout
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

  // Méthode updateProfile
  const updateProfile = async (updates: Record<string, any>) => {
    try {
      // Ici on pourrait ajouter la logique de mise à jour du profil
      // Pour l'instant, on retourne juste un succès
      return { data: updates, error: null, success: true };
    } catch (error) {
      return { data: null, error: (error as Error).message, success: false };
    }
  };

  // Valeur du contexte
  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    signUp,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};