# 🏠 Guide du Module Dashboard

## Vue d'ensemble

Le **Dashboard** est votre page d'accueil dans SOPK Companion. C'est votre point de départ quotidien qui vous donne en un coup d'œil toutes les informations importantes sur votre état du jour et vous propose des actions adaptées.

> 💡 **Astuce** : Le Dashboard est conçu pour être consulté rapidement, même les jours difficiles. Toutes les informations essentielles sont visibles sans faire défiler l'écran.

## 🎯 À quoi sert le Dashboard ?

### Vision globale instantanée
- **État du jour** : Vos symptômes, humeur et énergie actuels
- **Suggestions personnalisées** : Conseils adaptés à votre état
- **Actions rapides** : Accès direct aux outils les plus utiles
- **Progression** : Aperçu de votre suivi de la semaine

### Gain de temps
- **Accès rapide** : Maximum 2 clics pour accéder aux fonctionnalités principales
- **Priorisation intelligente** : Les suggestions les plus pertinentes en premier
- **Navigation intuitive** : Boutons d'actions rapides toujours accessibles

## 📱 Interface du Dashboard

### En-tête de bienvenue
```
👋 Bonjour [Votre prénom] !
Mercredi 13 septembre 2024
```

L'en-tête personnalisé vous accueille avec la date du jour et s'adapte selon le moment :
- 🌅 **Matin** (6h-12h) : "Bon matin"
- ☀️ **Après-midi** (12h-18h) : "Bon après-midi"
- 🌙 **Soir** (18h-22h) : "Bonsoir"
- 🌛 **Nuit** (22h-6h) : "Bonne nuit"

### Section "Aujourd'hui"

Cette section présente vos données du jour sous forme de widgets :

#### Widget Symptômes & Humeur
- **Si complété** : Affiche vos niveaux (humeur 7/10, fatigue 3/5, etc.)
- **Si non complété** : Invitation bienveillante à remplir votre journal
- **Tendances** : Flèches indiquant l'évolution par rapport à hier (↗️↘️)

#### Widget Suggestions Personnalisées
- **Repas adapté** : Suggestion basée sur vos symptômes du moment
- **Activité recommandée** : Exercice adapté à votre niveau d'énergie
- **Technique de respiration** : Si stress détecté dans vos symptômes

### Actions rapides
Barre de 5 boutons d'accès direct :
- 📝 **Journal** - Compléter vos symptômes
- 🧘 **Respiration** - Exercice de respiration guidée
- 🍽️ **Nutrition** - Voir toutes les suggestions repas
- 🏃 **Activité** - Catalogue d'exercices
- 📊 **Insights** - Vos statistiques et tendances

## 🔄 Comment le Dashboard s'adapte à vous

### Personnalisation automatique

Le Dashboard analyse vos données pour vous proposer le plus pertinent :

#### Selon vos symptômes du jour
- **Fatigue élevée** → Suggestion de sieste guidée et repas énergétiques
- **Stress important** → Proposition d'exercice de respiration en priorité
- **Douleurs menstruelles** → Yoga doux et conseils anti-inflammatoires
- **Humeur basse** → Activités qui boostent le moral et recettes "réconfort"

#### Selon votre phase de cycle
- **Phase menstruelle** → Activités douces et alimentation anti-inflammatoire
- **Phase folliculaire** → Exercices plus dynamiques et objectifs motivants
- **Ovulation** → Maintien des bonnes habitudes et encouragements
- **Phase lutéale** → Gestion des envies de sucre et techniques anti-stress

#### Selon l'heure de la journée
- **Matin** → Suggestions petit-déjeuner et routine matinale
- **Midi** → Idées repas équilibrés et pause détente
- **Soir** → Dîner léger et préparation au coucher
- **Nuit** → Techniques de relaxation et aide à l'endormissement

## 📊 Widgets détaillés

### Widget "Comment ça va ?" (si journal non complété)

```
📝 Comment ça va ?

Prends 2 minutes pour noter
ton état du jour

⭐ Aide à mieux te comprendre
⭐ Améliore tes suggestions

[📝 Compléter journal]
```

**Actions possibles** :
- Clic sur le bouton → Ouverture directe du journal quotidien
- Questions pré-remplies selon l'heure (matin = "Comment as-tu dormi ?")

### Widget État du jour (si journal complété)

```
📊 Ton état du jour

😊 Humeur    7/10 ↗️
😴 Fatigue   3/5  ↘️
🤕 Douleur   1/5  ↘️

💚 Belle amélioration
   depuis hier !

[Modifier] [Voir détails]
```

**Éléments affichés** :
- **Scores actuels** avec pictogrammes intuitifs
- **Tendances** par rapport à la veille
- **Message encourageant** personnalisé selon l'évolution
- **Actions rapides** : modifier les données ou voir l'historique

### Widget Nutrition contextuelle

```
🍽️ Idée pour ton énergie

Tu sembles fatiguée...

🥗 Salade protéinée
⏱️ 15 min • 💪 Énergie

[Voir recette]
[Autres suggestions]

Déjà mangé ? [✅ Oui]
```

**Logique d'adaptation** :
- **Fatigue** → Repas riches en protéines et fer
- **Stress** → Aliments riches en magnésium
- **Envies de sucre** → Alternatives saines satisfaisantes
- **Douleurs** → Recettes anti-inflammatoires

### Widget Bien-être & Activité

