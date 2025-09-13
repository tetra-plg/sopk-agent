# 🗃️ Guide de Gestion des Seeds Supabase - SOPK Agent

## 📋 Vue d'Ensemble

Le projet SOPK Agent utilise un système de seed à double niveau pour séparer clairement les données de développement et de production :

- **🔧 Développement** : Utilisateurs fake + données de test pour faciliter le développement
- **🚀 Production** : Contenu métier uniquement (repas, recettes, séances d'activité)

---

## 🏗️ Structure des Fichiers

```
supabase/
├── migrations/                    # Schéma de base de données
│   ├── 20241213000010_complete_tables_schema.sql  # Tables complètes v1.0
│   └── ... autres migrations
├── seed-development.sql           # 👥 DONNÉES FAKE UTILISATEURS
├── seed-production.sql            # 🍽️ CONTENU MÉTIER UNIQUEMENT
├── seed.sql                       # 📜 Ancien seed (deprecated)
└── config.toml                    # Configuration Supabase
```

---

## 🔧 Environnement de Développement

### **Fichier** : `seed-development.sql`

### **Contenu** :
- **3 utilisateurs fake** avec mots de passe `password123` :
  - `sarah.dev@sopk-companion.com` - Profil actif avec beaucoup de données
  - `emma.dev@sopk-companion.com` - Nouveau profil avec peu de données
  - `claire.dev@sopk-companion.com` - Profil expérimenté

### **Données de test incluses** :
- ✅ **Profils utilisateurs** détaillés avec info SOPK
- ✅ **Journal quotidien** (14 jours de données symptômes)
- ✅ **Sessions de respiration** avec historique
- ✅ **Entries d'humeur** avec différents patterns
- ✅ **Tracking nutrition** avec feedback utilisateur
- ✅ **Suivi d'activité** avec notes et ratings

### **Utilisation** :
```bash
# Développement local
supabase db reset  # Utilise automatiquement seed-development.sql
```

---

## 🚀 Environnement de Production

### **Fichier** : `seed-production.sql`

### **Contenu** :
- ❌ **AUCUN utilisateur fake**
- ✅ **Contenu métier validé** :
  - Suggestions de repas étendues (8 nouvelles suggestions)
  - 2 recettes complètes avec mode cuisine guidé
  - 3 séances d'activité détaillées avec variations

### **Utilisation** :
```bash
# Production (à exécuter manuellement)
psql -h [SUPABASE_HOST] -U postgres -d postgres -f seed-production.sql
```

---

## ⚙️ Configuration et Commandes

### **Changer d'environnement**

Dans `supabase/config.toml` :

```toml
[db.seed]
sql_paths = ["./seed-development.sql"]  # 🔧 Pour développement
# sql_paths = ["./seed-production.sql"]   # 🚀 Pour production
```

### **Commandes utiles**

```bash
# Reset complet avec seed de développement
supabase db reset

# Appliquer seulement les migrations (sans seed)
supabase db reset --debug --no-seed

# Exécuter seed de production manuellement
supabase db diff --use-migra

# Voir l'état de la base
supabase status
```

---

## 📊 Données de Test Disponibles

### **👤 Utilisateurs de Développement**

| Email | Profil | Mot de passe | Données |
|-------|--------|--------------|---------|
| `sarah.dev@sopk-companion.com` | Utilisatrice active | `password123` | ✅ Journal 14j, 8 sessions respiration, tracking nutrition |
| `emma.dev@sopk-companion.com` | Nouvelle utilisatrice | `password123` | ⚠️ Données minimales (2-3 entrées) |
| `claire.dev@sopk-companion.com` | Expérimentée SOPK | `password123` | ✅ Focus gestion douleur, sessions régulières |

### **🍽️ Contenu Métier (Dev + Prod)**

- **12 suggestions de repas** (5 base + 8 nouvelles)
- **2 recettes complètes** avec instructions détaillées
- **9 séances d'activité** (6 base + 3 nouvelles complètes)

---

## 🚨 Sécurité et Bonnes Pratiques

### **❌ À NE JAMAIS FAIRE**

- Utiliser `seed-development.sql` en production
- Committer des mots de passe réels dans les seeds
- Mélanger données fake et données métier réelles

### **✅ Recommandations**

1. **Toujours vérifier** l'environnement avant d'exécuter un seed
2. **Utiliser des variables d'environnement** pour les configurations sensibles
3. **Documenter** toute modification des seeds
4. **Tester** les seeds sur un environnement de staging avant production

### **🔒 Variables d'environnement**

```bash
# .env.development
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=xxx

# .env.production
VITE_SUPABASE_URL=https://ckbtlvhemxsgqztvnyrw.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 🔄 Procédures de Déploiement

### **Développement → Staging**
1. Vérifier que les migrations passent
2. Tester avec `seed-development.sql`
3. Valider les fonctionnalités avec données fake

### **Staging → Production**
1. Basculer vers `seed-production.sql`
2. Exécuter migration sur base de production
3. Importer uniquement le contenu métier
4. **JAMAIS** importer les utilisateurs fake

---

## 📈 Métriques et Monitoring

### **Données de test disponibles pour développement** :

- **Sarah** : ~50 entrées journal, parfait pour tester dashboard complet
- **Emma** : ~3 entrées, parfait pour tester onboarding nouveau utilisateur
- **Claire** : ~15 entrées focalisées douleur, parfait pour tester adaptations symptômes

### **Contenu production** :
- **8 suggestions repas** supplémentaires couvrant tous les moments de la journée
- **2 recettes ultra-détaillées** avec mode cuisine step-by-step
- **3 séances complètes** avec modifications/variations

---

## 🛠️ Maintenance et Évolution

### **Ajouter de nouvelles données de développement**
1. Modifier `seed-development.sql`
2. Ajouter données cohérentes pour les utilisateurs existants
3. Maintenir la diversité des profils (actif/nouveau/expérimenté)

### **Ajouter du contenu métier**
1. Modifier `seed-production.sql`
2. S'assurer de la validation nutritionnelle/médicale
3. Tester d'abord en développement

### **Migration de schéma**
1. Créer migration dans `migrations/`
2. Adapter les seeds si nécessaire
3. Tester le reset complet

---

## 📞 Support et Contact

En cas de problème avec les seeds :

1. **Vérifier** l'environnement et le fichier de configuration
2. **Consulter** les logs Supabase : `supabase logs`
3. **Reset propre** : `supabase db reset --debug`

---

*Document maintenu à jour au 13 septembre 2025*