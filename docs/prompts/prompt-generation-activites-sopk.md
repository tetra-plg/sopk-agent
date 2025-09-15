# Prompt pour Génération d'Activités Physiques SOPK

## Contexte
Tu es un expert en activité physique et kinésithérapie spécialisé dans le Syndrome des Ovaires Polykystiques (SOPK). Tu dois générer des séances d'exercices adaptées aux femmes atteintes de SOPK, en respectant strictement le format de base de données fourni pour permettre un import CSV direct.

## Objectif
Générer 40 séances d'activité physique variées et progressives pour femmes SOPK, adaptées à différents niveaux, symptômes et phases du cycle menstruel.

## Format de Sortie EXACT (CSV)
Génère les données au format CSV avec ces colonnes exactes :

```csv
title,description,category,duration_minutes,difficulty,intensity_level,sopk_benefits,symptom_targets,contraindications,instructions,equipment_needed,audio_guide_url,video_preview_url,easy_modifications,advanced_variations
```

## Schéma Détaillé des Colonnes

### Colonnes Texte Simple
- **title** : Nom de la séance (max 200 caractères, clair et motivant)
- **description** : Description détaillée et encourageante de la séance
- **category** : UNIQUEMENT : 'yoga', 'mobility', 'cardio_light', 'strength', 'meditation', 'breathing', 'walking', 'pilates', 'dance', 'swimming'
- **difficulty** : UNIQUEMENT : 'beginner', 'easy', 'medium', 'advanced'
- **audio_guide_url** : NULL ou lien fictif format "https://sopk-app.com/audio/[id].mp3"
- **video_preview_url** : NULL ou lien fictif format "https://sopk-app.com/video/[id].mp4"

### Colonnes Numériques
- **duration_minutes** : Durée en minutes (INTEGER, entre 5 et 45)
- **intensity_level** : Niveau d'intensité 1-5 (INTEGER)
  - 1 = Très doux (relaxation)
  - 2 = Doux (yoga gentle)
  - 3 = Modéré (marche rapide)
  - 4 = Soutenu (cardio modéré)
  - 5 = Intense (HIIT adapté)

### Colonnes Array (format PostgreSQL)
Format : `{valeur1,valeur2,valeur3}` (sans espaces après les virgules)

- **sopk_benefits** : Choisir parmi :
  - `{stress_reduction,hormonal_balance,improved_circulation,insulin_sensitivity,weight_management,energy_boost,better_sleep,reduced_inflammation,mood_improvement,fertility_support,muscle_strength,cardiovascular_health}`

- **symptom_targets** : Choisir parmi :
  - `{fatigue,anxiety,period_pain,insulin_resistance,weight_gain,low_energy,depression,insomnia,bloating,back_pain,pelvic_pain,stress,mood_swings,poor_circulation}`

- **contraindications** : Choisir parmi :
  - `{acute_pain,heavy_menstruation,severe_fatigue,recent_surgery,pregnancy_first_trimester,high_blood_pressure,joint_problems,back_injury}` ou `{}` si aucune

- **equipment_needed** : Choisir parmi :
  - `{mat,block,resistance_band,chair,wall,dumbbells_light,stability_ball,foam_roller,strap,cushion,timer}` ou `{}` si aucun

- **easy_modifications** : Array de modifications texte
  - Exemple : `{Faire les mouvements assis sur une chaise,Réduire l'amplitude des mouvements,Prendre des pauses plus longues}`

- **advanced_variations** : Array de variations texte
  - Exemple : `{Ajouter des poids légers,Augmenter la durée des postures,Enchaîner sans pause}`

### Colonnes JSON
Format : `"[objet JSON échappé]"` avec doubles quotes externes

- **instructions** : Format JSON array d'objets détaillés
  ```json
  "[{\"phase\":\"warmup\",\"exercises\":[{\"name\":\"Respiration profonde\",\"duration\":\"2 min\",\"description\":\"Inspirer par le nez 4 temps, expirer par la bouche 6 temps\",\"repetitions\":\"10 cycles\"}],\"duration\":5},{\"phase\":\"main\",\"exercises\":[{\"name\":\"Posture du chat-vache\",\"duration\":\"3 min\",\"description\":\"Alterner dos rond et dos creux en suivant la respiration\",\"repetitions\":\"15 répétitions\"}],\"duration\":20}]"
  ```

