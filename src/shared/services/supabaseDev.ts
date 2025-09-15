/**
 * 🔧 Client Supabase pour le développement
 *
 * Utilise la clé service_role pour contourner les politiques RLS
 * en développement avec l'utilisateur mock.
 *
 * ⚠️ NE JAMAIS utiliser en production !
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types';
import { supabase } from './supabase';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey: string = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Helper pour savoir si on est en développement
export const isDevelopment = import.meta.env.DEV;

// Client avec les privilèges service_role pour le développement
// En production, on utilise null pour éviter l'instanciation
export const supabaseDev: SupabaseClient<Database> | null = isDevelopment && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Vérification de sécurité
if (!isDevelopment && supabaseDev) {
  throw new Error('🚨 supabaseDev ne doit jamais être utilisé en production !');
}

// Fonction utilitaire pour obtenir le bon client Supabase
export const getSupabaseClient = (): SupabaseClient<Database> => {
  // En développement, utiliser supabaseDev si disponible, sinon supabase
  if (isDevelopment && supabaseDev) {
    return supabaseDev;
  }

  // En production ou si supabaseDev non disponible, utiliser le client normal
  return supabase;
};