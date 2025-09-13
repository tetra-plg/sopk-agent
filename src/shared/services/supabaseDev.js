/**
 * 🔧 Client Supabase pour le développement
 *
 * Utilise la clé service_role pour contourner les politiques RLS
 * en développement avec l'utilisateur mock.
 *
 * ⚠️ NE JAMAIS utiliser en production !
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Client avec les privilèges service_role pour le développement
export const supabaseDev = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper pour savoir si on est en développement
export const isDevelopment = import.meta.env.DEV;