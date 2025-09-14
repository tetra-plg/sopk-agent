---
notion_page_id: "26dc48d1806980b19b08ed84492ba4e3"
title: "Doc Projet - SOPK Companion"
---

# Doc Projet

# 📱 Document Produit Détaillé — Application SOPK Companion

---

## 1. 🎯 Explication du projet

### Contexte

Le **SOPK (Syndrome des Ovaires Polykystiques)** touche 1 femme sur 10. Il entraîne des symptômes variés : règles irrégulières, fatigue chronique, troubles du sommeil, fringales sucrées, acné, prise de poids, infertilité possible. Ces symptômes, souvent invisibles et mal compris, impactent fortement la qualité de vie.

### Cible

- Femmes diagnostiquées ou suspectant un SOPK.
- Jeunes adultes (18–35 ans) souvent actives, en recherche d’outils pour comprendre et gérer leur quotidien.
- Non spécialistes : elles veulent des conseils pratiques, pas de jargon médical.

### Objectif

Créer une **application compagnon** qui accompagne la patiente dans son quotidien, l’aide à mieux comprendre son corps et lui propose des solutions concrètes et adaptées. L’app doit être :

- **Bienveillante** : sans jugement, avec un ton positif.
- **Pratique** : recommandations simples, faciles à appliquer.
- **Personnalisée** : adaptée aux symptômes et au cycle de chacune.

### Impact attendu

- Réduction du stress et du sentiment d’isolement.
- Meilleure hygiène de vie (alimentation, activité, sommeil).
- Prise de conscience des liens entre symptômes et habitudes.
- Outil de support pour les consultations médicales.

---

## 2. 👩‍🦱 Cas Utilisateur (CU)

### CU1 — Fatigue intense pendant les règles

- Contexte : Je me réveille avec crampes et grosse fatigue.
- Besoin : Savoir quel type d’activité faire (ou ne pas faire), et quoi manger sans me fatiguer.
- Comment l’app aide : Propose séance douce (yoga, marche 20 min) + idées de repas digestes (soupe, omelette, yaourt grec).

***Résultat attendu*** : Je me sens guidée, sans culpabiliser de « ne pas en faire assez ».

### CU2 — Gérer mes fringales de sucre

- Contexte : En fin de journée, j’ai une envie forte de grignoter sucré.
- Besoin : Trouver une alternative qui calme ma faim sans déséquilibrer ma glycémie.
- Comment l’app aide : Suggestion de snacks simples (pomme + beurre d’amande, yaourt nature + fruits rouges).

***Résultat attendu*** : Je garde le contrôle, sans frustration.

### CU3 — Suivi de mon cycle et de mes symptômes

- Contexte : Mon cycle est irrégulier, je ne sais jamais quand mes règles arrivent.
- Besoin : Comprendre les tendances de mon cycle et mes symptômes (acné, douleurs, humeur).
- Comment l’app aide : Calendrier + journal symptômes (fatigue, douleurs, humeur, poids) avec suivi visuel.

***Résultat attendu*** : Je repère mes schémas personnels et je comprends mieux mon corps.

### CU4 — Motivation pour bouger

- Contexte : Je sais que le sport aide, mais j’ai du mal à me lancer.
- Besoin : Avoir un plan adapté et réaliste, pas trop intense.
- Comment l’app aide : Programme hebdo personnalisé (2x muscu douce, 2x cardio léger, étirements quotidiens).

***Résultat attendu*** : Je bouge régulièrement sans me sentir épuisée.

### CU5 — Mieux dormir

- Contexte : Je dors mal, je me réveille fatiguée.
- Besoin : Améliorer la qualité de mon sommeil.
- Comment l’app aide : Conseils d’hygiène du sommeil + rituels relaxants (respiration, méditation guidée, routine de coucher).

***Résultat attendu*** : Je m’endors plus facilement, je récupère mieux.

### CU6 — Comprendre mes analyses médicales

