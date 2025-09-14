---
notion_page_id: "9dc09e80fabb009adb4602b1833a9a60"
notion_parent_page_id: "26dc48d1806980b19b08ed84492ba4e3"
title: "🗄️ Base de Données - SOPK Agent"
---

# 🗄️ Base de Données - SOPK Agent

## 📋 Vue d'ensemble

SOPK Agent utilise **Supabase** comme Backend-as-a-Service (BaaS), fournissant une base PostgreSQL moderne avec authentification intégrée, real-time, et Row Level Security (RLS).

## 🏗️ Architecture Base de Données

### Stack Technique

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE STACK                       │
│  PostgreSQL 15 + PostgREST + Realtime + Auth          │
├─────────────────────────────────────────────────────────┤
│                   ENVIRONNEMENTS                        │
│  Production: ckbtlvhemxsgqztvnyrw.supabase.co         │
│  Development: 127.0.0.1:54321 (Supabase CLI)          │
└─────────────────────────────────────────────────────────┘
```

### Connexion et Configuration

#### Variables d'Environnement
```env
# Production (.env.production)
VITE_SUPABASE_URL=https://ckbtlvhemxsgqztvnyrw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Development (.env.development)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJ...
```

#### Client Configuration
```javascript
// shared/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

## 🗂️ Schéma de Base de Données

### Tables Principales

#### 1. 👤 Gestion Utilisateurs

##### `auth.users` (Supabase Auth)
```sql
-- Table gérée automatiquement par Supabase Auth
-- Contient: id, email, created_at, etc.
```

##### `public.user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations personnelles
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  date_of_birth DATE,

  -- Profil SOPK spécifique
  sopk_diagnosis_date DATE,
  current_medications TEXT[],
  health_goals TEXT[],
  dietary_restrictions TEXT[],

  -- Préférences app
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politique RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### 2. 📊 Suivi Quotidien

##### `daily_symptoms`
```sql
CREATE TABLE daily_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Symptômes physiques (échelle 0-5)
  period_flow INTEGER CHECK (period_flow >= 0 AND period_flow <= 4),
  fatigue_level INTEGER CHECK (fatigue_level >= 0 AND fatigue_level <= 5),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 5),

  -- Données émotionnelles
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_emoji VARCHAR(10),
  mood_tags TEXT[], -- ['anxious', 'energetic', 'sad', etc.]

  -- Notes libres
  notes TEXT,
  energy_level INTEGER CHECK (energy_level >= 0 AND energy_level <= 5),

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte unicité par utilisateur/date
  UNIQUE(user_id, date)
);

-- Index pour performance
CREATE INDEX idx_daily_symptoms_user_date ON daily_symptoms(user_id, date DESC);
CREATE INDEX idx_daily_symptoms_user_created ON daily_symptoms(user_id, created_at DESC);

-- RLS
ALTER TABLE daily_symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own symptoms" ON daily_symptoms
  FOR ALL USING (auth.uid() = user_id);
```

#### 3. 🍽️ Module Nutrition

##### `meal_suggestions`
```sql
CREATE TABLE meal_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'

  -- Préparation
  prep_time_minutes INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- 'very_easy', 'easy', 'medium'
  servings INTEGER DEFAULT 1,

  -- Nutrition SOPK-friendly
  glycemic_index_category VARCHAR(20) DEFAULT 'low', -- 'low', 'medium'
  estimated_calories INTEGER,
  main_nutrients TEXT[], -- ['protein', 'fiber', 'omega3', 'antioxidants']

  -- Bénéfices SOPK
  sopk_benefits TEXT[], -- ['insulin_regulation', 'anti_inflammatory']
  symptom_targets TEXT[], -- ['fatigue', 'cravings', 'mood']

  -- Contenu
  ingredients_simple TEXT NOT NULL,
  preparation_steps TEXT NOT NULL,
  tips TEXT,

  -- Métadonnées
  season VARCHAR(20)[], -- ['spring', 'summer', 'autumn', 'winter']
  dietary_tags TEXT[], -- ['vegetarian', 'gluten_free', 'dairy_free']

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherches fréquentes
CREATE INDEX idx_meal_suggestions_category ON meal_suggestions(category);
CREATE INDEX idx_meal_suggestions_difficulty ON meal_suggestions(difficulty);
CREATE INDEX idx_meal_suggestions_gi ON meal_suggestions(glycemic_index_category);
```

##### `user_meal_tracking`
```sql
CREATE TABLE user_meal_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES meal_suggestions(id),

  -- Contexte consommation
  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'

  -- Feedback utilisateur
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  would_eat_again BOOLEAN,
  preparation_difficulty INTEGER CHECK (preparation_difficulty >= 1 AND preparation_difficulty <= 5),

  -- Notes personnelles
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index et RLS
CREATE INDEX idx_user_meal_tracking_user_date ON user_meal_tracking(user_id, date DESC);
ALTER TABLE user_meal_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own meal tracking" ON user_meal_tracking
  FOR ALL USING (auth.uid() = user_id);
```

##### `recipes` (Recettes Détaillées)
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  cuisine_type VARCHAR(50),

  -- Temps et difficulté
  prep_time_minutes INTEGER NOT NULL,
  cook_time_minutes INTEGER NOT NULL,
  total_time_minutes GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
  difficulty VARCHAR(20) NOT NULL,
  servings INTEGER DEFAULT 4,

  -- Nutrition
  glycemic_index_category VARCHAR(20) NOT NULL DEFAULT 'low',
  estimated_calories_per_serving INTEGER,
  main_macros JSONB, -- {"protein": 25, "carbs": 30, "fat": 15, "fiber": 8}

  -- Contenu détaillé (JSONB pour flexibilité)
  ingredients JSONB NOT NULL, -- [{"name": "quinoa", "quantity": "150g", "notes": "bien rincer"}]
  instructions JSONB NOT NULL, -- [{"step": 1, "instruction": "...", "duration_minutes": 5, "tips": "..."}]

  -- SOPK bénéfices
  sopk_benefits TEXT[],
  health_tags TEXT[], -- ['anti-inflammatory', 'high-protein', 'hormone-balancing']

  -- Métadonnées
  difficulty_notes TEXT,
  storage_instructions TEXT,
  nutritionist_approved BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche et filtrage
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_total_time ON recipes(total_time_minutes);
CREATE INDEX idx_recipes_gi ON recipes(glycemic_index_category);

-- Index GIN pour recherche dans JSONB
CREATE INDEX idx_recipes_ingredients_gin ON recipes USING GIN(ingredients);
CREATE INDEX idx_recipes_instructions_gin ON recipes USING GIN(instructions);
```

#### 4. 🧘 Module Stress & Bien-être

##### `breathing_techniques`
```sql
CREATE TABLE breathing_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations technique
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'relaxation', 'energy', 'focus'

  -- Configuration technique
  pattern_config JSONB NOT NULL, -- {"inhale": 4, "hold": 7, "exhale": 8}
  duration_seconds INTEGER NOT NULL,
  cycles_per_minute INTEGER,

  -- Guidage
  instructions TEXT NOT NULL,
  benefits TEXT[],
  best_time_of_day VARCHAR(20)[], -- ['morning', 'afternoon', 'evening']

  -- Niveau et contre-indications
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  contraindications TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### `breathing_sessions`
```sql
CREATE TABLE breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id UUID REFERENCES breathing_techniques(id),

  -- Session data
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  interruption_reason VARCHAR(100),

  -- Feedback pré/post session
  stress_before INTEGER CHECK (stress_before >= 1 AND stress_before <= 10),
  stress_after INTEGER CHECK (stress_after >= 1 AND stress_after <= 10),
  feeling_after VARCHAR(50), -- 'calmer', 'energized', 'focused', 'same'

  -- Contexte
  session_context VARCHAR(50), -- 'morning_routine', 'work_break', 'before_sleep'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index et RLS
CREATE INDEX idx_breathing_sessions_user_date ON breathing_sessions(user_id, created_at DESC);
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own breathing sessions" ON breathing_sessions
  FOR ALL USING (auth.uid() = user_id);
```

##### `mood_entries`
```sql
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Humeur principale
  primary_mood VARCHAR(20) NOT NULL, -- 'very_sad', 'sad', 'neutral', 'happy', 'very_happy'
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),

  -- Tags émotionnels détaillés
  emotion_tags TEXT[], -- ['anxious', 'energetic', 'irritable', 'calm', 'motivated']

  -- Context et notes
  mood_triggers TEXT[], -- ['work_stress', 'period', 'lack_of_sleep', 'exercise']
  notes TEXT,

  -- Lien avec activités
  related_breathing_session_id UUID REFERENCES breathing_sessions(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un seul entry par jour
  UNIQUE(user_id, date)
);

-- Index et RLS
CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, date DESC);
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mood entries" ON mood_entries
  FOR ALL USING (auth.uid() = user_id);
```

#### 5. 🏃 Module Activité

