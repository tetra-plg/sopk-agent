import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Debug Variables Supabase:', {
  isDevelopment: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0,
  allEnvKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Configuration Supabase manquante:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? 'définie' : 'manquante',
    key: supabaseAnonKey ? 'définie' : 'manquante',
    env: import.meta.env
  });

  throw new Error('Variables d\'environnement Supabase manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

console.log('✅ Supabase configuré avec succès');

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey)