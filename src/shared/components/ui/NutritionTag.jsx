/**
 * 🏷️ Composant NutritionTag
 *
 * Tags visuels pour indiquer les bénéfices nutritionnels et SOPK
 * des suggestions de repas.
 */

const tagStyles = {
  // Couleurs par type nutritionnel
  protein: 'bg-green-100 text-green-700 border-green-200',
  fiber: 'bg-orange-100 text-orange-700 border-orange-200',
  omega3: 'bg-blue-100 text-blue-700 border-blue-200',
  healthy_fats: 'bg-purple-100 text-purple-700 border-purple-200',

  // Index glycémique
  'low-gi': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'medium-gi': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'high-gi': 'bg-red-100 text-red-700 border-red-200',

  // Bénéfices SOPK
  insulin_regulation: 'bg-green-100 text-green-700 border-green-200',
  inflammation_reduction: 'bg-blue-100 text-blue-700 border-blue-200',
  hormone_balance: 'bg-purple-100 text-purple-700 border-purple-200',
  energy_boost: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  sustained_energy: 'bg-orange-100 text-orange-700 border-orange-200',

  // Défaut
  default: 'bg-gray-100 text-gray-700 border-gray-200'
};

const tagLabels = {
  // Nutriments
  protein: '💪 Protéines',
  fiber: '🌾 Fibres',
  omega3: '🐟 Oméga-3',
  healthy_fats: '🥑 Bons gras',

  // Index glycémique
  'low-gi': '🟢 IG bas',
  'medium-gi': '🟡 IG moyen',
  'high-gi': '🔴 IG élevé',

  // Bénéfices SOPK
  insulin_regulation: '⚖️ Équilibre glycémique',
  inflammation_reduction: '🧘 Anti-inflammatoire',
  hormone_balance: '🌙 Équilibre hormonal',
  energy_boost: '⚡ Boost d\'énergie',
  sustained_energy: '🔋 Énergie durable'
};

const NutritionTag = ({
  type,
  children,
  size = 'sm',
  variant = 'filled'
}) => {
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5'
  };

  const variantClasses = {
    filled: tagStyles[type] || tagStyles.default,
    outline: `border-2 bg-transparent ${(tagStyles[type] || tagStyles.default).replace('bg-', 'border-').replace('text-', 'text-')}`
  };

  const content = children || tagLabels[type] || type;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        transition-colors duration-200
      `}
    >
      {content}
    </span>
  );
};

export default NutritionTag;