##### `activity_sessions`
```sql
CREATE TABLE activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations session
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'yoga', 'mobility', 'cardio', 'strength'

  -- Durée et difficulté
  duration_minutes INTEGER NOT NULL,
  difficulty_level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'

  -- Contenu guidage
  instructions TEXT NOT NULL,
  audio_guide_url VARCHAR(255), -- Lien vers fichier audio
  video_guide_url VARCHAR(255), -- Lien vers vidéo

  -- SOPK-specific
  sopk_benefits TEXT[], -- ['insulin_sensitivity', 'mood_boost', 'energy']
  recommended_for_symptoms TEXT[], -- ['fatigue', 'mood_low', 'stress']
  recommended_cycle_phases TEXT[], -- ['menstrual', 'follicular', 'luteal']

  -- Équipement
  equipment_needed TEXT[], -- ['yoga_mat', 'resistance_band', 'none']

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX idx_activity_sessions_category ON activity_sessions(category);
CREATE INDEX idx_activity_sessions_duration ON activity_sessions(duration_minutes);
CREATE INDEX idx_activity_sessions_difficulty ON activity_sessions(difficulty_level);
```

##### `user_activity_tracking`
```sql
CREATE TABLE user_activity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES activity_sessions(id),

  -- Session effectuée
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,

  -- État pré/post
  energy_before INTEGER CHECK (energy_before >= 1 AND energy_before <= 5),
  energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 5),
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 5),

  -- Feedback
  difficulty_felt INTEGER CHECK (difficulty_felt >= 1 AND difficulty_felt <= 5),
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  would_do_again BOOLEAN,

  -- Notes et modifications
  notes TEXT,
  modifications_made TEXT, -- Adaptations faites à la session

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index et RLS
CREATE INDEX idx_user_activity_tracking_user_date ON user_activity_tracking(user_id, started_at DESC);
ALTER TABLE user_activity_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own activity tracking" ON user_activity_tracking
  FOR ALL USING (auth.uid() = user_id);
```

## 🔐 Sécurité et Row Level Security

### Configuration RLS Globale

```sql
-- Activer RLS sur toutes les tables utilisateur
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meal_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_tracking ENABLE ROW LEVEL SECURITY;
```

### Politiques de Sécurité Types

#### Politique Standard CRUD
```sql
-- Politique générique pour données utilisateur
CREATE OR REPLACE FUNCTION create_user_rls_policies(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- SELECT: Users can view their own data
  EXECUTE format('
    CREATE POLICY "Users can view own %s" ON %s
      FOR SELECT USING (auth.uid() = user_id)
  ', table_name, table_name);

  -- INSERT: Users can insert their own data
  EXECUTE format('
    CREATE POLICY "Users can insert own %s" ON %s
      FOR INSERT WITH CHECK (auth.uid() = user_id)
  ', table_name, table_name);

  -- UPDATE: Users can update their own data
  EXECUTE format('
    CREATE POLICY "Users can update own %s" ON %s
      FOR UPDATE USING (auth.uid() = user_id)
  ', table_name, table_name);

  -- DELETE: Users can delete their own data
  EXECUTE format('
    CREATE POLICY "Users can delete own %s" ON %s
      FOR DELETE USING (auth.uid() = user_id)
  ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;
```

#### Politiques Publiques pour Données de Référence
```sql
-- Tables publiques (lecture seule pour tous les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view meal suggestions" ON meal_suggestions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view breathing techniques" ON breathing_techniques
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view activity sessions" ON activity_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view recipes" ON recipes
  FOR SELECT TO authenticated USING (true);
```

## 📊 Indexation et Performance

### Index Principaux

```sql
-- Index pour requêtes fréquentes par utilisateur et date
CREATE INDEX CONCURRENTLY idx_daily_symptoms_user_date_desc
  ON daily_symptoms(user_id, date DESC);

CREATE INDEX CONCURRENTLY idx_meal_tracking_user_date_desc
  ON user_meal_tracking(user_id, date DESC);

CREATE INDEX CONCURRENTLY idx_breathing_sessions_user_created_desc
  ON breathing_sessions(user_id, created_at DESC);

-- Index pour recherche de contenu
CREATE INDEX CONCURRENTLY idx_recipes_title_trgm
  ON recipes USING gin(title gin_trgm_ops);

CREATE INDEX CONCURRENTLY idx_meal_suggestions_name_trgm
  ON meal_suggestions USING gin(name gin_trgm_ops);

-- Index pour filtrage par catégories
CREATE INDEX CONCURRENTLY idx_recipes_category_difficulty
  ON recipes(category, difficulty);

CREATE INDEX CONCURRENTLY idx_activity_sessions_category_duration
  ON activity_sessions(category, duration_minutes);
```