- Contexte : Mon médecin m’a prescrit des bilans (insuline, glycémie, hormones) que je comprends mal.
- Besoin : Savoir à quoi servent ces examens et suivre leur évolution.
- Comment l’app aide : Explication simple + suivi graphique des résultats dans le temps.

***Résultat attendu*** : Je comprends mes données médicales et je peux les montrer à mon médecin.

### CU7 — Gestion du stress

- Contexte : Mon stress augmente mes symptômes (acné, fatigue, règles irrégulières).
- Besoin : Trouver des outils simples pour gérer le stress au quotidien.
- Comment l’app aide : Propose méditations, exercices de respiration, petits challenges bien-être.

***Résultat attendu*** : Je me sens plus calme et mes symptômes s’atténuent.

### CU8 — Suivi des calories IN/OUT

- Contexte : Je souhaite équilibrer mon alimentation et mes dépenses sans tomber dans la restriction.
- Besoin : Avoir une vision simple de ce que je mange et brûle.
- Comment l’app aide : Scan des aliments + connexion avec montre/trackers d’activité.

***Résultat attendu*** : Je visualise mes apports/dépenses et j’ajuste en douceur.

### CU9 — Accompagnement personnalisé selon ma phase du cycle

- Contexte : J’ai des symptômes différents selon le moment (ovulation, règles, etc.).
- Besoin : Savoir quoi privilégier (sport, repas, repos) selon ma phase.
- Comment l’app aide : Propose activités + recettes adaptées à la période du cycle.

***Résultat attendu*** : Je me sens comprise et guidée en fonction de mon corps.

---

## 3. 🧩 Structure Modulaire

### 📊 Module Cycle & Symptômes

- Journal quotidien : règles, douleurs, humeur, sommeil, acné, énergie.
- Calendrier visuel (avec rappels pour règles, ovulation possible).
- Historique + tendances (ex. “tu observes souvent fatigue + envies de sucre avant tes règles”).

**Fonctionnalités** :

- Journal quotidien : règles, douleurs, humeur, acné, fatigue, sommeil.
- Calendrier cycle + prévisions règles/ovulation.
- Notifications d’anticipation (“règles probables bientôt → prépare-toi”).

**Implications** (médical/utilisateur) :

- Permet de comprendre les irrégularités typiques du SOPK.
- Favorise la prise de conscience des schémas personnels (ex. fringales + insomnie avant règles).
- Sert de base aux autres modules pour adapter recommandations.

**Interactions** :

- Avec Nutrition → proposer recettes digestes pendant règles.
- Avec Activité → ajuster intensité sport selon phase du cycle.
- Avec Sommeil/Stress → corréler insomnie et douleurs.
- Avec Dashboard → alimenter les graphiques et insights.

### 🍽️ Module Nutrition

- Suggestion de repas/snacks adaptés (selon symptômes, cycle, glycémie).
- Bibliothèque de recettes équilibrées index glycémique bas.
- Possibilité d’entrer ses repas → suivi calories IN, macro-nutriments.
- Conseils pratiques : organisation des repas, alternatives saines.

**Fonctionnalités** :

- Suggestions repas/snacks adaptés aux symptômes ou phase du cycle.
- Bibliothèque recettes IG bas.
- Tracking alimentaire (manuel + scan) avec calories/macros.
- Récap hebdo (apports, équilibre glycémique).

**Implications** :

- L’alimentation influence directement l’insuline, le poids, l’énergie et l’inflammation → central dans le SOPK.
- Permet de gérer les fringales et de réduire l’effet “yo-yo” glycémique.

**Interactions** :

- Avec Cycle → recommandations personnalisées selon phase (ex. plus de protéines en phase folliculaire).
- Avec Activité → ajuster apports selon dépenses.
- Avec Dashboard → corréler alimentation avec symptômes (ex. plus de fatigue les jours riches en sucres).

### 🏃 Module Activité Physique