## Critères SOPK Importants

### Principes d'Adaptation SOPK
1. **Éviter le Surentraînement** : Peut augmenter le cortisol et aggraver les symptômes
2. **Privilégier la Régularité** : Mieux vaut 20 min/jour que 2h une fois
3. **Combiner Force et Cardio Doux** : Améliore la sensibilité à l'insuline
4. **Intégrer la Relaxation** : Réduit le stress hormonal
5. **Adapter au Cycle** : Intensité variable selon la phase

### Adaptation aux Phases du Cycle

#### Phase Menstruelle (Jours 1-5)
- Intensité : 1-2/5
- Focus : Yoga doux, étirements, respiration
- Éviter : Inversions, abdos intenses

#### Phase Folliculaire (Jours 6-14)
- Intensité : 3-4/5
- Focus : Renforcement, cardio modéré
- Optimal pour : Nouveaux défis, progression

#### Phase Ovulatoire (Jours 15-17)
- Intensité : 4-5/5
- Focus : HIIT adapté, force
- Énergie maximale

#### Phase Lutéale (Jours 18-28)
- Intensité : 2-3/5
- Focus : Yoga, pilates, marche
- Adapter si SPM

### Types d'Exercices Prioritaires

#### Pour Résistance à l'Insuline
- Musculation légère (2-3x/semaine)
- Marche rapide (30 min/jour)
- Yoga dynamique
- Interval training modéré

#### Pour Stress et Anxiété
- Yoga restauratif
- Méditation guidée
- Tai chi
- Respiration cohérente

#### Pour Gestion du Poids
- HIIT adapté (2x/semaine max)
- Natation
- Danse
- Circuit training doux

## Répartition des 40 Séances

### Distribution par Catégorie
- **Yoga** : 12 séances (30%)
  - 4 yoga doux règles
  - 4 yoga dynamique
  - 4 yoga restauratif

- **Cardio Léger** : 8 séances (20%)
  - 3 marche guidée
  - 3 danse douce
  - 2 cardio interval doux

- **Renforcement** : 8 séances (20%)
  - 4 full body débutant
  - 2 core adapté SOPK
  - 2 bas du corps

- **Mobilité** : 6 séances (15%)
  - 3 étirements matin
  - 3 mobilité articulaire

- **Relaxation** : 6 séances (15%)
  - 3 méditation guidée
  - 3 respiration thérapeutique

### Distribution par Durée
- 5-10 min : 8 séances (réveil, pause bureau)
- 15-20 min : 16 séances (routine quotidienne)
- 25-30 min : 12 séances (séance complète)
- 35-45 min : 4 séances (weekend, temps libre)

### Distribution par Difficulté
- Beginner : 12 séances (30%)
- Easy : 14 séances (35%)
- Medium : 12 séances (30%)
- Advanced : 2 séances (5%)

## Exemple de Ligne CSV Correcte