### Optimisations de Requêtes

#### Requête Dashboard Optimisée
```sql
-- Vue matérialisée pour dashboard
CREATE MATERIALIZED VIEW user_daily_summary AS
SELECT
  ds.user_id,
  ds.date,
  ds.mood_score,
  ds.energy_level,
  ds.fatigue_level,
  COUNT(umt.id) as meals_tracked,
  COUNT(bs.id) as breathing_sessions,
  COUNT(uat.id) as activities_done
FROM daily_symptoms ds
LEFT JOIN user_meal_tracking umt ON ds.user_id = umt.user_id AND ds.date = umt.date
LEFT JOIN breathing_sessions bs ON ds.user_id = bs.user_id AND DATE(bs.created_at) = ds.date
LEFT JOIN user_activity_tracking uat ON ds.user_id = uat.user_id AND DATE(uat.started_at) = ds.date
GROUP BY ds.user_id, ds.date, ds.mood_score, ds.energy_level, ds.fatigue_level;

-- Index sur la vue
CREATE UNIQUE INDEX idx_user_daily_summary_user_date
  ON user_daily_summary(user_id, date DESC);

-- Refresh automatique (via cron job)
CREATE OR REPLACE FUNCTION refresh_user_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_daily_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 🌱 Données de Test et Production

### Seed Data Development

```sql
-- Utilisateurs de test
INSERT INTO auth.users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'sophie@test.com'),
  ('550e8400-e29b-41d4-a716-446655440001', 'marie@test.com');

-- Profils de test
INSERT INTO user_profiles (id, first_name, last_name, sopk_diagnosis_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Sophie', 'Martin', '2022-03-15'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Marie', 'Dubois', '2023-01-10');

-- Données symptômes test (30 derniers jours)
INSERT INTO daily_symptoms (user_id, date, period_flow, fatigue_level, pain_level, mood_score, mood_emoji)
SELECT
  '550e8400-e29b-41d4-a716-446655440000',
  generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, INTERVAL '1 day')::DATE,
  (random() * 4)::INT,
  (random() * 5)::INT,
  (random() * 5)::INT,
  (random() * 9 + 1)::INT,
  (ARRAY['😢', '😐', '🙂', '😊', '😄'])[ceil(random() * 5)];
```

### Seed Data Production

```sql
-- Techniques de respiration validées
INSERT INTO breathing_techniques (name, description, pattern_config, duration_seconds, instructions) VALUES
('Cohérence Cardiaque', 'Technique 3-6-5 pour réguler le système nerveux',
 '{"inhale": 5, "hold": 0, "exhale": 5}', 300,
 'Inspirez pendant 5 secondes, expirez pendant 5 secondes. Répétez calmement.'),

('4-7-8 Relaxation', 'Technique de relaxation profonde pour réduire l''anxiété',
 '{"inhale": 4, "hold": 7, "exhale": 8}', 240,
 'Inspirez 4s, retenez 7s, expirez lentement sur 8s. Idéal avant le coucher.');

-- Suggestions de repas IG bas (25+ recettes en production)
-- [Voir seed-development.sql pour la liste complète]
```

## 🔄 Migrations et Versioning

### Stratégie de Migration

```sql
-- supabase/migrations/20240914_001_initial_schema.sql
-- Structure des tables principales

-- supabase/migrations/20240914_002_add_indexes.sql
-- Index pour performance

-- supabase/migrations/20240914_003_rls_policies.sql
-- Politiques de sécurité

-- supabase/migrations/20240914_004_seed_production_data.sql
-- Données de référence production
```

### Commandes Supabase CLI

```bash
# Générer nouvelle migration
supabase migration new add_user_preferences

# Appliquer migrations localement
supabase db push

# Reset base locale
supabase db reset

# Lien avec projet distant
supabase link --project-ref ckbtlvhemxsgqztvnyrw
```

## 📈 Monitoring et Métriques

### Métriques Base de Données

```sql
-- Monitoring des performances
SELECT
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;

-- Requêtes lentes
SELECT
  query,
  calls,
  total_time,
  mean_time,
  stddev_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Dashboard Supabase

- **Table Editor** : Interface graphique pour données
- **SQL Editor** : Requêtes et analyses personnalisées
- **Authentication** : Gestion utilisateurs et sessions
- **Database** : Monitoring des performances et logs
- **API** : Documentation auto-générée de l'API REST

Cette architecture de base de données robuste et sécurisée supporte l'ensemble des fonctionnalités SOPK Agent avec des performances optimales et une scalabilité future assurée.