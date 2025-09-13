#### Modules (`src/modules/`)
```
module/                 # rempplacé "module" par le nom du module
├── components/         # Composants du module
├── hooks/              # Logique métier hooks
├── services/           # Couche d'accès aux données
├── types/              # Types TypeScript (si applicable)
├── views/              # View du module
│   └── ModuleView.jsx  # Point d'entrée principal
└── utils/              # Utilitaires spécifiques
```

#### Core Systems (`src/core/`)
```
core/
├── contexts/
│   └── ConstantsContext.jsx     # Configuration globale
├── layouts/
│   ├── AppNavigation.jsx        # Navigation sidebar
│   └── ProtectedRoute.jsx       # Protection des routes
└── pages/
    └── LoginView.jsx            # Authentification
```

#### Shared Components (`src/shared/`)
```
shared/
├── components/
│   ├── selectors/              # Sélecteurs réutilisables
│   └── ui/                     # Composants UI génériques
├── hooks/                      # Hooks partagés
├── services/                   # Services transversaux
└── utils/                      # Utilitaires globaux
```

#### Admin Systems (`src/admin/`)
```
admin/
├── components/
└── services/
```