- Programmes adaptés SOPK (cardio doux, renfo, mobilité).
- Séances guidées vidéo/audio (ex. yoga anti-douleur règles).
- Suivi de l’activité via montre connectée ou saisie manuelle.
- Recommandations selon cycle : ex. “phase folliculaire → énergie plus haute, fais du renfo”.

**Fonctionnalités** :

- Programme d’exercices SOPK-friendly (cardio doux + renfo + yoga).
- Séances guidées vidéo/audio.
- Suivi activité (tracker ou saisie manuelle).
- Challenges “bouger un peu chaque jour”.

**Implications** :

- L’activité améliore la sensibilité à l’insuline, l’ovulation et réduit le stress → un des traitements non-médicamenteux les plus efficaces.
- Mais attention : trop intense peut aggraver fatigue et stress hormonal.

**Interactions** :

- Avec Cycle → adapter sport à l’énergie (période règles = yoga doux, ovulation = renfo).
- Avec Sommeil → activité régulière favorise un meilleur sommeil.
- Avec Dashboard → montrer impact activité → énergie/symptômes.

### 😴 Module Sommeil (Phase 2)

- Suivi du sommeil (auto-saisie ou via tracker).
- Conseils personnalisés (routine du soir, hygiène de sommeil).
- Exercices guidés pour s’endormir (respiration, méditation courte).

**Fonctionnalités** :

- Journal ou intégration trackers.
- Routine du soir guidée (respiration, méditation).
- Conseils personnalisés (limiter écrans, caféine).
- Rapport hebdo sommeil.

**Implications** :

- Le manque de sommeil aggrave la résistance à l’insuline, le stress et les déséquilibres hormonaux.
- Favoriser un rythme régulier aide à réduire symptômes du SOPK.

**Interactions** :

- Avec Cycle → corréler insomnie avec période prémenstruelle.
- Avec Stress → relaxation du soir couplée à exercices respiration.
- Avec Dashboard → croiser sommeil avec fringales, humeur, énergie.

### 🧘 Module Stress & Bien-être

- Méditations guidées / respirations anti-stress.
- Exercices de relaxation express (2–5 minutes).
- Journal de gratitude ou humeur.
- Notifications bienveillantes (“prends 5 min pour toi”).

**Fonctionnalités** :

- Exercices de respiration guidée.
- Méditations courtes adaptées (douleur, anxiété).
- Journal humeur (notes + emojis).
- Notifications bienveillantes.

**Implications** :

- Le stress augmente le cortisol, qui dérègle insuline et hormones → cercle vicieux du SOPK.
- Apporter des outils concrets au quotidien est crucial.

**Interactions** :

- Avec Sommeil → routines relaxantes le soir.
- Avec Cycle → corréler stress avec poussées d’acné ou douleurs.
- Avec Dashboard → voir lien stress ↔ symptômes.

### 📈 Module Dashboard

- Vision globale de la semaine : nutrition, sport, sommeil, humeur.
- Graphiques simples pour voir l’évolution des symptômes / cycle.
- Récap mensuel exportable (utile pour montrer au médecin/diététicien).

**Fonctionnalités** :

- Vue quotidienne (symptômes, sommeil, sport, nutrition).
- Vue hebdo/mensuelle avec graphiques.
- Corrélations automatiques (“Tu dors mieux les jours où tu fais 30 min de marche”).
- Export pour médecin.

**Implications** :

- L’utilisateur comprend mieux son corps et ses déclencheurs.
- Outil utile en consultation médicale → suivi structuré.

**Interactions** :

- Centralise les données de Cycle, Nutrition, Activité, Sommeil, Stress.
- Alimente Education avec insights contextualisés (“Découvre pourquoi le sommeil influence ta glycémie”).

### 📚 Module Éducatif (Phase 3)

- Articles vulgarisés sur le SOPK : nutrition, hormones, activité.
- Explications des analyses médicales (glycémie, insuline, hormones).
- Conseils validés par experts, avec langage simple.

**Fonctionnalités** :

- Fiches simples : SOPK & hormones, nutrition, activité.
- Explications analyses médicales.
- Guides pratiques et FAQ.

**Implications** :

- Donne à la patiente les connaissances pour agir.
- Réduit l’anxiété liée au flou médical.

**Interactions** :

- Avec Dashboard → recommandations personnalisées (ex. article “comment gérer les fringales” si pic de fringales identifié).
- Avec Cycle → explications sur phases et symptômes.

### ⚙️ Module Paramètres

- Choix des objectifs : mieux dormir, gérer mon poids, équilibrer mon énergie…
- Niveau d’accompagnement : basique (suggestions simples) ou avancé (suivi calories, activité détaillée).
- Connexion avec objets connectés (montre, balance, appli nutrition).

**Fonctionnalités** :

- Définir objectifs (mieux dormir, gérer poids, réduire acné).
- Personnalisation notifications.
- Connexion objets connectés & apps.
- Mode privé/discret.

**Implications** :

- Rend l’app adaptée à chaque patiente, pas une solution générique.
- Favorise l’adhésion long terme.

**Interactions** :

- Influence tous les modules → moteur de personnalisation.

---

## 4. 🛠️ Roadmap Produit

### Phase 1 — MVP

🎯 Objectif : offrir un compagnon simple et utile au quotidien, centré sur les besoins les plus critiques :

- mieux comprendre son corps,
- avoir des conseils pratiques immédiats,
- se sentir soutenue sans être submergée.

**Modules & Features :**

1. Cycle & Symptômes (socle indispensable)
    - Journal quotidien : règles, douleurs, humeur, fatigue.
    - Calendrier simple avec prévisions approximatives.
    - Notifications d’anticipation règles.
2. Nutrition
    - Suggestions de repas/snacks adaptés aux symptômes.
    - Bibliothèque de recettes IG bas.
    - Suivi alimentaire simplifié (ajout manuel basique).
3. Activité physique
    - Séances guidées courtes (yoga, marche, mobilité).
    - Programme hebdo léger (2–3 activités).
4. Stress & Bien-être
    - Exercices de respiration guidée.
    - Journal humeur (rapide : note + emoji).
5. Dashboard simple
    - Vue quotidienne (symptômes + activité + humeur).
    - Historique hebdomadaire basique.

**✨ Valeur pour l’utilisatrice SOPK :**

- Comprend mieux son cycle et ses symptômes.
- Aide immédiate pour manger et bouger sans se fatiguer.
- Premiers outils pour gérer fatigue et stress.

### Phase 2 — Version évoluée

🎯 Objectif : enrichir avec du suivi de qualité et de la personnalisation, pour transformer l’app en coach santé.
**Modules & Features :**

1. Cycle & Symptômes
    - Historique détaillé et tendances (corrélations).
    - Suivi d’autres symptômes (acné, sommeil, fringales).
2. Nutrition
    - Tracking via scan alimentaire.
    - Plan repas personnalisable (adapté à objectifs).
    - Récap hebdo nutrition avec recommandations.
3. Activité physique
    - Connexion trackers (Fitbit, Apple Health, Google Fit).
    - Adaptation au cycle (séances proposées selon phase).
    - Challenges légers (“bouger 20 min/jour 1 semaine”).
4. Sommeil (nouveau module prioritaire)
    - Journal du sommeil (manuel ou via tracker).
    - Routine du soir guidée (méditation, respiration).
    - Rapport hebdo sommeil.
5. Stress & Bien-être
    - Méditations guidées (douleur, anxiété).
    - Notifications bienveillantes personnalisées.
6. Dashboard
    - Graphiques évolués (symptômes ↔ sommeil ↔ activité).
    - Insights automatiques simples (“tu dors mieux quand tu bouges”).

**✨ Valeur pour l’utilisatrice SOPK :**

