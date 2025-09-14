-- Seed data pour tester les fonctionnalités de l'application SOPK
-- Créé le 13 décembre 2024

-- Données de test pour les sessions d'activité physique
INSERT INTO activity_sessions (
  title,
  description,
  category,
  difficulty_level,
  duration_minutes,
  instructions,
  sopk_symptoms,
  benefits,
  equipment_needed,
  is_active
) VALUES
-- Yoga doux
(
  'Yoga Anti-Stress SOPK',
  'Séance de yoga doux spécialement conçue pour réduire le stress et l''anxiété liés au SOPK.',
  'yoga_doux',
  1,
  15,
  '[
    {"title": "Préparation", "description": "Installe-toi confortablement sur ton tapis. Prends 3 respirations profondes.", "duration": "2 min"},
    {"title": "Échauffement", "description": "Mouvements doux du cou et des épaules pour relâcher les tensions.", "duration": "3 min"},
    {"title": "Postures apaisantes", "description": "Enchaînement de postures douces : chat-vache, enfant, torsion assise.", "duration": "8 min"},
    {"title": "Relaxation", "description": "Savasana avec respiration consciente pour terminer en douceur.", "duration": "2 min"}
  ]',
  ARRAY['stress', 'troubles_sommeil', 'fatigue'],
  ARRAY['réduit_cortisol', 'améliore_sommeil', 'détend_muscles'],
  ARRAY['tapis', 'coussin'],
  true
),

(
  'Étirements Matinaux',
  'Routine douce d''étirements pour bien commencer la journée et activer la circulation.',
  'etirements',
  1,
  8,
  '[
    {"title": "Réveil en douceur", "description": "Étirements au lit : jambes, bras, colonne vertébrale.", "duration": "2 min"},
    {"title": "Activation", "description": "Lever et étirements debout : nuque, épaules, hanches.", "duration": "3 min"},
    {"title": "Mobilité", "description": "Rotations articulaires et flexions pour assouplir le corps.", "duration": "3 min"}
  ]',
  ARRAY['raideurs_matinales', 'fatigue', 'douleurs_articulaires'],
  ARRAY['améliore_mobilité', 'boost_énergie', 'prépare_journée'],
  ARRAY['aucun'],
  true
),

-- Cardio léger
(
  'Marche Énergisante',
  'Marche guidée à rythme modéré pour stimuler le métabolisme sans épuiser.',
  'cardio_leger',
  2,
  20,
  '[
    {"title": "Échauffement", "description": "Marche lente avec mouvements des bras pour préparer le corps.", "duration": "3 min"},
    {"title": "Rythme modéré", "description": "Accélère progressivement jusqu''à un rythme confortable mais soutenu.", "duration": "12 min"},
    {"title": "Retour au calme", "description": "Ralentis graduellement avec étirements légers.", "duration": "5 min"}
  ]',
  ARRAY['résistance_insuline', 'prise_poids', 'fatigue'],
  ARRAY['améliore_circulation', 'stimule_métabolisme', 'régule_glycémie'],
  ARRAY['chaussures_sport'],
  true
),

-- Renforcement
(
  'Renforcement Core SOPK',
  'Exercices de renforcement du centre du corps adaptés pour les femmes avec SOPK.',
  'renforcement',
  2,
  12,
  '[
    {"title": "Préparation", "description": "Échauffement avec mobilisation du bassin et de la colonne.", "duration": "2 min"},
    {"title": "Core stability", "description": "Planche modifiée, dead bug, bird dog - 30sec chaque.", "duration": "6 min"},
    {"title": "Renforcement doux", "description": "Squats assistés, ponts fessiers, gainage latéral.", "duration": "4 min"}
  ]',
  ARRAY['douleurs_dos', 'faiblesse_abdominale'],
  ARRAY['renforce_core', 'améliore_posture', 'soutient_dos'],
  ARRAY['tapis'],
  true
),

(
  'Yoga du Soir',
  'Séance relaxante de yoga pour préparer le corps et l''esprit au sommeil.',
  'yoga_doux',
  1,
  12,
  '[
    {"title": "Transition", "description": "Assis en tailleur, quelques respirations pour faire la transition.", "duration": "2 min"},
    {"title": "Postures apaisantes", "description": "Torsion douce, posture de l''enfant, jambes au mur.", "duration": "8 min"},
    {"title": "Méditation", "description": "Relaxation guidée avec focus sur le relâchement musculaire.", "duration": "2 min"}
  ]',
  ARRAY['troubles_sommeil', 'stress', 'tensions'],
  ARRAY['améliore_sommeil', 'réduit_stress', 'détend_système_nerveux'],
  ARRAY['tapis', 'coussin', 'couverture'],
  true
),

(
  'Mobilité Bassin',
  'Exercices spécifiques pour améliorer la mobilité du bassin et soulager les tensions.',
  'etirements',
  1,
  10,
  '[
    {"title": "Échauffement", "description": "Rotations douces du bassin en position debout.", "duration": "2 min"},
    {"title": "Étirements ciblés", "description": "Fente basse, papillon, figure 4 pour ouvrir les hanches.", "duration": "6 min"},
    {"title": "Relaxation", "description": "Position de repos avec respiration profonde.", "duration": "2 min"}
  ]',
  ARRAY['douleurs_pelviennes', 'règles_douloureuses', 'tensions_hanches'],
  ARRAY['soulage_douleurs', 'améliore_mobilité', 'détend_bassin'],
  ARRAY['tapis'],
  true
);

-- Commentaire sur les données de test
COMMENT ON TABLE activity_sessions IS 'Table contenant les sessions d''activité physique disponibles avec données de test';