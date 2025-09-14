---
notion_page_id: "911c30592aaa4722164568b26bece121"
notion_parent_page_id: "26dc48d1806980b19b08ed84492ba4e3"
title: "🏗️ Architecture Technique - SOPK Agent"
---

# 🏗️ Architecture Technique - SOPK Agent

## 📋 Vue d'ensemble

SOPK Agent est une application web moderne construite avec React 19, Vite et Tailwind CSS, dédiée à la gestion du syndrome des ovaires polykystiques (SOPK). L'architecture suit une approche modulaire et scalable avec une séparation claire des responsabilités.

## 🏛️ Architecture Générale

### Stack Technique

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  React 19 + Vite 6 + Tailwind CSS + Heroicons        │
├─────────────────────────────────────────────────────────┤
│                    BACKEND                              │
│               Supabase (BaaS)                          │
│  Database + Auth + Real-time + Storage                │
├─────────────────────────────────────────────────────────┤
│                   DEPLOYMENT                            │
│         Vercel (Frontend) + Supabase Cloud            │
└─────────────────────────────────────────────────────────┘
```

### Technologies Principales

| Couche | Technologie | Version | Rôle |
|---------|-------------|---------|-------|
| **Frontend** | React | 19.1.1 | Framework UI avec hooks et contexts |
| **Build Tool** | Vite | 6.3.6 | Build rapide et HMR |
| **Styling** | Tailwind CSS | 3.4.17 | Framework CSS utility-first |
| **Database** | Supabase | 2.57.4 | PostgreSQL + Real-time + Auth |
| **Icons** | Heroicons | 2.2.0 | Iconographie cohérente |
| **Deployment** | Vercel | Latest | Hébergement et CI/CD |

## 📁 Structure du Projet

### Organisation des Répertoires

```
sopk-agent/
├── src/
│   ├── modules/                    # 🧩 Modules fonctionnels
│   │   ├── dashboard/              # Tableau de bord principal
│   │   ├── cycle/                  # Suivi cycle menstruel
│   │   ├── nutrition/              # Nutrition et repas
│   │   ├── stress/                 # Gestion du stress
│   │   └── activity/               # Activité physique
│   ├── core/                       # ⚙️ Logique centrale
│   │   ├── auth/                   # Authentification
│   │   ├── contexts/               # Contexts React globaux
│   │   ├── layouts/                # Layouts principaux
│   │   └── pages/                  # Pages racines
│   ├── shared/                     # 🔧 Composants partagés
│   │   ├── components/             # UI components réutilisables
│   │   ├── hooks/                  # Hooks personnalisés
│   │   ├── services/               # Services API
│   │   └── utils/                  # Utilitaires
│   ├── admin/                      # 👨‍💼 Interface admin
│   ├── App.jsx                     # 🎯 Composant racine
│   ├── main.jsx                    # 🚀 Point d'entrée
│   └── index.css                   # 🎨 Styles Tailwind
├── supabase/                       # 🗄️ Configuration DB
│   ├── migrations/                 # Migrations SQL
│   └── seed-*.sql                  # Données de test/prod
├── docs/                           # 📚 Documentation
└── public/                         # 📦 Assets statiques
```

## 🧩 Architecture Modulaire

### Structure d'un Module

Chaque module suit un pattern architectural consistant :

```
module/
├── components/          # Composants UI spécifiques
├── hooks/              # Hooks métier du module
├── services/           # Couche service/API
├── types/              # Définitions de types
├── utils/              # Utilitaires spécifiques
└── views/              # Vues principales du module
```

### Modules Principaux

#### 1. 📊 Module Dashboard
- **Responsabilité** : Vue d'ensemble quotidienne et navigation
- **Composants clés** : `DashboardView`, widgets intégrés
- **Services** : Agrégation de données multi-modules

#### 2. 📅 Module Cycle
- **Responsabilité** : Suivi symptômes et cycle menstruel
- **Composants clés** : `DailyJournalView`, `SymptomSlider`, `MoodPicker`
- **Services** : `symptomsService` avec auto-sauvegarde

#### 3. 🍽️ Module Nutrition
- **Responsabilité** : Suggestions repas et recettes
- **Composants clés** : `MealSuggestionsView`, `RecipeLibraryView`, `CookingModeView`
- **Services** : `nutritionService`, `recipeService`

#### 4. 🧘 Module Stress
- **Responsabilité** : Exercices respiration et gestion émotionnelle
- **Composants clés** : `BreathingExercisesView`, `MoodJournalView`
- **Services** : `breathingService`, `moodService`

#### 5. 🏃 Module Activity
- **Responsabilité** : Séances d'activité physique courtes
- **Composants clés** : `SessionCatalog`, `SessionPlayer`
- **Services** : `activityService`

## 🔗 Patterns Architecturaux

### 1. State Management

#### Context API Strategy
```javascript
// Contexte global pour l'authentification
export const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### Custom Hooks Pattern
```javascript
// Hook métier pour gestion des symptômes
export const useDailySymptoms = (date) => {
  const [symptoms, setSymptoms] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logique de récupération et mise à jour
  // Auto-save avec debouncing

  return { symptoms, loading, updateSymptom };
};
```

### 2. Service Layer Pattern

```javascript
// Service abstrait pour API Supabase
export const symptomsService = {
  async getDailyEntry(userId, date) {
    const { data, error } = await supabase
      .from('daily_symptoms')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    return { data, error };
  },

  async saveDailyEntry(userId, date, symptoms) {
    // Upsert avec gestion d'erreur
  }
};
```