- Meilleure maîtrise de ses déclencheurs personnels (nutrition, sport, sommeil).
- Conseils adaptés au cycle → sentiment d’un accompagnement personnalisé.
- Prise de conscience des corrélations (ex. stress ↔ acné).

### Phase 3 — Version avancée

🎯 Objectif : faire évoluer l’app en assistant santé SOPK complet, capable d’aider aussi dans la relation médecin/patient.
**Modules & Features :**

1. Cycle & Symptômes
    - Prédictions plus intelligentes via machine learning.
    - Suivi fertilité (pour celles qui le souhaitent).
2. Nutrition
    - Suivi avancé (calories IN/OUT, macros).
    - Conseils dynamiques en fonction de l’activité/sommeil.
3. Activité physique
    - Séances vidéo plus riches (yoga, renfo, cardio doux).
    - Programme évolutif personnalisé.
4. Sommeil
    - Intégration avancée avec trackers sommeil.
    - Corrélations automatiques sommeil ↔ symptômes.
5. Stress & Bien-être
    - Mini-défis bien-être (gratitude, respiration quotidienne).
    - Espace “pause anti-stress” interactif.
6. Dashboard & Insights
    - Corrélations complexes (ex. “acné + insomnie = phase lutéale instable”).
    - Export PDF/CSV pour médecin ou diététicien.
7. Espace éducatif (nouveau focus)
    - Explication analyses médicales vulgarisées.
    - Articles/vidéos pédagogiques adaptés aux données perso.
    - FAQ et myth-busting.

**✨ Valeur pour l’utilisatrice SOPK :**

- Vision 360° de sa santé (cycle, alimentation, sommeil, sport, stress).
- Outil pour préparer consultations médicales (export, suivi long terme).
- Sentiment de maîtrise et empowerment.

## 🎯 Synthèse Roadmap

**MVP (Phase 1)** : ***Soulager le quotidien*** → Cycle, Nutrition, Activité douce, Stress, Dashboard simple.

**Phase 2** : ***Personnaliser et corréler*** → Suivi avancé, Sommeil, intégrations connectées, Dashboard évolué.

**Phase 3** : ***Devenir assistant santé complet*** → Insights intelligents, suivi médical, export médecin, espace éducatif riche.

---

## 5. 🚀 MVP détaillé

### a) Priorisation RICE

1. 📊 Cycle & Symptômes
    - Journal quotidien (douleurs, humeur, règles)
    Reach : 5 | Impact : 5 | Confidence : 5 | Effort : 2
    Score = 62,5 ✅ core feature
    - Calendrier simple + prévisions règles
    Reach : 5 | Impact : 4 | Confidence : 4 | Effort : 3
    Score = 26,7
    1. 🍽️ Nutrition
    - Suggestions repas/snacks adaptés aux symptômes
    Reach : 5 | Impact : 5 | Confidence : 4 | Effort : 2
    Score = 50 ✅ très prioritaire
    - Bibliothèque recettes IG bas
    Reach : 4 | Impact : 4 | Confidence : 5 | Effort : 2
    Score = 40
    - Tracking alimentaire simple (manuel)
    Reach : 4 | Impact : 3 | Confidence : 4 | Effort : 3
    Score = 16
2. 🏃 Activité physique
    - Séances guidées courtes (yoga, mobilité, marche)
    Reach : 4 | Impact : 4 | Confidence : 5 | Effort : 2
    Score = 40
    - Programme hebdo léger (proposé automatiquement)
    Reach : 3 | Impact : 3 | Confidence : 4 | Effort : 3
    Score = 12
3. 🧘 Stress & Bien-être
    - Exercices respiration guidée (2–5 min)
    Reach : 4 | Impact : 4 | Confidence : 5 | Effort : 1
    Score = 80 ✅ quick win prioritaire
    - Journal humeur rapide (emoji + note)
    Reach : 4 | Impact : 3 | Confidence : 5 | Effort : 1
    Score = 60 ✅ prioritaire
