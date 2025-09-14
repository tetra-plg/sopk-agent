---
notion_page_id: "c6cc89b2a97a4abd8e10e1bc200f5732"
notion_parent_page_id: "26dc48d1806980b19b08ed84492ba4e3"
title: "⚡ Performance - SOPK Agent"
---

# ⚡ Performance - SOPK Agent

## 📋 Vue d'ensemble

Ce document couvre les stratégies de performance, optimisations et bonnes pratiques pour maintenir SOPK Agent rapide et efficace sur tous les appareils, avec un focus particulier sur l'expérience mobile.

## 🎯 Objectifs de Performance

### Métriques Cibles

#### Core Web Vitals
```
┌─────────────────────────────────────────────────────────┐
│                 OBJECTIFS PERFORMANCE                    │
├─────────────────────────────────────────────────────────┤
│ LCP (Largest Contentful Paint)    < 2.5s              │
│ FID (First Input Delay)           < 100ms             │
│ CLS (Cumulative Layout Shift)     < 0.1               │
│ TTFB (Time to First Byte)         < 600ms             │
│ TTI (Time to Interactive)         < 3.5s              │
└─────────────────────────────────────────────────────────┘
```

#### Application-Specific Metrics
```javascript
// Métriques métier SOPK Agent
const performanceTargets = {
  // Interface utilisateur
  dashboardLoadTime: '< 1.5s',     // Temps de chargement dashboard
  journalSaveTime: '< 500ms',      // Sauvegarde entrée journal
  suggestionLoadTime: '< 1s',      // Chargement suggestions repas

  // Navigation
  moduleTransitionTime: '< 200ms', // Transition entre modules
  modalOpenTime: '< 150ms',        // Ouverture modales

  // Fonctionnalités interactives
  breathingSessionStart: '< 300ms', // Démarrage session respiration
  timerAccuracy: '±50ms',           // Précision des timers
  autoSaveLatency: '< 200ms'        // Latence auto-sauvegarde
};
```

## 🏗️ Architecture Performance

### Bundle Analysis Actuel

#### Bundle Size Breakdown
```bash
# Analysis avec Vite Bundle Analyzer
npm run build -- --report

# Résultats typiques:
┌─────────────────────────────────────────────────┐
│ Chunk Name        │  Size    │ Gzipped │ Type  │
├─────────────────────────────────────────────────┤
│ index.js          │ 145.2KB  │  52.3KB │ Entry │
│ vendor.js         │ 234.1KB  │  89.4KB │ Vendor│
│ dashboard.js      │  45.3KB  │  16.8KB │ Async │
│ nutrition.js      │  38.7KB  │  14.2KB │ Async │
│ cycle.js          │  32.1KB  │  12.5KB │ Async │
│ stress.js         │  28.9KB  │  11.1KB │ Async │
│ activity.js       │  31.5KB  │  12.0KB │ Async │
├─────────────────────────────────────────────────┤
│ TOTAL             │ 555.8KB  │ 208.3KB │       │
└─────────────────────────────────────────────────┘
```

### Code Splitting Strategy

#### Route-Based Splitting
```javascript
// App.jsx - Lazy loading des modules
import { lazy, Suspense } from 'react';

// Lazy imports pour code splitting automatique
const DashboardView = lazy(() => import('./modules/dashboard/views/DashboardView'));
const CycleView = lazy(() => import('./modules/cycle/views/CycleView'));
const NutritionView = lazy(() => import('./modules/nutrition/views/NutritionView'));
const StressView = lazy(() => import('./modules/stress/views/StressView'));
const ActivityView = lazy(() => import('./modules/activity/views/ActivityView'));

// Composant de loading optimisé
const ModuleLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavande-500"></div>
  </div>
);

// Usage avec Suspense
const App = () => (
  <div className="app">
    <Suspense fallback={<ModuleLoading />}>
      {currentRoute === '/dashboard' && <DashboardView />}
      {currentRoute === '/cycle' && <CycleView />}
      {currentRoute === '/nutrition' && <NutritionView />}
      {currentRoute === '/stress' && <StressView />}
      {currentRoute === '/activity' && <ActivityView />}
    </Suspense>
  </div>
);
```

