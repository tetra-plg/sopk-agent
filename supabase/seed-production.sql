-- =====================================================
-- SEED DONNÉES DE PRODUCTION - SOPK Agent
-- ⚠️  UNIQUEMENT CONTENU MÉTIER POUR PRODUCTION
-- ⚠️  AUCUNE DONNÉE UTILISATEUR FAKE
-- =====================================================

-- =====================================================
-- 🍽️ SUGGESTIONS DE REPAS (PRODUCTION)
-- =====================================================

-- Étendre les suggestions de repas avec plus de variété
INSERT INTO meal_suggestions (
  name, category, difficulty, prep_time_minutes,
  glycemic_index_category, main_nutrients, estimated_calories,
  sopk_benefits, symptom_targets, cycle_phases,
  ingredients_simple, preparation_steps, tips,
  season, dietary_restrictions, mood_boosting
) VALUES
-- === PETITS DÉJEUNERS ===
(
  'Chia Pudding aux Fruits Rouges',
  'breakfast', 'very_easy', 5,
  'low', ARRAY['fiber', 'omega3', 'antioxidants'], 280,
  ARRAY['inflammation_reduction', 'sustained_energy'], ARRAY['fatigue', 'cravings'],
  ARRAY['any'],
  'Graines de chia (30g), lait d''amande (200ml), fruits rouges (100g), miel (1 c.à.s)',
  '1. Mélanger chia + lait, laisser gonfler 10min\n2. Ajouter fruits rouges\n3. Sucrer avec miel si besoin',
  'Prépare la veille pour un matin sans stress',
  ARRAY['spring', 'summer', 'autumn'], ARRAY['vegan', 'gluten_free'], true
),
(
  'Avocado Toast Protéiné',
  'breakfast', 'very_easy', 8,
  'low', ARRAY['healthy_fats', 'protein'], 320,
  ARRAY['hormone_balance', 'sustained_energy'], ARRAY['fatigue', 'mood_low'],
  ARRAY['any'],
  'Pain complet (2 tranches), avocat (1), œuf (1), graines de sésame, citron',
  '1. Griller le pain\n2. Écraser avocat avec citron\n3. Œuf poché + graines par dessus',
  'Parfait équilibre gras/protéines pour la matinée',
  ARRAY['spring', 'summer', 'autumn', 'winter'], ARRAY['vegetarian'], true
),

-- === DÉJEUNERS ===
(
  'Buddha Bowl Anti-inflammatoire',
  'lunch', 'easy', 25,
  'low', ARRAY['fiber', 'protein', 'antioxidants'], 420,
  ARRAY['inflammation_reduction', 'insulin_regulation'], ARRAY['period_pain', 'fatigue'],
  ARRAY['any'],
  'Quinoa (100g), patate douce (150g), pois chiches (100g), épinards, avocat, tahini',
  '1. Rôtir patate douce 20min\n2. Assembler quinoa + légumes\n3. Sauce tahini-citron',
  'Concentré de nutrients anti-SOPK',
  ARRAY['autumn', 'winter'], ARRAY['vegan', 'gluten_free'], false
),
(
  'Salade de Quinoa au Thon',
  'lunch', 'easy', 15,
  'low', ARRAY['protein', 'omega3'], 380,
  ARRAY['hormone_balance', 'muscle_support'], ARRAY['fatigue', 'brain_fog'],
  ARRAY['any'],
  'Quinoa cuit (120g), thon au naturel (100g), tomates, concombre, olives, basilic',
  '1. Mélanger quinoa refroidi + légumes\n2. Ajouter thon émietté\n3. Vinaigrette huile d''olive-citron',
  'Protéines complètes pour l''énergie durable',
  ARRAY['spring', 'summer'], ARRAY[], false
),

-- === DÎNERS ===
(
  'Curry de Lentilles Douces',
  'dinner', 'medium', 35,
  'low', ARRAY['protein', 'fiber'], 360,
  ARRAY['inflammation_reduction', 'digestive_support'], ARRAY['digestive_issues', 'mood_low'],
  ARRAY['any'],
  'Lentilles rouges (150g), lait de coco (200ml), épinards, gingembre, curcuma, tomates',
  '1. Faire revenir oignons + épices 3min\n2. Ajouter lentilles + tomates + lait coco\n3. Mijoter 25min, épinards en fin',
  'Anti-inflammatoire grâce au curcuma',
  ARRAY['autumn', 'winter'], ARRAY['vegan', 'gluten_free'], true
),
(
  'Saumon Teriyaki aux Légumes Vapeur',
  'dinner', 'medium', 30,
  'low', ARRAY['protein', 'omega3'], 400,
  ARRAY['hormone_balance', 'inflammation_reduction'], ARRAY['period_pain', 'anxiety'],
  ARRAY['any'],
  'Saumon (150g), brocolis, haricots verts, sauce soja, mirin, gingembre',
  '1. Mariner saumon 10min\n2. Cuire vapeur légumes 12min\n3. Griller saumon 6min/côté',
  'Oméga-3 essentiels pour l''équilibre hormonal',
  ARRAY['spring', 'summer', 'autumn', 'winter'], ARRAY[], true
),