```
🧘 Pause bien-être ?

🌟 3 sessions cette semaine
   Continue comme ça !

[🧘 Respiration 5min]
[🚶 Marche 10min]
[🧘‍♀️ Yoga doux 15min]
```

**Suggestions adaptatives** :
- **Énergie basse** → Techniques de relaxation uniquement
- **Énergie moyenne** → Choix entre repos et activité douce
- **Énergie haute** → Propositions plus dynamiques
- **Douleurs** → Exclusivement yoga thérapeutique et étirements

## 🎨 États visuels du Dashboard

### Mode "Découverte" (première utilisation)
- **Messages d'accueil** étendus avec explications
- **Guidage visuel** avec flèches et animations
- **Suggestions d'actions** pour démarrer (compléter le profil, essayer un exercice)

### Mode "Quotidien" (utilisation régulière)
- **Interface épurée** centrée sur l'essentiel
- **Informations condensées** mais complètes
- **Suggestions basées sur l'historique** personnel

### Mode "Jour difficile" (symptômes élevés)
- **Palette de couleurs** plus douce et apaisante
- **Suggestions simplifiées** avec options très accessibles
- **Messages extra-bienveillants** et encourageants
- **Actions prioritaires** : respiration, repos, soutien

## ⚡ Actions rapides détaillées

### 📝 Journal (Bouton violet)
- **Clic simple** → Ouverture du journal du jour
- **Données pré-remplies** si déjà partiellement complété
- **Sauvegarde automatique** dès la saisie

### 🧘 Respiration (Bouton bleu)
- **Clic simple** → Lancement direct de la technique la plus adaptée
- **Choix intelligent** selon le stress détecté
- **Sessions courtes** prioritaires (2-5 minutes)

### 🍽️ Nutrition (Bouton vert)
- **Clic simple** → Page suggestions avec filtres pré-appliqués
- **Tri automatique** selon les besoins nutritionnels détectés
- **Favoris** mis en avant s'ils existent

### 🏃 Activité (Bouton orange)
- **Clic simple** → Catalogue avec séances recommandées en premier
- **Filtrage automatique** selon niveau d'énergie et symptômes
- **Séances courtes** (5-20 min) priorisées

### 📊 Insights (Bouton gris)
- **Clic simple** → Vue d'ensemble des tendances personnelles
- **Graphiques simples** et encourageants
- **Corrélations utiles** mises en évidence

## 🔄 Actualisation et synchronisation

### Actualisation automatique
- **Au lancement** de l'application
- **Retour de l'arrière-plan** après 10 minutes d'absence
- **Changement d'heure significatif** (passage matin → après-midi)

### Actualisation manuelle
- **Geste pull-to-refresh** en tirant l'écran vers le bas
- **Bouton rafraîchir** (icône ↻) dans le coin supérieur droit
- **Auto-actualisation** après modification de données dans un autre module

### Synchronisation des données
- **Sauvegarde cloud** automatique et sécurisée
- **Synchronisation multi-appareils** si vous utilisez plusieurs devices
- **Mode hors-ligne** avec synchronisation à la reconnexion

## 🎯 Conseils d'utilisation optimale

### Routine matinale recommandée
1. **Ouvrir l'app** dès le réveil ou avec le café
2. **Consulter le Dashboard** pour voir l'état global
3. **Compléter le journal** si ce n'est pas fait (2 minutes max)
4. **Suivre une suggestion** qui vous fait envie (repas, activité, respiration)

### Utilisation en cours de journée
- **Consultations rapides** pour vérifier les suggestions repas
- **Accès aux outils** de gestion du stress si besoin
- **Suivi des objectifs** via les encouragements du Dashboard

### Check du soir
- **Bilan de la journée** via le widget "état du jour"
- **Planification du lendemain** en regardant les suggestions
- **Exercice de détente** proposé avant le coucher

## ❓ Questions fréquentes

### "Pourquoi le Dashboard ne s'actualise pas ?"
- Vérifiez votre connexion internet
- Essayez le geste pull-to-refresh
- Redémarrez l'application si nécessaire

### "Les suggestions ne correspondent pas à mon état"
- Assurez-vous d'avoir complété votre journal du jour
- Vérifiez que votre profil est à jour (symptômes SOPK, préférences)
- Les suggestions s'affinent avec l'usage régulier de l'app

### "Puis-je personnaliser l'ordre des widgets ?"
- Dans cette version, l'ordre est automatique selon la pertinence
- Une fonctionnalité de personnalisation est prévue dans une prochaine mise à jour

### "Le Dashboard consomme-t-il beaucoup de batterie ?"
- Le Dashboard est optimisé pour une consommation minimale
- Les actualisations sont intelligentes (seulement quand nécessaire)
- Vous pouvez désactiver l'actualisation automatique dans les paramètres

## 🔍 Pour aller plus loin

- **[Guide du Journal du Cycle](03-module-cycle.md)** : Approfondissez le suivi de vos symptômes
- **[Guide Stress & Bien-être](04-module-stress.md)** : Découvrez tous les outils de relaxation
- **[Guide Nutrition](05-module-nutrition.md)** : Explorez toutes les suggestions alimentaires
- **[FAQ & Dépannage](07-faq-troubleshooting.md)** : Solutions aux problèmes courants

---

*Le Dashboard évolue avec vous. Plus vous l'utilisez, plus il devient votre compagnon personnalisé ! 🌸*