#### Component-Based Splitting
```javascript
// Splitting des composants lourds
const CookingModeView = lazy(() =>
  import('./modules/nutrition/views/CookingModeView')
    .then(module => ({ default: module.CookingModeView }))
);

const BreathingSession = lazy(() =>
  import('./modules/stress/components/BreathingSession')
);

// Preloading conditionnel
const preloadCookingMode = () => {
  import('./modules/nutrition/views/CookingModeView');
};

// Usage avec preloading intelligent
<button
  onMouseEnter={preloadCookingMode}
  onClick={() => setShowCookingMode(true)}
>
  Mode Cuisine
</button>
```

## 🚀 Optimisations Frontend

### React Performance

#### Memoization Strategy
```javascript
// Composants avec React.memo
const MealSuggestionCard = memo(({ meal, onSelect, onTrack }) => {
  // Callbacks memoized pour éviter re-renders
  const handleSelect = useCallback(() => {
    onSelect(meal.id);
  }, [meal.id, onSelect]);

  const handleTrack = useCallback(() => {
    onTrack(meal.id);
  }, [meal.id, onTrack]);

  return (
    <div className="meal-card" onClick={handleSelect}>
      <h3>{meal.name}</h3>
      <button onClick={handleTrack}>Tracker</button>
    </div>
  );
});

// Hook optimisé avec useMemo
const useMealSuggestions = (userId, filters) => {
  const [meals, setMeals] = useState([]);

  // Suggestions filtrées memoized
  const filteredMeals = useMemo(() => {
    if (!meals || !filters) return meals;

    return meals.filter(meal => {
      if (filters.category && meal.category !== filters.category) return false;
      if (filters.difficulty && meal.difficulty !== filters.difficulty) return false;
      if (filters.maxTime && meal.prep_time_minutes > filters.maxTime) return false;
      return true;
    });
  }, [meals, filters]);

  return { meals: filteredMeals, loading };
};
```

#### Virtual Scrolling pour Listes
```javascript
// Implémentation pour listes longues (recettes, historique)
import { VariableSizeList as List } from 'react-window';

const VirtualizedRecipeList = ({ recipes }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <RecipeCard recipe={recipes[index]} />
    </div>
  );

  return (
    <List
      height={600}           // Hauteur visible
      itemCount={recipes.length}
      itemSize={() => 120}   // Hauteur approximative par item
      overscanCount={5}      // Items pré-chargés hors vue
    >
      {Row}
    </List>
  );
};
```

### State Management Optimization

#### Context Splitting
```javascript
// Éviter re-renders inutiles avec contexts séparés
const AuthContext = createContext();
const UserPreferencesContext = createContext();
const AppSettingsContext = createContext();

// Au lieu d'un gros contexte global
const GlobalContext = createContext(); // ❌ Cause trop de re-renders

// Provider optimisé
const AppProviders = ({ children }) => (
  <AuthProvider>
    <UserPreferencesProvider>
      <AppSettingsProvider>
        {children}
      </AppSettingsProvider>
    </UserPreferencesProvider>
  </AuthProvider>
);
```