-- === COLLATIONS ===
(
  'Energy Balls Coco-Amande',
  'snack', 'very_easy', 10,
  'low', ARRAY['healthy_fats', 'protein'], 150,
  ARRAY['sustained_energy'], ARRAY['cravings', 'afternoon_crash'],
  ARRAY['any'],
  'Amandes (50g), dattes (6), noix de coco râpée (20g), graines de chia (10g)',
  '1. Mixer amandes + dattes\n2. Ajouter coco + chia\n3. Former 8 boules, réfrigérer',
  'Prépare 8 boules, garde au frigo 1 semaine',
  ARRAY['spring', 'summer', 'autumn', 'winter'], ARRAY['vegan', 'gluten_free'], true
),
(
  'Houmous Maison aux Crudités',
  'snack', 'easy', 12,
  'low', ARRAY['protein', 'fiber'], 180,
  ARRAY['digestive_support', 'sustained_energy'], ARRAY['digestive_issues', 'cravings'],
  ARRAY['any'],
  'Pois chiches (200g), tahini (2 c.à.s), citron (1), ail (1 gousse), concombre, carottes',
  '1. Mixer pois chiches + tahini + citron\n2. Ajouter ail + eau si besoin\n3. Servir avec crudités',
  'Riche en fibres pour la satiété',
  ARRAY['spring', 'summer', 'autumn', 'winter'], ARRAY['vegan', 'gluten_free'], false
);

-- =====================================================
-- 🍳 RECETTES DÉTAILLÉES (MODE CUISINE)
-- =====================================================

INSERT INTO recipes (
  title, description, category,
  prep_time_minutes, cook_time_minutes, servings, difficulty,
  glycemic_index_category, nutritional_info, sopk_benefits,
  ingredients, instructions, equipment_needed,
  season, dietary_tags
) VALUES
-- === RECETTE COMPLÈTE 1 ===
(
  'Curry de Pois Chiches au Lait de Coco',
  'Curry crémeux et réconfortant, riche en protéines végétales et épices anti-inflammatoires. Parfait pour apaiser les symptômes du SOPK.',
  'dinner',
  15, 30, 4, 'easy',
  'low',
  '{"calories": 380, "protein": 18, "carbs": 45, "fat": 15, "fiber": 12}',
  ARRAY['inflammation_reduction', 'insulin_regulation', 'digestive_support'],
  '[
    {"name": "pois chiches", "quantity": "400g", "category": "légumineuses", "note": "1 boîte, égouttés et rincés"},
    {"name": "lait de coco", "quantity": "400ml", "category": "liquides", "note": "1 boîte, partie épaisse"},
    {"name": "oignon", "quantity": "1 moyen", "category": "légumes", "note": "émincé finement"},
    {"name": "ail", "quantity": "3 gousses", "category": "aromates", "note": "hachées"},
    {"name": "gingembre frais", "quantity": "2cm", "category": "aromates", "note": "râpé"},
    {"name": "curcuma en poudre", "quantity": "1 c.à.s", "category": "épices", "note": ""},
    {"name": "garam masala", "quantity": "1 c.à.c", "category": "épices", "note": "ou curry en poudre"},
    {"name": "tomates concassées", "quantity": "200g", "category": "légumes", "note": "1/2 boîte"},
    {"name": "épinards frais", "quantity": "100g", "category": "légumes", "note": "lavés"},
    {"name": "huile de coco", "quantity": "1 c.à.s", "category": "matières grasses", "note": ""},
    {"name": "sel et poivre", "quantity": "selon goût", "category": "assaisonnement", "note": ""}
  ]',
  '[
    {"step": 1, "instruction": "Faire chauffer l''huile de coco dans une grande casserole à feu moyen.", "duration_minutes": 2, "tips": "L''huile doit être chaude mais ne pas fumer."},
    {"step": 2, "instruction": "Ajouter l''oignon émincé et faire revenir 3-4 minutes jusqu''à transparence.", "duration_minutes": 4, "tips": "L''oignon doit être doré mais pas brûlé."},
    {"step": 3, "instruction": "Incorporer l''ail, le gingembre, le curcuma et le garam masala. Mélanger 1 minute.", "duration_minutes": 1, "tips": "Les épices doivent embaumer, attention à ne pas les brûler."},
    {"step": 4, "instruction": "Ajouter les tomates concassées et laisser mijoter 5 minutes.", "duration_minutes": 5, "tips": "La préparation doit épaissir légèrement."},
    {"step": 5, "instruction": "Incorporer les pois chiches et le lait de coco. Porter à ébullition puis réduire le feu.", "duration_minutes": 3, "tips": "Bien mélanger pour enrober les pois chiches."},
    {"step": 6, "instruction": "Laisser mijoter à feu doux 15-20 minutes en remuant occasionnellement.", "duration_minutes": 18, "tips": "Le curry doit épaissir et les saveurs se développer."},
    {"step": 7, "instruction": "Ajouter les épinards et cuire 2-3 minutes jusqu''à ce qu''ils flètrissent.", "duration_minutes": 3, "tips": "Ne pas trop cuire les épinards pour préserver les nutriments."},
    {"step": 8, "instruction": "Assaisonner avec sel et poivre. Servir chaud avec du riz basmati ou du quinoa.", "duration_minutes": 1, "tips": "Goûter avant d''assaisonner, le curry peut déjà être assez salé."}
  ]',
  ARRAY['casserole moyenne', 'cuillère en bois', 'planche à découper', 'couteau'],
  ARRAY['autumn', 'winter'],
  ARRAY['vegan', 'gluten_free']
),

-- === RECETTE COMPLÈTE 2 ===
(
  'Bowl de Quinoa Roasted Vegetables',
  'Bowl nutritif avec légumes rôtis et quinoa, source complète de protéines. Idéal pour réguler la glycémie.',
  'lunch',
  20, 25, 2, 'easy',
  'low',
  '{"calories": 420, "protein": 16, "carbs": 58, "fat": 14, "fiber": 10}',
  ARRAY['insulin_regulation', 'sustained_energy', 'antioxidant_boost'],
  '[
    {"name": "quinoa", "quantity": "150g", "category": "céréales", "note": "rincé à l''eau froide"},
    {"name": "patate douce", "quantity": "1 moyenne", "category": "légumes", "note": "coupée en cubes"},
    {"name": "courgette", "quantity": "1 petite", "category": "légumes", "note": "coupée en demi-lunes"},
    {"name": "poivron rouge", "quantity": "1/2", "category": "légumes", "note": "coupé en lamelles"},
    {"name": "brocoli", "quantity": "200g", "category": "légumes", "note": "en petits bouquets"},
    {"name": "avocat", "quantity": "1/2", "category": "fruits", "note": "mûr, en lamelles"},
    {"name": "graines de tournesol", "quantity": "2 c.à.s", "category": "graines", "note": ""},
    {"name": "huile d''olive", "quantity": "3 c.à.s", "category": "matières grasses", "note": "extra vierge"},
    {"name": "citron", "quantity": "1/2", "category": "fruits", "note": "jus et zeste"},
    {"name": "herbes de Provence", "quantity": "1 c.à.c", "category": "épices", "note": ""},
    {"name": "sel et poivre noir", "quantity": "selon goût", "category": "assaisonnement", "note": ""}
  ]',
  '[
    {"step": 1, "instruction": "Préchauffer le four à 200°C. Rincer le quinoa à l''eau froide.", "duration_minutes": 2, "tips": "Bien rincer le quinoa pour éliminer l''amertume."},
    {"step": 2, "instruction": "Couper tous les légumes en morceaux de taille similaire (2cm environ).", "duration_minutes": 8, "tips": "Des morceaux réguliers cuisent uniformément."},
    {"step": 3, "instruction": "Disposer les légumes sur une plaque, arroser avec 2 c.à.s d''huile d''olive et les herbes.", "duration_minutes": 2, "tips": "Bien mélanger pour enrober uniformément."},
    {"step": 4, "instruction": "Enfourner 20-25 minutes jusqu''à ce que les légumes soient dorés et tendres.", "duration_minutes": 23, "tips": "Retourner à mi-cuisson pour une coloration uniforme."},
    {"step": 5, "instruction": "Pendant ce temps, cuire le quinoa : 1 volume de quinoa pour 2 volumes d''eau bouillante salée, 15 min.", "duration_minutes": 15, "tips": "Couvrir et laisser gonfler 5min hors du feu."},
    {"step": 6, "instruction": "Préparer la vinaigrette : mélanger le jus de citron, 1 c.à.s d''huile, sel et poivre.", "duration_minutes": 2, "tips": "Goûter et ajuster l''assaisonnement."},
    {"step": 7, "instruction": "Assembler les bowls : quinoa au fond, légumes rôtis, avocat, graines de tournesol.", "duration_minutes": 3, "tips": "Présenter de manière colorée et appétissante."},
    {"step": 8, "instruction": "Arroser de vinaigrette au citron et servir immédiatement.", "duration_minutes": 1, "tips": "Mélanger juste avant de déguster."}
  ]',
  ARRAY['four', 'plaque de cuisson', 'casserole moyenne', 'passoire', 'saladier'],
  ARRAY['spring', 'summer', 'autumn'],
  ARRAY['vegan', 'gluten_free']
);

-- =====================================================
-- 🏃 SÉANCES D'ACTIVITÉ COMPLÈTES
-- =====================================================

INSERT INTO activity_sessions_complete (
  title, description, category,
  duration_minutes, difficulty, intensity_level,
  sopk_benefits, symptom_targets, contraindications,
  instructions, equipment_needed,
  easy_modifications, advanced_variations
) VALUES
-- === YOGA DOUX ===
(
  'Yoga Flow Hormonal Balance',
  'Séquence de yoga spécialement conçue pour stimuler le système endocrinien et équilibrer les hormones. Postures douces avec focus sur la respiration.',
  'yoga',
  20, 'beginner', 2,
  ARRAY['hormonal_balance', 'stress_reduction', 'improved_circulation'],
  ARRAY['irregular_cycles', 'mood_swings', 'anxiety', 'fatigue'],
  ARRAY['acute_back_pain', 'first_trimester_pregnancy'],
  '[
    {
      "phase": "Centrage",
      "duration": 3,
      "exercises": [
        {"name": "Position assise en tailleur", "duration": "2 min", "instruction": "Fermer les yeux, respirer profondément, connecter avec son corps"},
        {"name": "Intention setting", "duration": "1 min", "instruction": "Définir une intention positive pour la pratique"}
      ]
    },
    {
      "phase": "Échauffement",
      "duration": 5,
      "exercises": [
        {"name": "Rotations du cou", "duration": "1 min", "instruction": "5 rotations dans chaque sens, très lentement"},
        {"name": "Rotations des épaules", "duration": "1 min", "instruction": "Libérer les tensions accumulées"},
        {"name": "Chat-Vache", "duration": "3 min", "instruction": "10 répétitions lentes, synchroniser avec la respiration"}
      ]
    },
    {
      "phase": "Séquence principale",
      "duration": 10,
      "exercises": [
        {"name": "Posture de l''enfant", "duration": "2 min", "instruction": "Relâcher complètement, respirer dans le bas du dos"},
        {"name": "Cobra doux", "duration": "2 min", "instruction": "3 fois 30 sec, ouvrir le coeur et stimuler les surrénales"},
        {"name": "Torsion assise", "duration": "3 min", "instruction": "1m30 de chaque côté, masser les organes internes"},
        {"name": "Posture des jambes au mur", "duration": "3 min", "instruction": "Favoriser la circulation et calmer le système nerveux"}
      ]
    },
    {
      "phase": "Relaxation",
      "duration": 2,
      "exercises": [
        {"name": "Savasana", "duration": "2 min", "instruction": "Relaxation complète, scanner le corps de la tête aux pieds"}
      ]
    }
  ]',
  ARRAY['tapis de yoga', 'coussin optionnel', 'couverture'],
  ARRAY[
    'Rester en posture de l''enfant plus longtemps si fatiguée',
    'Utiliser des coussins pour plus de confort',
    'Réduire l''intensité des postures'
  ],
  ARRAY[
    'Maintenir les postures plus longtemps',
    'Ajouter des variations de torsions',
    'Enchaîner avec 10 min de méditation'
  ]
),

