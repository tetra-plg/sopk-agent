---
notion_page_id: "0743a973705be1ea95f5bf3e435d40d6"
notion_parent_page_id: "26dc48d1806980b19b08ed84492ba4e3"
title: "🚀 Déploiement - SOPK Agent"
---

# 🚀 Déploiement - SOPK Agent

## 📋 Vue d'ensemble

SOPK Agent est déployé via une architecture cloud moderne avec Vercel pour le frontend et Supabase pour le backend, offrant une solution scalable et maintenue automatiquement.

## 🏗️ Architecture de Déploiement

### Stack de Déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│         Vercel (Edge Network Global)                   │
│    Build: Vite → Static Assets → CDN                  │
├─────────────────────────────────────────────────────────┤
│                    BACKEND                              │
│              Supabase Cloud                             │
│   PostgreSQL + Auth + Realtime + Storage              │
├─────────────────────────────────────────────────────────┤
│                     DOMAIN                              │
│         Custom Domain + SSL Certificates               │
└─────────────────────────────────────────────────────────┘
```

## 🌐 Environnements

### Production
- **URL Frontend** : `https://sopk-agent.vercel.app` (ou domaine custom)
- **URL Backend** : `https://ckbtlvhemxsgqztvnyrw.supabase.co`
- **Build Command** : `npm run build`
- **Output Directory** : `dist/`

### Staging/Preview
- **Auto-deployment** : Toutes les branches créent des previews automatiques
- **URL Pattern** : `https://sopk-agent-{branch}-{team}.vercel.app`
- **Environment** : Variables d'environnement de développement

### Development
- **Local Server** : `http://localhost:9090`
- **Local DB** : `http://127.0.0.1:54321` (Supabase CLI)
- **Hot Reload** : Vite HMR activé

## ⚙️ Configuration Vercel

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": true,
  "trailingSlash": false,
  "functions": {},
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Variables d'Environnement Production

#### Vercel Environment Variables
```env
# Production Supabase
VITE_SUPABASE_URL=https://ckbtlvhemxsgqztvnyrw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Application Settings
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false

# Analytics (si activées)
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Configuration dans Vercel Dashboard
```bash
# Via CLI Vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Via Dashboard Vercel
# Settings > Environment Variables
# Séparer par environnement : Development, Preview, Production
```

## 🔨 Process de Build

### Build Pipeline Vite

```javascript
// vite.config.js - Configuration production
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    // Optimisations production
    minify: 'terser',
    cssMinify: true,

    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],

          // Feature chunks
          dashboard: ['./src/modules/dashboard'],
          nutrition: ['./src/modules/nutrition'],
          cycle: ['./src/modules/cycle'],
          stress: ['./src/modules/stress'],
          activity: ['./src/modules/activity']
        }
      }
    },

    // Bundle analysis
    reportCompressedSize: true,

    // Asset handling
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000
  },

  // Preview configuration
  preview: {
    port: 4173,
    strictPort: true
  }
});
```

### Build Steps
```bash
# 1. Install dependencies
npm ci --production=false

# 2. Build application
npm run build

# 3. Optimize assets (automatique avec Vite)
# - Minification JS/CSS
# - Tree shaking
# - Code splitting
# - Asset optimization

# 4. Generate manifest
# - Service worker precache
# - Asset fingerprinting
# - Bundle analysis

# 5. Deploy to Vercel Edge Network
# - Static assets → CDN
# - Serverless functions (si utilisées)
# - Routing configuration
```

## 📦 Optimisations de Build

### Bundle Size Optimization

#### Analysis des Chunks
```bash
# Analyser la taille du bundle
npm run build -- --report

# Sortie typique:
dist/assets/index-abc123.js      145.23 kB │ gzip:  52.31 kB
dist/assets/vendor-def456.js     234.17 kB │ gzip:  89.42 kB
dist/assets/dashboard-ghi789.js   45.32 kB │ gzip:  16.78 kB
```

#### Code Splitting Strategy
```javascript
// Lazy loading des modules
const DashboardView = lazy(() => import('./modules/dashboard/views/DashboardView'));
const NutritionView = lazy(() => import('./modules/nutrition/views/NutritionView'));
const CycleView = lazy(() => import('./modules/cycle/views/CycleView'));

// Avec Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" component={DashboardView} />
    <Route path="/nutrition" component={NutritionView} />
    <Route path="/cycle" component={CycleView} />
  </Routes>
</Suspense>
```

### Asset Optimization

#### Images et Ressources
```javascript
// Optimisation automatique des images
// Vite gère automatiquement :
// - Compression WebP/AVIF
// - Responsive images
// - Lazy loading

// Import optimisé des assets
import logoWebP from './assets/logo.webp';
import logoPng from './assets/logo.png';

// Usage avec fallback
<img
  src={logoWebP}
  onError={(e) => { e.target.src = logoPng }}
  alt="SOPK Agent"
  loading="lazy"
/>
```

## 🔧 Configuration Supabase

### Projet Production

```bash
# Lien avec projet Supabase
supabase link --project-ref ckbtlvhemxsgqztvnyrw

# Configuration production
supabase secrets set DATABASE_URL postgres://...
supabase secrets set JWT_SECRET your-jwt-secret
```

### Settings Supabase Dashboard

#### Authentication Settings
```json
{
  "site_url": "https://sopk-agent.vercel.app",
  "additional_redirect_urls": [
    "https://sopk-agent-*.vercel.app",
    "http://localhost:9090"
  ],
  "jwt_expiry": 3600,
  "refresh_token_rotation_enabled": true,
  "security_update_password_require_reauthentication": true
}
```

#### Database Settings
```sql
-- Configuration RLS pour production
ALTER DATABASE postgres SET row_security = on;