4. 📈 Dashboard simple
    - Vue quotidienne (symptômes + humeur + activité)
    Reach : 5 | Impact : 4 | Confidence : 4 | Effort : 2
    Score = 40
    - Historique hebdo basique
    Reach : 4 | Impact : 3 | Confidence : 4 | Effort : 3
    Score = 16

**🎯 Résultat RICE – MVP (Top priorités)**

1. Exercices respiration guidée (Score 80)
2. Journal symptômes quotidien (Score 62,5)
3. Journal humeur rapide (Score 60)
4. Suggestions repas/snacks (Score 50)
5. Dashboard quotidien (Score 40)
6. Séances guidées courtes activité physique (Score 40)
7. Bibliothèque recettes IG bas (Score 40)

***💡 Les autres features (prévision règles, historique hebdo, tracking repas, programme sport hebdo) → à garder pour Phase 2, car moins “game-changers” en MVP.***

### b) User Journey MVP (journée type)

**👩‍🦱 Persona de référence**
Prénom : Sarah, 28 ans
Contexte : SOPK diagnostiqué il y a 2 ans. Fatigue chronique, règles irrégulières, envies de sucre en fin de journée.
Objectif : mieux comprendre son corps et avoir un compagnon simple qui l’aide au quotidien sans être culpabilisant.

**📅 User Journey MVP — Journée type**

1. 🌅 Matin
Action : Sarah ouvre l’app en prenant son café.
Feature activée : Journal symptômes
→ Elle renseigne : fatigue = 3/5, douleurs légères, règles en cours.
Feature activée : Journal humeur
→ Elle choisit un emoji “😐” + note 5/10.
***Résultat*** : L’app met à jour son dashboard du jour → elle voit son état global.
2. 🕛 Midi
Action : Elle n’a pas beaucoup d’énergie et veut savoir quoi manger.
Feature activée : Suggestions repas/snacks adaptés
→ L’app lui propose : soupe de lentilles + yaourt grec + kiwi (repas digestif, protéines + fibres).
***Résultat*** : Sarah choisit une suggestion et se sent rassurée de faire un choix adapté.
3. 🕓 Après-midi
Action : En pleine journée de travail, elle sent son stress monter.
Feature activée : Exercices de respiration guidée (quick win)
→ L’app lui propose une session de 3 min respiration “box breathing”.
***Résultat*** : Elle se détend, baisse son stress et évite une fringale de sucre.
4. 🕖 Soirée
Action : Sarah veut bouger un peu mais est fatiguée.
Feature activée : Séance guidée courte activité physique
→ L’app lui propose : 20 min yoga doux spécial “douleurs menstruelles”.
***Résultat*** : Elle fait la séance, se sent fière et plus détendue.
5. 🌙 Fin de journée
Action : Avant de se coucher, Sarah consulte son dashboard quotidien.
Feature activée : Dashboard simple
→ Elle voit :
Symptômes du jour (fatigue modérée, douleurs légères).
Humeur (5/10).
Activité : 20 min yoga.
Nutrition : repas équilibrés.
***Résultat*** : Elle a une vue claire sur sa journée → sentiment de contrôle et de progression.

**✨ Expérience ressentie MVP**
L’app ne surcharge pas d’infos, elle est légère et bienveillante.
Elle donne des petits coups de pouce utiles au bon moment (nutrition, respiration, activité).
Elle aide Sarah à se sentir actrice plutôt que victime de son SOPK.

**👉 La suite (Phase 2) enrichira ce parcours avec :**
prévisions règles, historique, tracking alimentaire plus avancé, routines sommeil, corrélations intelligentes.

### c) Maquette fonctionnelle

