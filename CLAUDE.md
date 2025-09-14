# Contexte du Projet SOPK Agent

## Description du Projet
Application React moderne développée avec Vite, Tailwind CSS et intégration Supabase pour la gestion des données.

## Stack Technique
- **Frontend**: React 19 avec Vite
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (production et local)
- **Déploiement**: Vercel
- **Language**: JavaScript/JSX (avec possibilité TypeScript)

## Structure du Projet
```
sopk-agent/
├── src/
│   ├── modules/                    # Modules fonctionnels
│   │   ├── cycle/                  # Module journal cycle
│   │   ├── stress/                 # Module gestion stress
│   │   ├── nutrition/              # Module nutrition
│   │   ├── activity/               # Module activité physique
│   │   └── dashboard/              # Module dashboard
│   ├── core/                       # Éléments centraux
│   │   ├── contexts/               # Contexts React globaux
│   │   ├── layouts/                # Layouts principaux
│   │   └── pages/                  # Pages principales
│   ├── shared/                     # Éléments partagés
│   │   ├── components/             # Composants réutilisables
│   │   ├── hooks/                  # Hooks personnalisés
│   │   ├── services/               # Services (API, Supabase)
│   │   └── utils/                  # Fonctions utilitaires
│   ├── admin/                      # Interface d'administration
│   ├── App.jsx                     # Composant principal
│   ├── main.jsx                    # Point d'entrée
│   └── index.css                   # Styles Tailwind
├── docs/                           # Documentation
│   └── backlogs/                   # Plans de développement
├── public/                         # Assets publics
├── .env                           # Variables d'environnement locales
├── .env.development               # Variables pour développement
├── .env.production                # Variables pour production
└── package.json                   # Dépendances et scripts

```

## Conventions de Code
- **Composants**: PascalCase pour les noms de composants
- **Fichiers**: camelCase pour les fichiers JS/JSX
- **Styles**: Classes Tailwind CSS, éviter les styles inline
- **State Management**: React hooks (useState, useContext, useReducer)
- **API Calls**: Async/await avec gestion d'erreurs try/catch

## Supabase Configuration
- **Production URL**: https://ckbtlvhemxsgqztvnyrw.supabase.co
- **Anon Key**: Stockée dans .env.production
- **Local Development**: Supabase CLI pour environnement local

## Scripts NPM
- `npm run dev`: Lancer le serveur de développement (http://localhost:9090)
- `npm run build`: Build de production
- `npm run preview`: Prévisualiser le build
- `npm run lint`: Vérifier le code avec ESLint

## GitHub Repository
- **Remote**: git@github.com:tetra-plg/sopk-agent.git
- **Branches**:
  - `main`: Production
  - `develop`: Développement
  - Feature branches: `feature/nom-feature`

## Déploiement Vercel
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: Vite

## Variables d'Environnement
### Production (.env.production)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### Development (.env.development)
- VITE_SUPABASE_URL (local)
- VITE_SUPABASE_ANON_KEY (local)

## Commandes Utiles
```bash
# Installation des dépendances
npm install

# Développement local (port 9090)
npm run dev

# Build production
npm run build

# Supabase local
npx supabase start
npx supabase stop

# Git workflow
git add .
git commit -m "feat: description"
git push origin branch-name
```

## À Faire / Roadmap
- [ ] Configuration authentification Supabase
- [ ] Système de routing React Router
- [ ] Composants UI de base
- [ ] Intégration API Supabase
- [ ] Tests unitaires avec Vitest
- [ ] Documentation API

## Notes Importantes
- Toujours utiliser les variables d'environnement pour les clés sensibles
- Tester localement avant de pousser en production
- Suivre les conventions de commit conventionnelles (feat:, fix:, docs:, etc.)
- Maintenir ce fichier à jour avec l'évolution du projet