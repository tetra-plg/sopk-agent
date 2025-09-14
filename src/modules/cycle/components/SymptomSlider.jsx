import Slider from '../../../shared/components/Slider';
import { PERIOD_LABELS, SYMPTOM_LABELS, getLabelForValue } from '../utils/symptomsValidation';

export default function SymptomSlider({
  type,
  value,
  onChange,
  title,
  description,
  icon,
  className = ''
}) {
  const getLabels = () => {
    switch (type) {
      case 'period':
        return PERIOD_LABELS;
      case 'fatigue':
      case 'pain':
        return SYMPTOM_LABELS;
      default:
        return {};
    }
  };

  const getColorForType = () => {
    switch (type) {
      case 'period':
        return 'pink';
      case 'fatigue':
        return 'blue';
      case 'pain':
        return 'purple';
      default:
        return 'purple';
    }
  };

  const getMaxValue = () => {
    return type === 'period' ? 4 : 5;
  };

  const labels = getLabels();
  const color = getColorForType();
  const max = getMaxValue();

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {icon && (
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
            ${type === 'period' ? 'bg-pink-100 text-pink-600' : ''}
            ${type === 'fatigue' ? 'bg-blue-100 text-blue-600' : ''}
            ${type === 'pain' ? 'bg-purple-100 text-purple-600' : ''}
          `}>
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-4">
        <Slider
          value={value || 0}
          onChange={onChange}
          min={0}
          max={max}
          step={1}
          labels={labels}
          color={color}
          showLabels={true}
          className="mb-2"
        />

        {/* Current selection display */}
        {value !== null && value !== undefined && value > 0 && (
          <div className="text-center">
            <div className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              ${type === 'period' ? 'bg-pink-50 text-pink-700 border border-pink-200' : ''}
              ${type === 'fatigue' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
              ${type === 'pain' ? 'bg-purple-50 text-purple-700 border border-purple-200' : ''}
            `}>
              <span>{getLabelForValue(type, value)}</span>
              <span className="text-xs opacity-75">({value}/{max})</span>
            </div>
          </div>
        )}

        {/* Help text for zero values */}
        {(value === null || value === undefined || value === 0) && (
          <div className="text-center">
            <p className="text-sm text-gray-500 italic">
              Déplacez le curseur pour indiquer votre niveau
            </p>
          </div>
        )}
      </div>
    </div>
  );
}