1. Écran d’accueil / Dashboard quotidien
    
    📌 Rôle : point de départ simple, vue claire de la journée.
    
    **Sections :**
    
    - 🩸 Résumé symptômes & humeur (info du jour).
    - 🍽️ Suggestion repas/snack du moment (matin/midi/soir).
    - 🧘 Suggestion activité courte ou respiration (selon fatigue/symptômes).
    - 📊 Petit récap du jour : activité, nutrition, humeur (3–4 cartes max).
    
    **Actions possibles :**
    
    - “Ajouter mes symptômes” → ouvre journal rapide.
    - “Voir plus de recettes” → ouvre module Nutrition.
    - “Faire une séance” → ouvre Activité.
    - “Faire une respiration guidée” → ouvre Bien-être.
2. Journal quotidien (Cycle & Symptômes + Humeur)
📌 Rôle : permettre un suivi rapide et non contraignant.
    
    **Fonctionnalités MVP :**
    
    - Sélecteur simple pour règles (oui/non/jour du cycle).
    - Curseurs rapides : fatigue (0–5), douleur (0–5).
    - Mood tracker : emoji + note sur 10.
    - Ajout libre (optionnel) : notes perso.
    
    **Interaction :**
    
    - Données alimentent automatiquement le Dashboard et l’historique.
3. Module Nutrition
📌 Rôle : accompagner sans complexité.
    
    **Fonctionnalités MVP :**
    
    - Suggestions repas/snacks (listes simples, 2–3 choix selon moment de la journée et symptômes renseignés).
    - Bibliothèque recettes IG bas (filtrable par type : petit-déj, repas, snack).
    - Entrée rapide repas (manuel, juste “ajouté” sans macros détaillés).
    
    **Interaction :**
    
    - Les choix ou ajouts apparaissent dans le Dashboard.
4. Module Activité physique
📌 Rôle : proposer des mouvements adaptés et accessibles.
    
    **Fonctionnalités MVP :**
    
    - Liste de séances guidées courtes (5–20 min).
    - Catégories : yoga doux, mobilité, marche guidée.
    - Proposition contextuelle depuis Dashboard selon symptômes (ex. règles → yoga anti-crampes).
    
    **Interaction :**
    
    - Durée de séance → remonte au Dashboard.
5. Module Stress & Bien-être
📌 Rôle : outils rapides anti-stress.
    
    **Fonctionnalités MVP :**
    
    - Exercices respiration guidée (2–5 min).
    - Méditation très courte (facultatif MVP).
    - Journal humeur accessible aussi ici (redondance volontaire).
    
    **Interaction :**
    
    - Journal humeur + exercices → alimentent Dashboard & corrélations futures.
6. Historique / Vue hebdo
📌 Rôle : donner un petit recul sur la semaine.
    
    **Fonctionnalités MVP :**
    
    - Liste des jours → résumé (symptômes, humeur, activité, nutrition).
    - Graphique basique humeur/énergie (ligne simple).
    
    **Interaction :**
    
    - Données croisées avec modules → visible par semaine.
7. Paramètres (simplifiés)
📌 Rôle : personnalisation minimale MVP.
    
    **Fonctionnalités MVP :**
    
    - Objectifs personnels (mieux dormir, gérer énergie, mieux manger).
    - Notifications (on/off, fréquence).
    - Mode discret/privé.

### d) Arborescence MVP

```
Accueil / Dashboard
 ├── Journal quotidien (Cycle & Symptômes + Humeur)
 ├── Nutrition
 │     ├── Suggestions repas/snacks
 │     └── Recettes IG bas
 ├── Activité physique
 │     └── Séances guidées courtes
 ├── Stress & Bien-être
 │     └── Respiration guidée
 ├── Historique (vue hebdo simple)
 └── Paramètres

```

---

## 6. ✨ Conclusion

Le MVP se concentre sur des **fonctionnalités simples, utiles et motivantes** : journal quotidien, conseils pratiques (repas, respiration, activité douce) et un dashboard clair. L’app est pensée pour être un **compagnon bienveillant**, qui grandira ensuite vers un **assistant santé complet** avec suivi avancé, corrélations intelligentes et espace éducatif riche.