-- Politiques de sécurité strictes
CREATE POLICY "Production security policy" ON user_profiles
  FOR ALL USING (auth.uid() = id AND auth.role() = 'authenticated');
```

## 🚦 CI/CD Pipeline

### GitHub Actions (Optionnel)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test

    - name: Run linting
      run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Install Vercel CLI
      run: npm i -g vercel@latest

    - name: Pull Vercel Environment
      run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

    - name: Build Project
      run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

    - name: Deploy to Vercel
      run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Vercel Git Integration (Recommandé)

```bash
# Configuration automatique via Vercel Dashboard
# 1. Connect GitHub repository
# 2. Configure build settings:
#    - Framework: Vite
#    - Build Command: npm run build
#    - Output Directory: dist
#    - Install Command: npm ci

# 3. Deploy automatique sur:
#    - Push sur main → Production
#    - Push sur autres branches → Preview
#    - Pull requests → Preview avec commentaires
```

## 📊 Monitoring et Observabilité

### Vercel Analytics

```javascript
// pages/_app.js (si migration vers Next.js)
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Health Checks

#### Frontend Health Check
```javascript
// public/health.json
{
  "status": "healthy",
  "version": "1.0.0",
  "build": "2024-09-14T10:30:00Z",
  "environment": "production"
}

// Endpoint de santé
// GET https://sopk-agent.vercel.app/health.json
```

#### Database Health Check
```sql
-- Fonction de health check Supabase
CREATE OR REPLACE FUNCTION health_check()
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'database', 'connected',
    'version', version()
  );
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT health_check();
```

### Error Tracking

#### Frontend Error Boundary
```javascript
// shared/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    if (import.meta.env.PROD) {
      console.error('Production error:', error, errorInfo);

      // Send to monitoring service (ex: Sentry)
      // Sentry.captureException(error, { contexts: { errorInfo } });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Oops! Quelque chose s'est mal passé.</h2>
          <button onClick={() => window.location.reload()}>
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🔐 Sécurité Production

### Headers de Sécurité

```javascript
// vercel.json - Headers de sécurité
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://ckbtlvhemxsgqztvnyrw.supabase.co"
        }
      ]
    }
  ]
}
```

### Gestion des Secrets

```bash
# Vercel CLI - Gestion des secrets
vercel secrets add supabase-url https://your-project.supabase.co
vercel secrets add supabase-anon-key eyJ...
vercel secrets add app-secret-key random-secret-key

# Rotation des clés
vercel secrets rm supabase-anon-key
vercel secrets add supabase-anon-key new-key
```

### SSL/TLS Configuration

```bash
# Certificat SSL automatique (Let's Encrypt)
# Géré automatiquement par Vercel

# Vérification SSL
curl -I https://sopk-agent.vercel.app
# HTTP/2 200
# strict-transport-security: max-age=63072000; includeSubDomains; preload
```

## 🗃️ Base de Données Production

### Backup Strategy

```bash
# Backup automatique Supabase
# - Daily automated backups (7 jours)
# - Point-in-time recovery (24h)
# - Manual backup avant deployments critiques

# Manual backup via CLI
supabase db dump --data-only > backup-$(date +%Y%m%d).sql
```

### Migration Production

```bash
# 1. Test migrations localement
supabase db reset
supabase db push

# 2. Backup production
supabase db dump --schema=public > backup-pre-migration.sql

# 3. Deploy migrations
supabase db push --linked

# 4. Verify migrations
supabase db diff --linked
```

## 📈 Performance Production

### Cache Strategy

#### Vercel Edge Cache
```javascript
// Headers de cache pour assets statiques
// Automatique via Vercel :
// - JS/CSS: Cache-Control: public, max-age=31536000, immutable
// - HTML: Cache-Control: public, max-age=0, must-revalidate
// - Images: Cache-Control: public, max-age=31536000
```

#### Service Worker (Future)
```javascript
// sw.js - Service Worker pour cache offline
const CACHE_NAME = 'sopk-agent-v1.0.0';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### CDN et Edge Network

```bash
# Vercel Edge Network automatique
# - 100+ Edge locations globally
# - Automatic cache invalidation
# - Smart routing
# - Brotli compression

# Vérification de la localisation
curl -H "Accept: application/json" https://sopk-agent.vercel.app/api/_edge-location
```

## 🚨 Rollback Strategy

### Rollback Vercel Deployment

```bash
# 1. List recent deployments
vercel list

# 2. Rollback to specific deployment
vercel promote <deployment-url>

# 3. Ou via Dashboard Vercel
# Deployments > Previous deployment > Promote to Production
```

### Database Rollback

```bash
# 1. Point-in-time recovery (si nécessaire)
# Via Supabase Dashboard > Database > Backups

# 2. Migration rollback
supabase migration repair 20240914001 --status reverted
supabase db push
```

## 📱 Mobile/PWA Configuration

### PWA Manifest

```json
// public/manifest.json
{
  "name": "SOPK Agent",
  "short_name": "SOPK Agent",
  "description": "Companion app pour la gestion du SOPK",
  "theme_color": "#8b5fbf",
  "background_color": "#f7f5ff",
  "display": "standalone",
  "start_url": "/",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Cette configuration de déploiement assure une mise en production robuste, sécurisée et performante pour SOPK Agent.