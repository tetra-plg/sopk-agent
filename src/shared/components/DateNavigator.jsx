import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatFrenchDate, isEditableDate } from '../utils/dateHelpers';

export default function DateNavigator({ currentDate, onDateChange, className = '' }) {
  const handlePrevious = () => {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    if (isEditableDate(previousDate)) {
      onDateChange(previousDate);
    }
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    if (isEditableDate(nextDate)) {
      onDateChange(nextDate);
    }
  };

  const canGoPrevious = () => {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    return isEditableDate(previousDate);
  };

  const canGoNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return isEditableDate(nextDate);
  };

  return (
    <div className={`flex items-center justify-between bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious()}
        className={`p-2 rounded-full transition-colors ${
          canGoPrevious()
            ? 'text-purple-600 hover:bg-purple-50 active:bg-purple-100'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        aria-label="Jour précédent"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {formatFrenchDate(currentDate)}
        </h2>
        <p className="text-sm text-gray-500">
          {currentDate.toLocaleDateString('fr-FR', { year: 'numeric' })}
        </p>
      </div>

      <button
        onClick={handleNext}
        disabled={!canGoNext()}
        className={`p-2 rounded-full transition-colors ${
          canGoNext()
            ? 'text-purple-600 hover:bg-purple-50 active:bg-purple-100'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        aria-label="Jour suivant"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}