### 3. Component Composition

#### Shared Components
```javascript
// Composant réutilisable avec props typées
export const Slider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  labels = []
}) => {
  // Implémentation générique
};

// Usage spécialisé
<SymptomSlider
  label="Niveau de fatigue"
  value={fatigue}
  onChange={setFatigue}
  labels={['Aucune', 'Légère', 'Modérée', 'Forte', 'Intense']}
/>
```

## 🔧 Services et Intégrations

### Supabase Integration

#### Configuration Multi-environnement
```javascript
// shared/services/supabase.js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

#### Service Pattern
```javascript
// Service abstrait avec gestion d'erreurs
export const createService = (tableName) => ({
  async findAll(userId, filters = {}) {
    const query = supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId);

    // Application des filtres dynamiques
    Object.entries(filters).forEach(([key, value]) => {
      query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw new Error(`${tableName}: ${error.message}`);

    return data;
  }
});
```

### Authentication Flow

```javascript
// AuthContext avec gestion complète
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session recovery
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🎨 Design System

### Tailwind Configuration

#### Palette de Couleurs SOPK
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'lavande': {
          50: '#f7f5ff',
          500: '#8b5fbf',
          900: '#4a2c5a'
        },
        'bleu-ciel': {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        },
        'corail': {
          50: '#fff2f1',
          500: '#f87171',
          900: '#dc2626'
        },
        'vert-sauge': {
          50: '#f6f8f6',
          500: '#84cc16',
          900: '#365314'
        }
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'emotional': ['Raleway', 'sans-serif']
      }
    }
  }
};
```

### Component Styling Strategy

#### Utility Classes + Custom Components
```javascript
// Composant avec classes Tailwind consistantes
export const Card = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'rounded-xl shadow-sm border transition-all duration-200';

  const variants = {
    default: 'bg-white border-gray-200 hover:shadow-md',
    highlight: 'bg-gradient-to-r from-lavande-50 to-bleu-ciel-50 border-lavande-200',
    warning: 'bg-corail-50 border-corail-200'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
```

## 🔄 Data Flow

### Unidirectional Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Action   │────▶│   Component     │────▶│   Custom Hook   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Update     │◀────│   State Update  │◀────│   Service Call  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Local State   │◀────│   Supabase API  │
                       └─────────────────┘    └─────────────────┘
```

### Auto-save Pattern

```javascript
// Hook avec auto-sauvegarde intelligente
export const useAutoSave = (saveFunction, debounceMs = 1000) => {
  const [saveStatus, setSaveStatus] = useState('idle');
  const timeoutRef = useRef();

  const triggerSave = useCallback(async (data) => {
    setSaveStatus('saving');

    // Annuler la sauvegarde précédente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce la sauvegarde
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction(data);
        setSaveStatus('saved');

        // Reset status après 2s
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, debounceMs);
  }, [saveFunction, debounceMs]);

  return { saveStatus, triggerSave };
};
```

## 🔒 Sécurité

### Row Level Security (RLS)

```sql
-- Politique RLS pour données utilisateur
ALTER TABLE daily_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own symptoms" ON daily_symptoms
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptoms" ON daily_symptoms
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Client-side Security

```javascript
// Validation côté client avec protection
export const validateSymptomEntry = (data) => {
  const schema = z.object({
    period_flow: z.number().min(0).max(4),
    fatigue_level: z.number().min(0).max(5),
    pain_level: z.number().min(0).max(5),
    mood_score: z.number().min(1).max(10)
  });

  return schema.parse(data);
};
```

## 🚀 Performance Optimizations

### Code Splitting Readiness

```javascript
// Préparé pour React.lazy()
const DashboardView = lazy(() => import('./modules/dashboard/views/DashboardView'));
const CycleView = lazy(() => import('./modules/cycle/views/CycleView'));

// Avec Suspense
<Suspense fallback={<LoadingSpinner />}>
  <DashboardView />
</Suspense>
```

### Memoization Strategy

```javascript
// Optimisation des re-renders
export const MealSuggestionCard = memo(({ meal, onSelect }) => {
  const handleSelect = useCallback(() => {
    onSelect(meal.id);
  }, [meal.id, onSelect]);

  return (
    <Card onClick={handleSelect}>
      {/* Contenu du composant */}
    </Card>
  );
});
```

## 📱 Responsive Design

### Mobile-First Approach

```javascript
// Breakpoints Tailwind adaptés
const ResponsiveGrid = ({ children }) => (
  <div className="
    grid
    grid-cols-1
    md:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
    gap-4
    p-4
  ">
    {children}
  </div>
);
```

## 🔮 Évolutivité

### Architecture Préparée pour l'Extension

1. **TypeScript Ready** : Structure de types prête
2. **Module System** : Ajout facile de nouveaux modules
3. **Service Abstraction** : Services génériques réutilisables
4. **Component Library** : Base pour design system complet
5. **Testing Infrastructure** : Prêt pour Vitest/Jest

### Migration Paths

```javascript
// Route vers React Router
// Actuel: state-based routing
const [currentRoute, setCurrentRoute] = useState('/dashboard');

// Futur: React Router
import { Routes, Route } from 'react-router-dom';
```

Cette architecture modulaire et scalable garantit la maintenabilité et l'évolution future du projet SOPK Agent.