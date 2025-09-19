
// Options contrôlées pour les sélecteurs
export const CATEGORIES = [
    { value: 'breakfast', label: 'Petit-déjeuner', icon: '🌅' },
    { value: 'lunch', label: 'Déjeuner', icon: '🍽️' },
    { value: 'dinner', label: 'Dîner', icon: '🌙' },
    { value: 'snack', label: 'Collation', icon: '🥨' },
    { value: 'dessert', label: 'Dessert', icon: '🍰' }
  ] as const;
  
export const DIFFICULTIES = [
    { value: 'beginner', label: 'Débutant', icon: '🟢' },
    { value: 'easy', label: 'Facile', icon: '🟡' },
    { value: 'medium', label: 'Intermédiaire', icon: '🟠' },
    { value: 'advanced', label: 'Avancé', icon: '🔴' }
  ] as const;
  
export const GLYCEMIC_INDEX = [
    { value: 'low', label: 'Bas (IG < 55)', icon: '🟢' },
    { value: 'medium', label: 'Moyen (IG 55-69)', icon: '🟡' },
    { value: 'high', label: 'Élevé (IG > 70)', icon: '🔴' }
  ] as const;
  
export const INGREDIENT_CATEGORIES = [
    { value: 'protein', label: 'Protéines', icon: '🥩' },
    { value: 'vegetables', label: 'Légumes', icon: '🥕' },
    { value: 'grains', label: 'Céréales', icon: '🌾' },
    { value: 'dairy', label: 'Produits laitiers', icon: '🧀' },
    { value: 'fats', label: 'Matières grasses', icon: '🫒' },
    { value: 'spices', label: 'Épices', icon: '🌿' },
    { value: 'other', label: 'Autres', icon: '📦' }
  ] as const;
  
export const SOPK_BENEFITS = [
    'Régulation glycémique',
    'Amélioration sensibilité insuline',
    'Réduction inflammation',
    'Soutien hormonal',
    'Gestion du poids',
    'Amélioration digestive',
    'Boost d\'énergie',
    'Régulation cycles',
    'Réduction stress',
    'Amélioration humeur'
  ];
  
export const ALLERGENS = [
    'Gluten', 'Lactose', 'Fruits à coque', 'Soja', 'Œuf',
    'Poisson', 'Crustacés', 'Arachide', 'Sésame'
  ];
  
export const DIETARY_TAGS = [
    'Faible IG', 'Riche en fibres', 'Anti-inflammatoire',
    'Sans gluten', 'Sans lactose', 'Végétarien', 'Végétalien',
    'Low-carb', 'Riche en protéines', 'Cétogène'
  ];
  
export const SEASONS = ['Printemps', 'Été', 'Automne', 'Hiver', 'Toute saison'];
  
export const CYCLE_PHASES = [
    { value: 'menstruelle', label: 'Phase menstruelle', icon: '🌙', description: 'Jours 1-5 du cycle' },
    { value: 'folliculaire', label: 'Phase folliculaire', icon: '🌱', description: 'Jours 6-14 du cycle' },
    { value: 'ovulatoire', label: 'Phase ovulatoire', icon: '☀️', description: 'Jours 15-17 du cycle' },
    { value: 'luteale', label: 'Phase lutéale', icon: '🍂', description: 'Jours 18-28 du cycle' }
  ];
  
export const SYMPTOM_TARGETS = [
    'Douleurs menstruelles', 'Fatigue', 'Ballonnements', 'Acné',
    'Chute de cheveux', 'Résistance à l\'insuline', 'Inflammation',
    'Troubles du sommeil', 'Stress', 'Anxiété', 'Dépression',
    'Prise de poids', 'Fringales', 'Troubles digestifs'
  ];
  
export const MAIN_NUTRIENTS = [
    'Oméga-3', 'Vitamine D', 'Magnésium', 'Chrome', 'Zinc',
    'Vitamine B', 'Fer', 'Calcium', 'Fibres', 'Antioxydants',
    'Protéines', 'Inositol', 'Acide folique'
  ];
  
export const EQUIPMENT_LIST = [
    'Four', 'Poêle', 'Casserole', 'Mixeur', 'Blender', 'Robot culinaire',
    'Fouet', 'Râpe', 'Couteau', 'Planche à découper', 'Passoire',
    'Balance', 'Moule', 'Plat de cuisson', 'Autocuiseur', 'Wok'
  ];
  
export const UNITS = [
    { value: '', label: '(aucune)' },
    // Poids
    { value: 'g', label: 'grammes (g)' },
    { value: 'kg', label: 'kilogrammes (kg)' },
    // Volume liquide
    { value: 'ml', label: 'millilitres (ml)' },
    { value: 'cl', label: 'centilitres (cl)' },
    { value: 'l', label: 'litres (l)' },
    // Volume solide
    { value: 'c. à soupe', label: 'cuillères à soupe' },
    { value: 'c. à café', label: 'cuillères à café' },
    { value: 'tasse', label: 'tasses' },
    { value: 'verre', label: 'verres' },
    // Quantités
    { value: 'pièce(s)', label: 'pièce(s)' },
    { value: 'tranche(s)', label: 'tranche(s)' },
    { value: 'gousse(s)', label: 'gousse(s)' },
    { value: 'brin(s)', label: 'brin(s)' },
    { value: 'feuille(s)', label: 'feuille(s)' },
    { value: 'pincée(s)', label: 'pincée(s)' },
    { value: 'poignée(s)', label: 'poignée(s)' },
    // Contenants
    { value: 'boîte(s)', label: 'boîte(s)' },
    { value: 'sachet(s)', label: 'sachet(s)' },
    { value: 'pot(s)', label: 'pot(s)' }
  ];