-- === CARDIO LÉGER ===
(
  'Marche Active Métabolique',
  'Programme de marche structuré pour stimuler le métabolisme sans épuiser. Idéal pour la régulation de l''insuline.',
  'cardio_light',
  25, 'easy', 3,
  ARRAY['insulin_regulation', 'improved_circulation', 'mood_boost'],
  ARRAY['insulin_resistance', 'weight_management', 'low_energy'],
  ARRAY['acute_joint_pain', 'severe_fatigue'],
  '[
    {
      "phase": "Échauffement",
      "duration": 5,
      "exercises": [
        {"name": "Marche lente", "duration": "3 min", "instruction": "Rythme conversationnel, concentrer sur la posture"},
        {"name": "Mobilisation articulaire", "duration": "2 min", "instruction": "Mouvements des bras et rotations des chevilles en marchant"}
      ]
    },
    {
      "phase": "Phase active",
      "duration": 15,
      "exercises": [
        {"name": "Intervalle modéré", "duration": "3 min", "instruction": "Accélérer le rythme, respiration un peu plus rapide"},
        {"name": "Récupération active", "duration": "2 min", "instruction": "Ralentir sans s''arrêter"},
        {"name": "Répéter le cycle", "duration": "10 min", "instruction": "Alterner 3 min rapide / 2 min récup, 2 fois"}
      ]
    },
    {
      "phase": "Retour au calme",
      "duration": 5,
      "exercises": [
        {"name": "Marche décélération", "duration": "3 min", "instruction": "Réduire progressivement le rythme"},
        {"name": "Étirements debout", "duration": "2 min", "instruction": "Mollets, quadriceps, ouverture de poitrine"}
      ]
    }
  ]',
  ARRAY['chaussures de sport', 'vêtements confortables', 'bouteille d''eau'],
  ARRAY[
    'Réduire les phases actives à 2 minutes',
    'Augmenter les temps de récupération',
    'Marcher sur terrain plat uniquement'
  ],
  ARRAY[
    'Ajouter des côtes légères',
    'Intégrer des pas chassés latéraux',
    'Prolonger la phase active à 20 minutes'
  ]
),

-- === RENFORCEMENT ===
(
  'Core Stability SOPK-Friendly',
  'Renforcement en douceur du centre du corps, adapté aux femmes avec SOPK. Focus sur la stabilité sans stress excessif.',
  'strength',
  15, 'easy', 2,
  ARRAY['core_strength', 'improved_posture', 'back_support'],
  ARRAY['back_pain', 'poor_posture', 'core_weakness'],
  ARRAY['diastasis_recti', 'acute_back_pain', 'pelvic_floor_issues'],
  '[
    {
      "phase": "Activation",
      "duration": 3,
      "exercises": [
        {"name": "Respiration diaphragmatique", "duration": "2 min", "instruction": "Allongée, main sur ventre, respirer profondément"},
        {"name": "Activation transverse", "duration": "1 min", "instruction": "Contracter en douceur les abdominaux profonds"}
      ]
    },
    {
      "phase": "Exercices principaux",
      "duration": 10,
      "exercises": [
        {"name": "Dead bug", "duration": "3 min", "instruction": "10 reps par côté, maintenir 5 sec, dos bien plaqué"},
        {"name": "Bird dog", "duration": "3 min", "instruction": "8 reps par côté, gainage et équilibre"},
        {"name": "Planche modifiée", "duration": "2 min", "instruction": "Sur genoux, 3 fois 20 sec, progression douce"},
        {"name": "Pont fessier", "duration": "2 min", "instruction": "12 reps lentes, serrer fessiers en haut"}
      ]
    },
    {
      "phase": "Étirements",
      "duration": 2,
      "exercises": [
        {"name": "Posture de l''enfant", "duration": "1 min", "instruction": "Relâcher le dos après l''effort"},
        {"name": "Étirement chat", "duration": "1 min", "instruction": "Mobiliser la colonne en douceur"}
      ]
    }
  ]',
  ARRAY['tapis', 'coussin pour les genoux'],
  ARRAY[
    'Réduire les répétitions de moitié',
    'Pauses plus longues entre exercices',
    'Planche sur genoux uniquement'
  ],
  ARRAY[
    'Planche complète sur pieds',
    'Ajouter variations single-arm/leg',
    'Augmenter temps de maintien'
  ]
);

-- =====================================================
-- 📝 COMMENTAIRES ET MÉTADONNÉES
-- =====================================================

-- Commentaires pour clarifier l'usage
COMMENT ON TABLE meal_suggestions IS 'Suggestions de repas validées nutritionnellement pour SOPK - PRODUCTION READY';
COMMENT ON TABLE recipes IS 'Recettes détaillées avec mode cuisine guidé - CONTENU MÉTIER UNIQUEMENT';
COMMENT ON TABLE activity_sessions_complete IS 'Séances d''activité complètes adaptées SOPK - PRODUCTION READY';

-- Message de fin
DO $$
BEGIN
  RAISE NOTICE '=== SEED PRODUCTION COMPLETÉ ===';
  RAISE NOTICE 'Contenu métier ajouté:';
  RAISE NOTICE '- Suggestions de repas étendues';
  RAISE NOTICE '- 2 recettes complètes avec instructions détaillées';
  RAISE NOTICE '- 3 séances d''activité complètes';
  RAISE NOTICE '- AUCUNE DONNÉE UTILISATEUR';
  RAISE NOTICE '====================================';
END $$;