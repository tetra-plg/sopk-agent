# Prompt pour Génération de Recettes SOPK

## Contexte
Tu es un expert en nutrition spécialisé dans le Syndrome des Ovaires Polykystiques (SOPK). Tu dois générer des recettes adaptées aux femmes atteintes de SOPK, en respectant strictement le format de base de données fourni pour permettre un import CSV direct.

## Objectif
Générer 50 recettes variées et équilibrées pour femmes SOPK, adaptées à différents moments de la journée et symptômes.

## Format de Sortie EXACT (CSV)
Génère les données au format CSV avec ces colonnes exactes :

```csv
title,description,category,prep_time_minutes,cook_time_minutes,servings,difficulty,glycemic_index_category,sopk_benefits,dietary_tags,symptom_targets,cycle_phases,main_nutrients,estimated_calories,mood_boosting,season,ingredients,instructions,tips,nutritional_info
```

## Schéma Détaillé des Colonnes

### Colonnes Texte Simple
- **title** : Nom de la recette (max 200 caractères)
- **description** : Description courte et attrayante
- **category** : UNIQUEMENT : 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'
- **difficulty** : UNIQUEMENT : 'beginner', 'easy', 'medium', 'advanced'
- **glycemic_index_category** : UNIQUEMENT : 'low', 'medium', 'high' (privilégier 'low')
- **tips** : Astuces de préparation ou variantes

### Colonnes Numériques
- **prep_time_minutes** : Temps de préparation en minutes (INTEGER)
- **cook_time_minutes** : Temps de cuisson en minutes (INTEGER, 0 si pas de cuisson)
- **servings** : Nombre de portions (INTEGER, généralement 2 ou 4)
- **estimated_calories** : Calories estimées par portion (INTEGER)

### Colonnes Booléennes
- **mood_boosting** : true/false (si contient oméga-3, magnésium, tryptophane)

### Colonnes Array (format PostgreSQL)
Format : `{valeur1,valeur2,valeur3}` (sans espaces après les virgules)

- **sopk_benefits** : Choisir parmi :
  - `{hormone_balance,inflammation_reduction,insulin_regulation,energy_boost,fertility_support,weight_management,stress_reduction}`

- **dietary_tags** : Choisir parmi :
  - `{vegetarian,vegan,gluten_free,dairy_free,low_carb,high_protein,high_fiber,paleo,mediterranean}`

- **symptom_targets** : Choisir parmi :
  - `{fatigue,mood_swings,cravings,acne,bloating,period_pain,insulin_resistance,inflammation,anxiety,insomnia}`

- **cycle_phases** : Choisir parmi :
  - `{menstrual,follicular,ovulation,luteal}` (peut être multiple)

- **main_nutrients** : Choisir parmi :
  - `{protein,fiber,iron,omega3,magnesium,zinc,vitamin_d,vitamin_b12,folate,calcium,antioxidants}`

- **season** : Choisir parmi :
  - `{spring,summer,autumn,winter,all_seasons}`

### Colonnes JSON
Format : `"[objet JSON échappé]"` avec doubles quotes externes

- **ingredients** : Format JSON array d'objets
  ```json
  "[{\"name\":\"quinoa\",\"quantity\":\"150g\",\"category\":\"grains\"},{\"name\":\"avocat\",\"quantity\":\"1\",\"category\":\"vegetables\"}]"
  ```
  Categories possibles : grains, proteins, vegetables, fruits, dairy, fats, spices, other

- **instructions** : Format JSON array d'objets
  ```json
  "[{\"step\":1,\"instruction\":\"Rincer le quinoa\",\"duration_minutes\":2},{\"step\":2,\"instruction\":\"Cuire le quinoa\",\"duration_minutes\":15}]"
  ```

- **nutritional_info** : Format JSON objet
  ```json
  "{\"calories\":350,\"protein\":25,\"carbs\":30,\"fat\":15,\"fiber\":8,\"sugar\":5}"
  ```

## Critères SOPK Importants

### Priorités Nutritionnelles
1. **Index Glycémique Bas** (80% des recettes)
2. **Riches en Fibres** (>5g par portion)
3. **Protéines de Qualité** (20-30g par repas principal)
4. **Anti-inflammatoires** (curcuma, gingembre, omega-3)
5. **Magnésium et Zinc** (graines, noix, légumineuses)

### Aliments à Privilégier
- Grains complets : quinoa, avoine, riz complet
- Protéines : poisson gras, œufs, légumineuses, poulet
- Légumes : épinards, brocoli, chou kale
- Bonnes graisses : avocat, noix, huile d'olive
- Anti-inflammatoires : baies, curcuma, gingembre

### Aliments à Limiter
- Sucres raffinés
- Farines blanches
- Produits laitiers en excès
- Aliments ultra-transformés

## Répartition des Recettes

Génère 50 recettes avec cette distribution :
- **Breakfast** : 15 recettes (overnight oats, smoothie bowls, omelettes...)
- **Lunch** : 12 recettes (salades, bowls, soupes...)
- **Dinner** : 12 recettes (plats complets équilibrés...)
- **Snack** : 8 recettes (energy balls, houmous, smoothies...)
- **Dessert** : 3 recettes (IG bas, sans sucre raffiné...)

### Variété Requise
- 60% végétariennes minimum
- 30% sans gluten
- 40% préparation < 20 minutes
- Couvrir les 4 saisons
- Adapter aux différentes phases du cycle

## Exemple de Ligne CSV Correcte

```csv
"Bowl Quinoa Anti-Inflammatoire","Bowl complet riche en protéines et antioxydants, parfait pour réguler la glycémie","lunch",15,20,2,"easy","low","{hormone_balance,inflammation_reduction,insulin_regulation}","{vegetarian,gluten_free,high_protein}","{fatigue,insulin_resistance,inflammation}","{follicular,ovulation}","{protein,fiber,omega3,antioxidants}",420,true,"{summer,spring}","[{\"name\":\"quinoa\",\"quantity\":\"150g\",\"category\":\"grains\"},{\"name\":\"pois chiches\",\"quantity\":\"200g\",\"category\":\"proteins\"},{\"name\":\"avocat\",\"quantity\":\"1\",\"category\":\"vegetables\"},{\"name\":\"épinards\",\"quantity\":\"100g\",\"category\":\"vegetables\"},{\"name\":\"graines de chia\",\"quantity\":\"2 càs\",\"category\":\"other\"},{\"name\":\"citron\",\"quantity\":\"1\",\"category\":\"fruits\"},{\"name\":\"huile d'olive\",\"quantity\":\"2 càs\",\"category\":\"fats\"},{\"name\":\"curcuma\",\"quantity\":\"1 càc\",\"category\":\"spices\"}]","[{\"step\":1,\"instruction\":\"Rincer et cuire le quinoa dans 300ml d'eau bouillante\",\"duration_minutes\":15},{\"step\":2,\"instruction\":\"Égoutter et rincer les pois chiches\",\"duration_minutes\":2},{\"step\":3,\"instruction\":\"Laver et essorer les épinards\",\"duration_minutes\":3},{\"step\":4,\"instruction\":\"Couper l'avocat en tranches\",\"duration_minutes\":2},{\"step\":5,\"instruction\":\"Assembler le bowl avec quinoa en base\",\"duration_minutes\":3},{\"step\":6,\"instruction\":\"Ajouter pois chiches, épinards et avocat\",\"duration_minutes\":2},{\"step\":7,\"instruction\":\"Arroser d'huile d'olive et jus de citron\",\"duration_minutes\":1},{\"step\":8,\"instruction\":\"Saupoudrer de graines de chia et curcuma\",\"duration_minutes\":1}]","Préparer le quinoa la veille pour gagner du temps. Ajouter du gingembre frais pour plus de bénéfices anti-inflammatoires","{\"calories\":420,\"protein\":18,\"carbs\":45,\"fat\":20,\"fiber\":12,\"sugar\":4}"
```

## Instructions Finales

1. Génère EXACTEMENT 50 recettes variées
2. Respecte STRICTEMENT le format CSV avec tous les champs
3. Utilise des guillemets doubles pour encapsuler chaque valeur
4. Échappe correctement les guillemets dans le JSON avec \"
5. Pas d'espaces après les virgules dans les arrays PostgreSQL
6. Assure-toi que chaque recette apporte une vraie valeur SOPK
7. Varie les ingrédients et techniques pour éviter la monotonie
8. Inclus des options pour différents budgets et niveaux de cuisine

## Validation

Avant de finaliser, vérifie que :
- ✅ Toutes les recettes ont un index glycémique bas ou moyen
- ✅ Les bénéfices SOPK sont clairement identifiés
- ✅ Les temps de préparation sont réalistes
- ✅ Le JSON est valide et correctement échappé
- ✅ Les arrays PostgreSQL sont au bon format
- ✅ Chaque ligne peut être importée directement dans PostgreSQL

Commence maintenant par générer les 50 recettes au format CSV exact demandé.