#### Debounced Updates
```javascript
// Auto-save optimisé avec debouncing
export const useAutoSave = (saveFunction, debounceMs = 1000) => {
  const [saveStatus, setSaveStatus] = useState('idle');
  const timeoutRef = useRef();
  const pendingDataRef = useRef();

  const triggerSave = useCallback((data) => {
    pendingDataRef.current = data;
    setSaveStatus('pending');

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce save
    timeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');

      try {
        await saveFunction(pendingDataRef.current);
        setSaveStatus('saved');

        // Reset status after 2s
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

## 🗄️ Database Performance

### Query Optimization

#### Efficient Data Fetching
```javascript
// Service optimisé avec pagination et filtres
export const symptomsService = {
  async getDailyEntries(userId, { limit = 30, offset = 0, dateRange } = {}) {
    let query = supabase
      .from('daily_symptoms')
      .select('date, mood_score, fatigue_level, pain_level, period_flow')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Filtre par plage de dates si spécifiée
    if (dateRange) {
      query = query
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return { data, count, hasMore: data.length === limit };
  },

  // Cache local pour éviter requêtes répétées
  _cache: new Map(),
  _cacheTimeout: 5 * 60 * 1000, // 5 minutes

  async getCachedEntry(userId, date) {
    const cacheKey = `${userId}-${date}`;
    const cached = this._cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
      return cached.data;
    }

    const { data } = await supabase
      .from('daily_symptoms')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (data) {
      this._cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }

    return data;
  }
};
```

#### Batch Operations
```javascript
// Batch updates pour performance
export const batchUpdateSymptoms = async (userId, entries) => {
  // Grouper par opération (insert vs update)
  const updates = entries.filter(e => e.id);
  const inserts = entries.filter(e => !e.id);

  const operations = [];

  // Batch updates
  if (updates.length > 0) {
    operations.push(
      supabase
        .from('daily_symptoms')
        .upsert(updates.map(entry => ({
          ...entry,
          user_id: userId,
          updated_at: new Date().toISOString()
        })))
    );
  }

  // Batch inserts
  if (inserts.length > 0) {
    operations.push(
      supabase
        .from('daily_symptoms')
        .insert(inserts.map(entry => ({
          ...entry,
          user_id: userId,
          created_at: new Date().toISOString()
        })))
    );
  }

  // Exécuter en parallèle
  const results = await Promise.allSettled(operations);

  return results.map(result =>
    result.status === 'fulfilled' ? result.value : null
  );
};
```

### Real-time Optimization

#### Selective Subscriptions
```javascript
// Subscriptions optimisées pour éviter overhead
const useRealtimeSymptoms = (userId, dateRange) => {
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    if (!userId || !dateRange) return;

    // Subscription ciblée sur période récente uniquement
    const subscription = supabase
      .channel(`symptoms_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_symptoms',
        filter: `user_id=eq.${userId} and date=gte.${dateRange.start}`
      }, (payload) => {
        setSymptoms(current => {
          switch (payload.eventType) {
            case 'INSERT':
              return [payload.new, ...current];
            case 'UPDATE':
              return current.map(item =>
                item.id === payload.new.id ? payload.new : item
              );
            case 'DELETE':
              return current.filter(item => item.id !== payload.old.id);
            default:
              return current;
          }
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, dateRange]);

  return symptoms;
};
```

## 🎨 Asset Optimization

### Image Optimization

#### Responsive Images
```javascript
// Composant Image optimisé
const OptimizedImage = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy'
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback pour images non trouvées
  const handleError = () => {
    setImageSrc('/images/placeholder.webp');
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        sizes={sizes}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      />
    </div>
  );
};
```

#### WebP avec Fallback
```javascript
// Service worker pour optimisation images
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      fetch(event.request.url.replace(/\.(jpg|jpeg|png)$/i, '.webp'))
        .then(response => {
          if (response.ok) return response;
          return fetch(event.request); // Fallback original
        })
        .catch(() => fetch(event.request))
    );
  }
});
```

### CSS Performance

#### Critical CSS Inlining
```javascript
// vite.config.js - Critical CSS extraction
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
        // Critical CSS pour above-the-fold
        criticalCss({
          base: 'dist/',
          src: 'index.html',
          target: 'index.html',
          width: 1200,
          height: 900,
          minify: true
        })
      ]
    }
  }
});
```

#### Tailwind Purging
```javascript
// tailwind.config.js - Purge optimisé
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  safelist: [
    // Classes générées dynamiquement
    { pattern: /^bg-(lavande|bleu-ciel|corail|vert-sauge)-(50|100|500|900)$/ },
    { pattern: /^text-(lavande|bleu-ciel|corail|vert-sauge)-(500|600|900)$/ },
    // Classes animation
    'animate-spin',
    'animate-pulse',
    'animate-bounce'
  ]
};
```

## 📱 Mobile Performance

### Touch Interactions

#### Optimized Touch Events
```javascript
// Hook pour gestion touch optimisée
const useOptimizedTouch = (onTap, onLongPress) => {
  const touchRef = useRef();
  const timerRef = useRef();

  const handlers = useMemo(() => ({
    onTouchStart: (e) => {
      touchRef.current = {
        startTime: Date.now(),
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY
      };

      // Long press detection
      timerRef.current = setTimeout(() => {
        onLongPress?.();
      }, 500);
    },

    onTouchEnd: (e) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const touch = touchRef.current;
      if (!touch) return;

      const deltaTime = Date.now() - touch.startTime;
      const deltaX = Math.abs(e.changedTouches[0].clientX - touch.startX);
      const deltaY = Math.abs(e.changedTouches[0].clientY - touch.startY);

      // Tap detection (< 300ms, < 10px movement)
      if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
        onTap?.();
      }

      touchRef.current = null;
    },

    onTouchCancel: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      touchRef.current = null;
    }
  }), [onTap, onLongPress]);

  return handlers;
};
```

### Viewport Management
```javascript
// Hook pour gestion responsive performance
const useViewportOptimization = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768
  });

  useEffect(() => {
    let ticking = false;

    const updateViewport = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setViewport({
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: window.innerWidth < 768
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('resize', updateViewport, { passive: true });
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};
```

## 🔍 Performance Monitoring

### Performance Metrics Collection

```javascript
// Service de monitoring performance
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observer = null;
    this.initPerformanceObserver();
  }

  initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry);
        }
      });

      this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }
  }

  recordMetric(entry) {
    const metric = {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    };

    this.metrics[entry.name] = metric;

    // Send to analytics if in production
    if (import.meta.env.PROD) {
      this.sendToAnalytics(metric);
    }
  }

  // Marquer le début d'une opération
  startMeasure(name) {
    performance.mark(`${name}-start`);
  }

  // Marquer la fin et calculer la durée
  endMeasure(name) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    // Cleanup marks
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
  }

  // Mesures spécifiques SOPK Agent
  measureDashboardLoad() {
    this.startMeasure('dashboard-load');
    return () => this.endMeasure('dashboard-load');
  }

  measureJournalSave() {
    this.startMeasure('journal-save');
    return () => this.endMeasure('journal-save');
  }

  measureSuggestionLoad() {
    this.startMeasure('suggestion-load');
    return () => this.endMeasure('suggestion-load');
  }

  sendToAnalytics(metric) {
    // Integration avec service analytics
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        value: Math.round(metric.duration),
        custom_parameter: metric.timestamp
      });
    }
  }
}

// Instance globale
export const perfMonitor = new PerformanceMonitor();
```

### Usage dans les Composants

```javascript
// Hook pour monitoring automatique
const usePerformanceTracking = (componentName) => {
  useEffect(() => {
    const endMeasure = perfMonitor.startMeasure(`${componentName}-render`);
    return endMeasure;
  }, [componentName]);
};

// Usage dans composants critiques
const DashboardView = () => {
  usePerformanceTracking('DashboardView');

  const { data, loading } = useDashboardData();

  useEffect(() => {
    if (!loading) {
      perfMonitor.endMeasure('dashboard-load');
    }
  }, [loading]);

  return (
    <div className="dashboard">
      {/* Dashboard content */}
    </div>
  );
};
```

## 🎛️ Performance Testing

### Lighthouse CI Integration

```yaml
# .github/workflows/performance.yml
name: Performance Testing

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.js'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Configuration Lighthouse

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.85 }],

        // Métriques spécifiques
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

## 🔧 Optimisations Futures

### Service Worker Implementation

```javascript
// sw.js - Service Worker pour performance
const CACHE_NAME = 'sopk-agent-v1.0.0';
const STATIC_CACHE = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first pour assets statiques
  static: 'cache-first',
  // Network first pour données utilisateur
  api: 'network-first',
  // Stale while revalidate pour contenu semi-statique
  content: 'stale-while-revalidate'
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request));
  } else if (url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});
```

### Web Workers pour Calculs Lourds

```javascript
// workers/analyticsWorker.js
self.onmessage = function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'CALCULATE_TRENDS':
      const trends = calculateSymptomTrends(data.symptoms);
      self.postMessage({ type: 'TRENDS_RESULT', data: trends });
      break;

    case 'PROCESS_MEAL_SUGGESTIONS':
      const suggestions = processMealSuggestions(data.meals, data.preferences);
      self.postMessage({ type: 'SUGGESTIONS_RESULT', data: suggestions });
      break;
  }
};

// Usage dans composant
const useAnalyticsWorker = () => {
  const workerRef = useRef();

  useEffect(() => {
    workerRef.current = new Worker('/workers/analyticsWorker.js');
    return () => workerRef.current.terminate();
  }, []);

  const calculateTrends = useCallback((symptoms) => {
    return new Promise((resolve) => {
      workerRef.current.postMessage({
        type: 'CALCULATE_TRENDS',
        data: { symptoms }
      });

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'TRENDS_RESULT') {
          resolve(e.data.data);
        }
      };
    });
  }, []);

  return { calculateTrends };
};
```

Ces optimisations de performance garantissent une expérience utilisateur fluide et rapide pour SOPK Agent sur tous les appareils et conditions réseau.