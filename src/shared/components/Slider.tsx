import { useState } from 'react';

export default function Slider({
  value = 0,
  onChange,
  min = 0,
  max = 5,
  step = 1,
  labels = {},
  color = 'purple',
  showLabels = true,
  className = ''
}) {
  const [isActive, setIsActive] = useState(false);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      purple: {
        track: 'bg-purple-200',
        thumb: 'accent-purple-600',
        activeThumb: 'accent-purple-700'
      },
      pink: {
        track: 'bg-pink-200',
        thumb: 'accent-pink-600',
        activeThumb: 'accent-pink-700'
      },
      blue: {
        track: 'bg-blue-200',
        thumb: 'accent-blue-600',
        activeThumb: 'accent-blue-700'
      }
    };
    return colorMap[color] || colorMap.purple;
  };

  const colors = getColorClasses(color);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          onTouchStart={() => setIsActive(true)}
          onTouchEnd={() => setIsActive(false)}
          className={`
            w-full h-2 rounded-lg appearance-none cursor-pointer
            ${colors.track}
            ${isActive ? colors.activeThumb : colors.thumb}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-current
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:duration-150
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-current
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-track]:bg-transparent
          `}
        />

        {/* Track progress indicator */}
        <div
          className={`absolute top-0 h-2 rounded-lg bg-current pointer-events-none transition-all duration-200`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      {showLabels && Object.keys(labels).length > 0 && (
        <div className="flex justify-between mt-2 px-1">
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const labelValue = min + i;
            const label = labels[labelValue];

            if (!label) return <div key={labelValue} className="flex-1" />;

            return (
              <div
                key={labelValue}
                className={`flex-1 text-center transition-colors duration-200 ${
                  labelValue === value
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500'
                }`}
              >
                <span className="text-xs block">{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Current value indicator */}
      {value !== null && value !== undefined && (
        <div className="text-center mt-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-current/10 text-current`}>
            {labels[value] || value}
          </span>
        </div>
      )}
    </div>
  );
}