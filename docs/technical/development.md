---
notion_page_id: "34cfd8071bf7dca3bed8a23a54193edb"
notion_parent_page_id: "26dc48d1806980b19b08ed84492ba4e3"
title: "💻 Guide de Développement - SOPK Agent"
---

# 💻 Guide de Développement - SOPK Agent

## 📋 Vue d'ensemble

Ce guide fournit toutes les informations nécessaires pour développer, maintenir et contribuer au projet SOPK Agent. Il couvre l'installation, le développement local, les bonnes pratiques et les workflows de contribution.

## 🚀 Installation et Setup

### Prérequis

#### System Requirements
```bash
# Node.js 18+ (LTS recommandé)
node --version  # v18.17.0+

# npm 9+ (inclus avec Node.js 18+)
npm --version   # 9.8.0+

# Git 2.30+
git --version  # 2.30+

# Supabase CLI (pour développement local)
supabase --version  # 1.100.0+
```

#### Installation Supabase CLI
```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux/Alternative
npm install -g supabase

# Vérification
supabase --help
```

### Clone et Installation

#### Repository Setup
```bash
# 1. Clone du repository
git clone git@github.com:tetra-plg/sopk-agent.git
cd sopk-agent

# 2. Installation des dépendances
npm install

# 3. Configuration environnement développement
cp .env.example .env.development

# 4. Setup base de données locale
supabase start

# 5. Lancement serveur développement
npm run dev
```

#### Structure après Installation
```
sopk-agent/
├── node_modules/           # Dépendances installées
├── supabase/              # Config DB locale
│   ├── config.toml        # Config Supabase
│   └── .branches/         # Branches DB locales
├── .env.development       # Variables env locales
└── dist/                  # Build artifacts (après npm run build)
```

## ⚙️ Configuration Développement

### Variables d'Environnement

#### `.env.development`
```env
# Supabase Local Development
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# Development Features
VITE_ENABLE_DEV_TOOLS=true
VITE_MOCK_DATA=false
```

#### Configuration Supabase Locale

```toml
# supabase/config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
port = 54324
site_url = "http://localhost:9090"
additional_redirect_urls = ["http://localhost:3000", "http://localhost:5173"]
jwt_expiry = 3600

[db]
port = 54322
shadow_port = 54320

[studio]
enabled = true
port = 54323
```

### IDE Configuration

#### VS Code Settings (Recommandé)

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### Extensions VS Code Recommandées
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-react",
    "supabase.supabase-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

## 🏃 Commandes de Développement

### Scripts NPM Principal

```bash
# Développement
npm run dev              # Serveur dev sur port 9090
npm run dev -- --host    # Accessible depuis réseau local

# Build et Test
npm run build            # Build production
npm run preview          # Preview du build local
npm run lint             # ESLint avec fix automatique
npm run lint:check       # ESLint sans fix (CI)

# Nettoyage
npm run clean            # Nettoie dist/ et caches
```

### Commandes Supabase

```bash
# Base de données locale
supabase start           # Démarrer services locaux
supabase stop            # Arrêter services
supabase status          # État des services

# Migrations et Seeds
supabase db reset        # Reset DB avec migrations + seeds
supabase db push         # Appliquer changements schema
supabase migration new add_feature  # Nouvelle migration

# Synchronisation
supabase link --project-ref your-project-ref
supabase db pull         # Récupérer schema distant
supabase db push         # Pousser schema local
```

### Git Workflow

```bash
# Workflow feature standard
git checkout develop
git pull origin develop
git checkout -b feature/nouvelle-fonctionnalite

# Développement...
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Push et PR
git push origin feature/nouvelle-fonctionnalite
# Créer Pull Request via GitHub
```

## 🗂️ Structure du Code

### Organisation Modulaire

#### Structure d'un Module Type
```
src/modules/example/
├── components/              # Composants UI du module
│   ├── ExampleCard.jsx     # Composant métier
│   ├── ExampleForm.jsx     # Formulaire spécialisé
│   └── ExampleModal.jsx    # Modal du module
├── hooks/                   # Hooks métier
│   ├── useExampleData.js   # Hook principal du module
│   └── useExampleForm.js   # Hook formulaire
├── services/                # Couche service
│   └── exampleService.js   # API calls et logique métier
├── types/                   # Types TypeScript (futur)
│   └── example.types.js    # Définitions de types
├── utils/                   # Utilitaires spécifiques
│   └── exampleHelpers.js   # Fonctions helper
└── views/                   # Vues principales
    └── ExampleView.jsx     # Point d'entrée du module
```

#### Naming Conventions

```javascript
// Composants - PascalCase
export const UserProfileCard = () => {};
export const MealSuggestionModal = () => {};

// Hooks - camelCase avec préfixe 'use'
export const useUserProfile = () => {};
export const useMealSuggestions = () => {};

// Services - camelCase avec suffixe 'Service'
export const userProfileService = {};
export const nutritionService = {};

// Utilitaires - camelCase descriptif
export const formatDate = () => {};
export const validateEmail = () => {};

// Constants - UPPER_SNAKE_CASE
export const API_ENDPOINTS = {};
export const VALIDATION_MESSAGES = {};
```

### Patterns de Code

#### Component Pattern

```javascript
// Template composant standard
import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';

/**
 * Composant pour [description]
 *
 * @param {Object} props - Props du composant
 * @param {Function} props.onAction - Callback d'action
 * @param {string} props.variant - Variant du composant
 */
const ExampleComponent = ({
  onAction,
  variant = 'default',
  className = ''
}) => {
  const { user } = useAuth();
  const [localState, setLocalState] = useState(null);
  const [loading, setLoading] = useState(false);

  // Effects
  useEffect(() => {
    // Logic here
  }, []);

  // Event handlers
  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rendering conditions
  if (loading) {
    return <div className="animate-spin">Loading...</div>;
  }

  return (
    <div className={`base-classes ${className}`}>
      {/* Component content */}
    </div>
  );
};

export default ExampleComponent;
```

#### Custom Hook Pattern

```javascript
// Template hook standard
import { useState, useEffect, useCallback } from 'react';
import { exampleService } from '../services/exampleService';

/**
 * Hook pour gestion [fonctionnalité]
 *
 * @param {string} userId - ID utilisateur
 * @param {Object} options - Options du hook
 * @returns {Object} État et actions du hook
 */
export const useExampleData = (userId, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized functions
  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await exampleService.getData(userId, options);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, options]);

  const updateData = useCallback(async (updates) => {
    try {
      const updated = await exampleService.updateData(userId, updates);
      setData(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    update: updateData
  };
};
```

#### Service Pattern

```javascript
// Template service standard
import { supabase } from '../../shared/services/supabase';

/**
 * Service pour gestion [entité]
 */
export const exampleService = {
  /**
   * Récupère les données pour un utilisateur
   * @param {string} userId - ID utilisateur
   * @param {Object} filters - Filtres optionnels
   * @returns {Promise<Array>} Liste des données
   */
  async getData(userId, filters = {}) {
    let query = supabase
      .from('example_table')
      .select('*')
      .eq('user_id', userId);

    // Apply filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    return data;
  },

  /**
   * Crée une nouvelle entrée
   * @param {string} userId - ID utilisateur
   * @param {Object} payload - Données à créer
   * @returns {Promise<Object>} Données créées
   */
  async createData(userId, payload) {
    const { data, error } = await supabase
      .from('example_table')
      .insert({
        user_id: userId,
        ...payload,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create data: ${error.message}`);
    }

    return data;
  },

  /**
   * Met à jour une entrée existante
   * @param {string} id - ID de l'entrée
   * @param {Object} updates - Mises à jour
   * @returns {Promise<Object>} Données mises à jour
   */
  async updateData(id, updates) {
    const { data, error } = await supabase
      .from('example_table')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update data: ${error.message}`);
    }

    return data;
  }
};
```

## 🎨 Styling Guidelines

### Tailwind CSS Conventions

#### Class Organization
```javascript
// Ordre des classes Tailwind recommandé
const Component = () => (
  <div className="
    // Layout
    flex items-center justify-between
    // Spacing
    p-4 m-2
    // Sizing
    w-full h-auto
    // Typography
    text-lg font-semibold text-gray-900
    // Background & Borders
    bg-white border border-gray-200 rounded-lg
    // Effects
    shadow-sm hover:shadow-md
    // Transitions
    transition-all duration-200
    // Responsive
    md:p-6 lg:text-xl
  ">
    Content
  </div>
);
```

#### Custom Components Styling
```javascript
// Utilisation du design system SOPK
const Card = ({ variant = 'default', children, className = '' }) => {
  const baseClasses = 'rounded-xl p-6 border transition-all duration-200';

  const variants = {
    default: 'bg-white border-gray-200 hover:shadow-md',
    primary: 'bg-gradient-to-r from-lavande-50 to-bleu-ciel-50 border-lavande-200',
    success: 'bg-vert-sauge-50 border-vert-sauge-200',
    warning: 'bg-corail-50 border-corail-200'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
```

### Design System Usage

#### Couleurs SOPK
```javascript
// Palette de couleurs définies dans tailwind.config.js
const colors = {
  lavande: {
    50: '#f7f5ff',   // Backgrounds très clairs
    100: '#ede9ff',  // Backgrounds clairs
    500: '#8b5fbf',  // Couleur principale
    900: '#4a2c5a'   // Texte foncé
  },
  'bleu-ciel': {
    50: '#f0f9ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  // Usage dans les composants
  className: 'bg-lavande-50 text-lavande-900 border-lavande-200'
};
```

#### Typography
```javascript
// Fonts définies dans le design system
const TypographyExamples = () => (
  <>
    <h1 className="font-heading text-3xl font-bold text-gray-900">
      Titre Principal (Poppins)
    </h1>
    <p className="font-body text-base text-gray-700">
      Texte de contenu (Inter)
    </p>
    <span className="font-emotional text-sm text-lavande-600">
      Contenu émotionnel (Raleway)
    </span>
  </>
);
```

## 🧪 Tests et Qualité

### Configuration ESLint

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@eslint/js/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React specific
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/prop-types': 'warn',
    'react/no-unescaped-entities': 'warn',

    // General code quality
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // Import organization
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling'],
      'newlines-between': 'always'
    }]
  }
};
```

### Debugging

#### Development Tools
```javascript
// React DevTools usage
// Installation: npm install --save-dev @react-devtools/core

// Debug hooks
import { useDebugValue } from 'react';

export const useCustomHook = (value) => {
  useDebugValue(value ? 'Active' : 'Inactive');
  // Hook logic...
};

// Error boundaries pour développement
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-boundary">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);
```

#### Logging Strategy
```javascript
// utils/logger.js
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (message, ...args) => {
    if (isDev) console.log(`🐛 [DEBUG] ${message}`, ...args);
  },
  info: (message, ...args) => {
    if (isDev) console.info(`ℹ️ [INFO] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`⚠️ [WARN] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  }
};

// Usage dans les composants
import { logger } from '../utils/logger';

const Component = () => {
  useEffect(() => {
    logger.debug('Component mounted');
  }, []);
};
```

## 🔧 Troubleshooting

### Problèmes Communs

#### Port déjà utilisé
```bash
# Error: Port 9090 is already in use
# Solutions:
1. Changer le port: npm run dev -- --port 3001
2. Tuer le process: lsof -ti :9090 | xargs kill -9
3. Utiliser port différent dans package.json
```

#### Supabase ne démarre pas
```bash
# Error: Cannot start Supabase
# Solutions:
1. Vérifier Docker: docker --version
2. Reset Supabase: supabase stop && supabase start
3. Nettoyer conteneurs: docker system prune
4. Vérifier ports disponibles: lsof -i :54321
```

#### Build fails
```bash
# Error: Build fails with memory issues
# Solutions:
1. Augmenter mémoire Node: NODE_OPTIONS="--max_old_space_size=4096" npm run build
2. Nettoyer cache: rm -rf node_modules/.vite
3. Réinstaller dépendances: rm -rf node_modules package-lock.json && npm install
```

#### Hot reload ne fonctionne pas
```bash
# Solutions:
1. Vérifier .gitignore n'ignore pas les fichiers source
2. Redémarrer dev server: Ctrl+C puis npm run dev
3. Vérifier watchers: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
```

## 📚 Resources et Références

### Documentation Officielle
- [React 19 Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)

### Outils de Développement
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Supabase Dashboard](http://localhost:54323) (local)
- [Tailwind Play](https://play.tailwindcss.com) (prototyping)

### Communauté et Support
- [GitHub Issues](https://github.com/tetra-plg/sopk-agent/issues)
- [Supabase Discord](https://discord.supabase.com)
- [React Community](https://react.dev/community)

Ce guide de développement fournit tous les éléments nécessaires pour contribuer efficacement au projet SOPK Agent.