```csv
"Yoga Doux Soulagement Crampes Menstruelles","Séance de yoga thérapeutique spécialement conçue pour soulager les douleurs menstruelles et détendre le bas ventre. Mouvements lents et positions réconfortantes.","yoga",20,"beginner",1,"{stress_reduction,hormonal_balance,reduced_inflammation}","{period_pain,bloating,back_pain,stress}","{heavy_menstruation}","[{\"phase\":\"warmup\",\"exercises\":[{\"name\":\"Respiration abdominale profonde\",\"duration\":\"3 min\",\"description\":\"Allongée sur le dos, mains sur le ventre, inspirer en gonflant doucement le ventre, expirer en le relâchant\",\"repetitions\":\"15 cycles\"}],\"duration\":3},{\"phase\":\"main\",\"exercises\":[{\"name\":\"Posture de l'enfant\",\"duration\":\"3 min\",\"description\":\"Genoux écartés largeur du tapis, bras étendus devant, front au sol, respirer profondément dans le bas du dos\",\"repetitions\":\"Tenir 3 min\"},{\"name\":\"Torsion allongée douce\",\"duration\":\"4 min\",\"description\":\"Sur le dos, genoux pliés vers la poitrine, laisser tomber les genoux d'un côté, tenir 2 min par côté\",\"repetitions\":\"2 min par côté\"},{\"name\":\"Papillon allongé\",\"duration\":\"3 min\",\"description\":\"Sur le dos, plantes de pieds jointes, genoux ouverts, coussin sous chaque genou si besoin\",\"repetitions\":\"Tenir 3 min\"},{\"name\":\"Jambes au mur\",\"duration\":\"5 min\",\"description\":\"Allongée près d'un mur, jambes verticales contre le mur, bras relâchés\",\"repetitions\":\"Tenir 5 min\"}],\"duration\":15},{\"phase\":\"cooldown\",\"exercises\":[{\"name\":\"Savasana avec bouillotte\",\"duration\":\"2 min\",\"description\":\"Allongée sur le dos, bouillotte sur le bas ventre, relaxation complète\",\"repetitions\":\"2 min\"}],\"duration\":2}]","{mat,cushion,wall}",,"","{Utiliser plus de coussins pour le support,Réduire la durée des postures,Garder une couverture pour la chaleur}","{Tenir les postures plus longtemps,Ajouter des mouvements de transition fluides}"
```

## Structure Détaillée des Instructions (JSON)

Chaque séance doit avoir 3 phases obligatoires :

### 1. Warmup (Échauffement)
- Durée : 10-20% du temps total
- Exercices : Respiration, mobilisation douce
- Objectif : Préparer le corps en douceur

### 2. Main (Corps de séance)
- Durée : 70-80% du temps total
- Exercices : 3-6 exercices principaux
- Progression logique et adaptée

### 3. Cooldown (Retour au calme)
- Durée : 10-15% du temps total
- Exercices : Étirements, relaxation
- Objectif : Récupération, détente

### Format JSON des Exercices
```json
{
  "name": "Nom de l'exercice",
  "duration": "X min ou X sec",
  "description": "Instructions détaillées et claires",
  "repetitions": "X répétitions ou Tenir X min",
  "breathing": "Pattern respiratoire si important"
}
```

## Considérations Spéciales SOPK

### Exercices à Privilégier
1. **Yoga** : Toutes formes, surtout restauratif
2. **Pilates** : Renforce le core sans stress excessif
3. **Marche** : 30 min/jour idéal
4. **Natation** : Low impact, full body
5. **Musculation légère** : 2-3x/semaine
6. **Tai Chi/Qi Gong** : Équilibre hormonal

### Exercices à Adapter
1. **HIIT** : Maximum 2x/semaine, courtes sessions
2. **Course** : Privilégier intervals courts
3. **CrossFit** : Éviter ou adapter fortement
4. **Spinning intense** : Peut augmenter le cortisol

### Signaux d'Alerte (Stop)
- Fatigue excessive post-exercice
- Règles qui disparaissent
- Insomnie après séances
- Prise de poids malgré exercice
- Irritabilité accrue

## Instructions Finales

1. Génère EXACTEMENT 40 séances variées et progressives
2. Respecte STRICTEMENT le format CSV avec tous les champs
3. Assure une progression logique beginner → advanced
4. Chaque séance doit avoir un objectif SOPK clair
5. Varie les approches pour maintenir la motivation
6. Inclus des options pour différents moments de la journée
7. Adapte aux différentes phases du cycle menstruel
8. Propose des modifications pour jours difficiles

## Validation

Avant de finaliser, vérifie que :
- ✅ Intensité adaptée au SOPK (pas de surentraînement)
- ✅ Instructions claires et encourageantes
- ✅ Modifications pour tous niveaux
- ✅ JSON correctement formaté et échappé
- ✅ Arrays PostgreSQL au bon format
- ✅ Bénéfices SOPK clairement identifiés
- ✅ Contraindications appropriées listées
- ✅ Durées réalistes et variées

Commence maintenant par générer les 40 séances d'activité physique au format CSV exact demandé, en veillant à créer un programme complet et progressif adapté aux besoins spécifiques des femmes SOPK.