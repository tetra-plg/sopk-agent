import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY


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


export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey)