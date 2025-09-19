/**
 * 📝 Formulaire d'ajout de recette - AddRecipeView
 *
 * Composant pour créer manuellement des recettes adaptées aux besoins SOPK
 * Basé sur le formulaire form.tsx mais intégré dans l'app
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/AuthContext';
import type { Recipe, RecipeIngredient, RecipeInstruction } from '../../../types/database';
import recipeService from '../services/recipeService';
import { ALLERGENS, CATEGORIES, CYCLE_PHASES, DIETARY_TAGS, DIFFICULTIES, EQUIPMENT_LIST, GLYCEMIC_INDEX, INGREDIENT_CATEGORIES, MAIN_NUTRIENTS, SEASONS, SOPK_BENEFITS, SYMPTOM_TARGETS, UNITS } from '../types/constants';

// Types pour le formulaire
interface RecipeFormData extends Omit<Recipe, 'id' | 'created_at' | 'total_time_minutes'> {
  id?: string;
  total_time_minutes?: number;
}

interface AddRecipeViewProps {
  onBack: () => void;
  onRecipeAdded?: (_recipe: Recipe) => void;
}

const AddRecipeView = ({ onBack, onRecipeAdded }: AddRecipeViewProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // État initial du formulaire
  const [recipe, setRecipe] = useState<RecipeFormData>({
    title: '',
    description: '',
    category: 'lunch',
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    servings: 1,
    difficulty: 'easy',
    glycemic_index_category: 'low',
    nutritional_info: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    sopk_benefits: [],
    allergen_info: [],
    ingredients: [],
    instructions: [],
    equipment_needed: [],
    variations: [],
    storage_tips: '',
    season: [],
    dietary_tags: [],
    cycle_phases: [],
    symptom_targets: [],
    main_nutrients: [],
    mood_boosting: false,
    tips: ''
  });

  // Calculer automatiquement le temps total
  useEffect(() => {
    setRecipe(prev => ({
      ...prev,
      total_time_minutes: prev.prep_time_minutes + prev.cook_time_minutes
    }));
  }, [recipe.prep_time_minutes, recipe.cook_time_minutes]);

  // Gestionnaires pour les ingrédients
  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        name: '',
        quantity: '',
        unit: '',
        category: 'other',
        optional: false,
        substitutions: []
      }]
    }));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | boolean) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // Gestionnaires pour les instructions
  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, {
        step: prev.instructions.length + 1,
        instruction: '',
        duration_minutes: undefined,
        tips: '',
        temperature: '',
        equipment: []
      }]
    }));
  };

  const updateInstruction = (index: number, field: keyof RecipeInstruction, value: string | number | string[]) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, [field]: value } : inst
      )
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }))
    }));
  };

  // Gestionnaires pour les variations
  const addVariation = () => {
    setRecipe(prev => ({
      ...prev,
      variations: [
        ...(prev.variations || []),
        {
          name: '',
          description: '',
          modifications: {
            ingredient_changes: [],
            instruction_changes: [],
            time_adjustment: 0
          }
        }
      ]
    }));
  };

  const updateVariation = (index: number, field: string, value: string) => {
    setRecipe(prev => ({
      ...prev,
      variations: (prev.variations || []).map((variation, i) =>
        i === index ? { ...variation, [field]: value } : variation
      )
    }));
  };

  const removeVariation = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      variations: (prev.variations || []).filter((_, i) => i !== index)
    }));
  };

  // Validation du formulaire
  const validateRecipe = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!recipe.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!recipe.description || !recipe.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (recipe.ingredients.length === 0) {
      newErrors.ingredients = 'Au moins un ingrédient est requis';
    }

    if (recipe.instructions.length === 0) {
      newErrors.instructions = 'Au moins une instruction est requise';
    }

    if (recipe.prep_time_minutes <= 0 && recipe.cook_time_minutes <= 0) {
      newErrors.time = 'Le temps de préparation ou de cuisson doit être supérieur à 0';
    }

    if (recipe.servings <= 0) {
      newErrors.servings = 'Le nombre de portions doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sauvegarde de la recette
  const handleSave = async () => {
    if (!validateRecipe()) {
      return;
    }

    if (!user?.id) {
      setErrors({ general: 'Vous devez être connecté pour ajouter une recette' });
      return;
    }

    setLoading(true);
    try {
      // Préparer les données pour l'API
      const recipeData: Omit<Recipe, 'id' | 'created_at'> = {
        ...recipe,
        total_time_minutes: recipe.prep_time_minutes + recipe.cook_time_minutes
      };

      const result = await recipeService.createRecipe(recipeData);

      if (result.success && result.data) {
        onRecipeAdded?.(result.data);
        onBack();
      } else {
        setErrors({ general: result.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ general: 'Erreur inattendue lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white rounded-xl transition-colors"
              style={{ color: 'var(--color-primary-bleu-ciel)' }}
            >
              ← Retour
            </button>
            <h1 className="text-lg lg:text-3xl font-bold mb-1 lg:mb-2" style={{ color: 'var(--color-text-principal)' }}>
              📝 Ajouter une recette
            </h1>
          </div>
        </div>

        {/* Messages d'erreur globaux */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{errors.general}</p>
          </div>
        )}

        {/* Informations de base */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-principal)' }}>
            Informations de base
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Titre de la recette *
              </label>
              <input
                type="text"
                value={recipe.title}
                onChange={e => setRecipe(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Saumon grillé au quinoa et légumes"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Description *
              </label>
              <textarea
                value={recipe.description || ''}
                onChange={e => setRecipe(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Courte description de la recette et de ses bénéfices..."
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Catégorie
              </label>
              <select
                value={recipe.category}
                onChange={e => setRecipe(prev => ({ ...prev, category: e.target.value as Recipe['category'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Difficulté
              </label>
              <select
                value={recipe.difficulty}
                onChange={e => setRecipe(prev => ({ ...prev, difficulty: e.target.value as Recipe['difficulty'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.icon} {diff.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Index glycémique
              </label>
              <select
                value={recipe.glycemic_index_category || ''}
                onChange={e => setRecipe(prev => ({
                  ...prev,
                  glycemic_index_category: e.target.value ? e.target.value as Recipe['glycemic_index_category'] : null
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Non spécifié</option>
                {GLYCEMIC_INDEX.map(gi => (
                  <option key={gi.value} value={gi.value}>
                    {gi.icon} {gi.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Portions
              </label>
              <input
                type="number"
                min="1"
                value={recipe.servings}
                onChange={e => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                className={`w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.servings ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.servings && <p className="text-red-600 text-sm mt-1">{errors.servings}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Temps de préparation (min)
              </label>
              <input
                type="number"
                min="0"
                value={recipe.prep_time_minutes}
                onChange={e => setRecipe(prev => ({ ...prev, prep_time_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-principal)' }}>
                Temps de cuisson (min)
              </label>
              <input
                type="number"
                min="0"
                value={recipe.cook_time_minutes}
                onChange={e => setRecipe(prev => ({ ...prev, cook_time_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errors.time && (
              <div className="md:col-span-2">
                <p className="text-red-600 text-sm">{errors.time}</p>
              </div>
            )}
          </div>
        </section>

        {/* Ingrédients */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-principal)' }}>
              Ingrédients *
            </h2>
            <button
              onClick={addIngredient}
              className="px-4 py-2 rounded-xl text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary-bleu-ciel)' }}
            >
              + Ajouter un ingrédient
            </button>
          </div>

          {errors.ingredients && (
            <p className="text-red-600 text-sm mb-4">{errors.ingredients}</p>
          )}

          <div className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="text"
                  placeholder="Nom de l'ingrédient"
                  value={ingredient.name}
                  onChange={e => updateIngredient(index, 'name', e.target.value)}
                  className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Quantité"
                  value={ingredient.quantity}
                  onChange={e => updateIngredient(index, 'quantity', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={ingredient.unit || ''}
                  onChange={e => updateIngredient(index, 'unit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                <select
                  value={ingredient.category || 'other'}
                  onChange={e => updateIngredient(index, 'category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INGREDIENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeIngredient(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-principal)' }}>
              Instructions *
            </h2>
            <button
              onClick={addInstruction}
              className="px-4 py-2 rounded-xl text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary-bleu-ciel)' }}
            >
              + Ajouter une étape
            </button>
          </div>

          {errors.instructions && (
            <p className="text-red-600 text-sm mb-4">{errors.instructions}</p>
          )}

          <div className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center bg-blue-100 rounded-xl w-10 h-10 font-bold text-blue-700">
                  {instruction.step}
                </div>
                <textarea
                  placeholder="Décrivez l'étape..."
                  value={instruction.instruction}
                  onChange={e => updateInstruction(index, 'instruction', e.target.value)}
                  className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
                <button
                  onClick={() => removeInstruction(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors h-fit"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Informations nutritionnelles (optionnel) */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-principal)' }}>
            Informations nutritionnelles (optionnel)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Calories</label>
              <input
                type="number"
                min="0"
                value={recipe.nutritional_info?.calories || 0}
                onChange={e => setRecipe(prev => ({
                  ...prev,
                  nutritional_info: {
                    calories: parseInt(e.target.value) || 0,
                    protein: prev.nutritional_info?.protein || 0,
                    carbs: prev.nutritional_info?.carbs || 0,
                    fat: prev.nutritional_info?.fat || 0,
                    fiber: prev.nutritional_info?.fiber || 0
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Protéines (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={recipe.nutritional_info?.protein || 0}
                onChange={e => setRecipe(prev => ({
                  ...prev,
                  nutritional_info: {
                    calories: prev.nutritional_info?.calories || 0,
                    protein: parseFloat(e.target.value) || 0,
                    carbs: prev.nutritional_info?.carbs || 0,
                    fat: prev.nutritional_info?.fat || 0,
                    fiber: prev.nutritional_info?.fiber || 0
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Glucides (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={recipe.nutritional_info?.carbs || 0}
                onChange={e => setRecipe(prev => ({
                  ...prev,
                  nutritional_info: {
                    calories: prev.nutritional_info?.calories || 0,
                    protein: prev.nutritional_info?.protein || 0,
                    carbs: parseFloat(e.target.value) || 0,
                    fat: prev.nutritional_info?.fat || 0,
                    fiber: prev.nutritional_info?.fiber || 0
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lipides (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={recipe.nutritional_info?.fat || 0}
                onChange={e => setRecipe(prev => ({
                  ...prev,
                  nutritional_info: {
                    calories: prev.nutritional_info?.calories || 0,
                    protein: prev.nutritional_info?.protein || 0,
                    carbs: prev.nutritional_info?.carbs || 0,
                    fat: parseFloat(e.target.value) || 0,
                    fiber: prev.nutritional_info?.fiber || 0
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fibres (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={recipe.nutritional_info?.fiber || 0}
                onChange={e => setRecipe(prev => ({
                  ...prev,
                  nutritional_info: {
                    calories: prev.nutritional_info?.calories || 0,
                    protein: prev.nutritional_info?.protein || 0,
                    carbs: prev.nutritional_info?.carbs || 0,
                    fat: prev.nutritional_info?.fat || 0,
                    fiber: parseFloat(e.target.value) || 0
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Tags et bénéfices */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-principal)' }}>
            Tags et bénéfices
          </h2>

          <div className="space-y-6">
            {/* Bénéfices SOPK */}
            <div>
              <label className="block text-sm font-medium mb-2">Bénéfices SOPK</label>
              <div className="flex flex-wrap gap-2">
                {SOPK_BENEFITS.map(benefit => {
                  const isSelected = recipe.sopk_benefits.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          sopk_benefits: isSelected
                            ? prev.sopk_benefits.filter(b => b !== benefit)
                            : [...prev.sopk_benefits, benefit]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {benefit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergènes */}
            <div>
              <label className="block text-sm font-medium mb-2">Informations allergènes</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map(allergen => {
                  const isSelected = recipe.allergen_info.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          allergen_info: isSelected
                            ? prev.allergen_info.filter(a => a !== allergen)
                            : [...prev.allergen_info, allergen]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isSelected
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags diététiques */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags diététiques</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_TAGS.map(tag => {
                  const isSelected = recipe.dietary_tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          dietary_tags: isSelected
                            ? prev.dietary_tags.filter(t => t !== tag)
                            : [...prev.dietary_tags, tag]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Saisons */}
            <div>
              <label className="block text-sm font-medium mb-2">Saisons</label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map(season => {
                  const isSelected = recipe.season.includes(season);
                  return (
                    <button
                      key={season}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          season: isSelected
                            ? prev.season.filter(s => s !== season)
                            : [...prev.season, season]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isSelected
                          ? 'bg-yellow-600 text-white border-yellow-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {season}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phases du cycle SOPK */}
            <div>
              <label className="block text-sm font-medium mb-2">Phases du cycle recommandées</label>
              <p className="text-xs text-gray-600 mb-2">Sélectionnez les phases du cycle où cette recette est particulièrement bénéfique</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CYCLE_PHASES.map(phase => {
                  const isSelected = recipe.cycle_phases?.includes(phase.value);
                  return (
                    <button
                      key={phase.value}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          cycle_phases: isSelected
                            ? (prev.cycle_phases || []).filter(p => p !== phase.value)
                            : [...(prev.cycle_phases || []), phase.value]
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-pink-100 border-pink-400 shadow-sm'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{phase.icon}</span>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                            {phase.label}
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-pink-600' : 'text-gray-500'}`}>
                            {phase.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section complémentaire */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-principal)' }}>
            Informations complémentaires
          </h2>

          <div className="space-y-6">
            {/* Symptômes ciblés */}
            <div>
              <label className="block text-sm font-medium mb-2">Symptômes ciblés</label>
              <p className="text-xs text-gray-600 mb-2">Sélectionnez les symptômes SOPK que cette recette peut aider à soulager</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_TARGETS.map(symptom => {
                  const isSelected = recipe.symptom_targets?.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          symptom_targets: isSelected
                            ? (prev.symptom_targets || []).filter(s => s !== symptom)
                            : [...(prev.symptom_targets || []), symptom]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nutriments principaux */}
            <div>
              <label className="block text-sm font-medium mb-2">Nutriments principaux</label>
              <p className="text-xs text-gray-600 mb-2">Indiquez les nutriments clés apportés par cette recette</p>
              <div className="flex flex-wrap gap-2">
                {MAIN_NUTRIENTS.map(nutrient => {
                  const isSelected = recipe.main_nutrients?.includes(nutrient);
                  return (
                    <button
                      key={nutrient}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          main_nutrients: isSelected
                            ? (prev.main_nutrients || []).filter(n => n !== nutrient)
                            : [...(prev.main_nutrients || []), nutrient]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {nutrient}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Équipement nécessaire */}
            <div>
              <label className="block text-sm font-medium mb-2">Équipement nécessaire</label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_LIST.map(equipment => {
                  const isSelected = recipe.equipment_needed.includes(equipment);
                  return (
                    <button
                      key={equipment}
                      type="button"
                      onClick={() => {
                        setRecipe(prev => ({
                          ...prev,
                          equipment_needed: isSelected
                            ? prev.equipment_needed.filter(e => e !== equipment)
                            : [...prev.equipment_needed, equipment]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        isSelected
                          ? 'bg-gray-600 text-white border-gray-600'
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {equipment}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Améliore l'humeur */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recipe.mood_boosting}
                  onChange={e => setRecipe(prev => ({ ...prev, mood_boosting: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Cette recette améliore l'humeur</span>
              </label>
              <p className="text-xs text-gray-600 ml-6">Indiquez si cette recette contient des ingrédients connus pour améliorer l'humeur</p>
            </div>

            {/* Conseils de conservation */}
            <div>
              <label className="block text-sm font-medium mb-2">Conseils de conservation</label>
              <textarea
                value={recipe.storage_tips || ''}
                onChange={e => setRecipe(prev => ({ ...prev, storage_tips: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                placeholder="Ex: Se conserve 3 jours au réfrigérateur, peut être congelé..."
              />
            </div>

            {/* Conseils généraux */}
            <div>
              <label className="block text-sm font-medium mb-2">Conseils et astuces</label>
              <textarea
                value={recipe.tips || ''}
                onChange={e => setRecipe(prev => ({ ...prev, tips: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                placeholder="Ex: Pour plus de saveur, laissez mariner plus longtemps..."
              />
            </div>
          </div>
        </section>

        {/* Variations (optionnel) */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-principal)' }}>
              Variations (optionnel)
            </h2>
            <button
              onClick={addVariation}
              className="px-4 py-2 rounded-xl text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary-bleu-ciel)' }}
            >
              + Ajouter une variation
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Proposez des variations de cette recette (version végétarienne, sans gluten, etc.)
          </p>

          <div className="space-y-4">
            {(recipe.variations || []).map((variation, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Nom de la variation (ex: Version végétarienne)"
                    value={variation.name}
                    onChange={e => updateVariation(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeVariation(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Supprimer la variation
                  </button>
                </div>
                <textarea
                  placeholder="Description de la variation et modifications à apporter..."
                  value={variation.description}
                  onChange={e => updateVariation(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>
            ))}
          </div>

          {(recipe.variations || []).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune variation ajoutée</p>
              <p className="text-sm">Cliquez sur "Ajouter une variation" pour proposer des alternatives</p>
            </div>
          )}
        </section>

        {/* Footer avec actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-2 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary-bleu-ciel)' }}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder ma recette'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipeView;