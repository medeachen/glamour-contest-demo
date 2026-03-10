
import type { DimValues } from '../types';

interface Props {
  values: DimValues;
  maxValue?: number;
  color?: string;
  showLabels?: boolean;
  size?: number;
}

const LABELS = ['头脑', '情感', '好奇', '力量'];
const KEYS: (keyof DimValues)[] = ['mind', 'emotion', 'curiosity', 'power'];

export function RadarChart({ values, maxValue = 150, color = '#a78bfa', showLabels = true, size = 120 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = 4;

  const angleOffset = -Math.PI / 2;
  const angles = Array.from({ length: n }, (_, i) => angleOffset + (2 * Math.PI * i) / n);

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  function polarPoint(angle: number, ratio: number) {
    return {
      x: cx + Math.cos(angle) * r * ratio,
      y: cy + Math.sin(angle) * r * ratio,
    };
  }

  const dataPoints = KEYS.map((k, i) => {
    const ratio = Math.min(values[k] / maxValue, 1);
    return polarPoint(angles[i], ratio);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level, li) => {
        const pts = angles.map(a => polarPoint(a, level));
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
        return <path key={li} d={path} fill="none" stroke="#e0d7f7" strokeWidth="1" />;
      })}

      {angles.map((a, i) => {
        const pt = polarPoint(a, 1);
        return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#e0d7f7" strokeWidth="1" />;
      })}

      <path d={dataPath} fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2" />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}

      {showLabels && angles.map((a, i) => {
        const labelR = r + 14;
        const lx = cx + Math.cos(a) * labelR;
        const ly = cy + Math.sin(a) * labelR;
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fontSize={size < 100 ? 9 : 11} fill="#7c6d9a" fontWeight="bold">
            {LABELS[i]}
          </text>
        );
      })}
    </svg>
  );
}
