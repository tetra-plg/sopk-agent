/**
 * 🛒 Générateur de Liste de Courses - GroceryListGenerator
 *
 * Composant pour générer automatiquement des listes de courses
 * basées sur les recettes sélectionnées avec ajustement des portions
 */

import { useState, useEffect } from 'react';

const GroceryListGenerator = ({ selectedRecipes = [], onClose, onGenerate }) => {
  const [groceryList, setGroceryList] = useState([]);
  const [recipeAdjustments, setRecipeAdjustments] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [groupByCategory, setGroupByCategory] = useState(true);

  // Initialiser les ajustements de portions
  useEffect(() => {
    const initialAdjustments = {};
    selectedRecipes.forEach(recipe => {
      initialAdjustments[recipe.id] = 1; // Portions par défaut
    });
    setRecipeAdjustments(initialAdjustments);
  }, [selectedRecipes]);

  // Générer la liste de courses quand les recettes ou ajustements changent
  useEffect(() => {
    generateGroceryList();
  }, [selectedRecipes, recipeAdjustments]);

  const generateGroceryList = () => {
    const ingredientMap = new Map();

    selectedRecipes.forEach(recipe => {
      const adjustment = recipeAdjustments[recipe.id] || 1;

      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name.toLowerCase();
        const adjustedQuantity = adjustIngredientQuantity(ingredient.quantity, adjustment);

        if (ingredientMap.has(key)) {
          // Combiner les quantités si possible
          const existing = ingredientMap.get(key);
          ingredientMap.set(key, {
            ...existing,
            quantity: combineQuantities(existing.quantity, adjustedQuantity),
            recipes: [...existing.recipes, recipe.title]
          });
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            quantity: adjustedQuantity,
            category: ingredient.category || 'other',
            recipes: [recipe.title],
            notes: ingredient.notes || ''
          });
        }
      });
    });

    const list = Array.from(ingredientMap.values());
    setGroceryList(list);
  };

  const adjustIngredientQuantity = (quantity, adjustment) => {
    // Parse et ajuste la quantité
    const numMatch = quantity.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      const num = parseFloat(numMatch[1]) * adjustment;
      const adjustedNum = num % 1 === 0 ? num.toString() : num.toFixed(1);
      return quantity.replace(numMatch[1], adjustedNum);
    }
    return quantity;
  };

  const combineQuantities = (qty1, qty2) => {
    // Tentative simple de combinaison des quantités
    const num1Match = qty1.match(/(\d+(?:\.\d+)?)/);
    const num2Match = qty2.match(/(\d+(?:\.\d+)?)/);

    if (num1Match && num2Match) {
      const unit1 = qty1.replace(num1Match[0], '').trim();
      const unit2 = qty2.replace(num2Match[0], '').trim();

      // Si même unité, additionner
      if (unit1 === unit2) {
        const total = parseFloat(num1Match[1]) + parseFloat(num2Match[1]);
        const totalStr = total % 1 === 0 ? total.toString() : total.toFixed(1);
        return `${totalStr} ${unit1}`;
      }
    }

    // Sinon, concaténer
    return `${qty1} + ${qty2}`;
  };

  const updateRecipeAdjustment = (recipeId, adjustment) => {
    setRecipeAdjustments(prev => ({
      ...prev,
      [recipeId]: Math.max(0.5, adjustment)
    }));
  };

  const toggleItemCheck = (itemName) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const groupedList = groupByCategory
    ? groceryList.reduce((acc, item) => {
        const category = item.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {})
    : { 'Tous les ingrédients': groceryList };

  const categoryLabels = {
    proteins: '🥩 Protéines',
    vegetables: '🥕 Légumes',
    fruits: '🍎 Fruits',
    grains: '🌾 Céréales',
    dairy: '🧀 Produits laitiers',
    nuts: '🌰 Noix et graines',
    spices: '🌿 Épices',
    liquids: '🥛 Liquides',
    fats: '🫒 Matières grasses',
    other: '📦 Autres'
  };

  const exportList = (format = 'text') => {
    let content = '';

    if (format === 'text') {
      content = '🛒 LISTE DE COURSES SOPK\n\n';

      Object.entries(groupedList).forEach(([category, items]) => {
        if (items.length > 0) {
          content += `${categoryLabels[category] || category.toUpperCase()}\n`;
          content += '─'.repeat(20) + '\n';
          items.forEach(item => {
            const checkbox = checkedItems[item.name] ? '☑️' : '⬜';
            content += `${checkbox} ${item.quantity} ${item.name}\n`;
            if (item.notes) content += `   💡 ${item.notes}\n`;
          });
          content += '\n';
        }
      });

      content += `\nRecettes incluses:\n`;
      selectedRecipes.forEach(recipe => {
        const portions = recipeAdjustments[recipe.id];
        content += `• ${recipe.title} (${Math.round(recipe.servings * portions)} portions)\n`;
      });
    }

    // Créer et télécharger le fichier
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liste-courses-sopk-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    onGenerate && onGenerate({ format, itemCount: groceryList.length });
  };

  const shareList = async () => {
    if (navigator.share) {
      const text = groceryList.map(item =>
        `${item.quantity} ${item.name}`
      ).join('\n');

      try {
        await navigator.share({
          title: 'Ma Liste de Courses SOPK',
          text: `🛒 Liste de courses pour mes recettes SOPK:\n\n${text}`
        });
      } catch (error) {
      }
    }
  };

  if (selectedRecipes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">Aucune recette sélectionnée</h2>
          <p className="text-gray-600 mb-4">
            Sélectionnez d'abord des recettes pour générer votre liste de courses.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              🛒 Ma Liste de Courses
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {groceryList.length} ingrédients • {selectedRecipes.length} recettes
          </p>
        </div>

        {/* Ajustements des portions */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h3 className="font-semibold text-blue-800 mb-3">🍽️ Ajuster les portions</h3>
          <div className="space-y-3">
            {selectedRecipes.map(recipe => (
              <div key={recipe.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{recipe.title}</div>
                  <div className="text-xs text-gray-600">
                    {Math.round(recipe.servings * (recipeAdjustments[recipe.id] || 1))} portions
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateRecipeAdjustment(recipe.id, (recipeAdjustments[recipe.id] || 1) - 0.5)}
                    className="w-8 h-8 bg-blue-200 text-blue-800 rounded-full text-sm font-bold hover:bg-blue-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {recipeAdjustments[recipe.id] || 1}x
                  </span>
                  <button
                    onClick={() => updateRecipeAdjustment(recipe.id, (recipeAdjustments[recipe.id] || 1) + 0.5)}
                    className="w-8 h-8 bg-blue-200 text-blue-800 rounded-full text-sm font-bold hover:bg-blue-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Options d'affichage */}
        <div className="p-4 border-b border-gray-200">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={groupByCategory}
              onChange={(e) => setGroupByCategory(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Grouper par catégorie</span>
          </label>
        </div>

        {/* Liste des ingrédients */}
        <div className="overflow-y-auto max-h-96 p-4">
          {Object.entries(groupedList).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.name}
                    className={`flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                      checkedItems[item.name] ? 'bg-green-50 opacity-60' : ''
                    }`}
                    onClick={() => toggleItemCheck(item.name)}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems[item.name] || false}
                      onChange={() => {}}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${checkedItems[item.name] ? 'line-through text-gray-500' : ''}`}>
                        {item.quantity} {item.name}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-gray-500 italic mt-1">
                          💡 {item.notes}
                        </div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        Pour: {item.recipes.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2 justify-end">
            {navigator.share && (
              <button
                onClick={shareList}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                📤 Partager
              </button>
            )}
            <button
              onClick={() => exportList('text')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              📄 Exporter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryListGenerator;