/**
 * 📊 Mini Chart Component
 *
 * Composant réutilisable pour afficher de petits graphiques d'évolution
 */

interface MiniChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  showDots?: boolean;
}

const MiniChart = ({
  data,
  color = '#10B981',
  width = 80,
  height = 30,
  strokeWidth = 2,
  showDots = false
}: MiniChartProps) => {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    );
  }

  // Filtrer les valeurs nulles/undefined et obtenir les valeurs valides avec leurs indices
  const validData = data
    .map((value, index) => ({ value: value || 0, index }))
    .filter(item => item.value > 0);

  if (validData.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    );
  }

  // Calculer les points pour la courbe
  const maxValue = Math.max(...validData.map(d => d.value));
  const minValue = Math.min(...validData.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = validData.map((item, i) => {
    const x = (i / (validData.length - 1)) * width;
    const y = height - ((item.value - minValue) / range) * height;
    return { x, y, value: item.value };
  });

  // Créer le path pour la courbe
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    } else {
      const prevPoint = points[index - 1];
      const cpx1 = prevPoint.x + (point.x - prevPoint.x) / 3;
      const cpy1 = prevPoint.y;
      const cpx2 = point.x - (point.x - prevPoint.x) / 3;
      const cpy2 = point.y;
      return `${path} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
    }
  }, '');

  // Déterminer la couleur basée sur la tendance
  const firstValue = validData[0].value;
  const lastValue = validData[validData.length - 1].value;
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';

  const trendColors = {
    up: color || '#10B981',
    down: '#EF4444',
    stable: '#6B7280'
  };

  const finalColor = trendColors[trend];

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Ligne de base */}
      <line
        x1="0"
        y1={height}
        x2={width}
        y2={height}
        stroke="#E5E7EB"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* Courbe */}
      <path
        d={pathData}
        stroke={finalColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points optionnels */}
      {showDots && points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="2"
          fill={finalColor}
          opacity="0.8"
        />
      ))}

      {/* Indicateur de tendance (flèche) */}
      {trend !== 'stable' && (
        <g transform={`translate(${width - 8}, ${trend === 'up' ? 4 : height - 4})`}>
          <path
            d={trend === 'up' ? 'M0,4 L4,0 L8,4' : 'M0,0 L4,4 L8,0'}
            stroke={finalColor}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};

export default MiniChart;