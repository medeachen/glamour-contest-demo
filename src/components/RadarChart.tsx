import type { DimValues } from '../types';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  values: DimValues;
  /** Optional computed sparkle value to show as 5th axis */
  sparkle?: number;
  maxValue?: number;
  color?: string;
  size?: number;
  /** If true, renders a minimal SVG thumbnail (no tooltip) */
  mini?: boolean;
}

const DIM_KEYS: (keyof DimValues)[] = ['mind', 'emotion', 'curiosity', 'power'];
const DIM_LABEL_MAP: Record<keyof DimValues, string> = {
  mind: '头脑',
  emotion: '情感',
  curiosity: '好奇',
  power: '力量',
};

export function RadarChart({ values, sparkle, maxValue = 150, color = '#a78bfa', size = 200, mini = false }: Props) {
  if (mini) {
    // Compact SVG-based thumbnail (no recharts overhead for tiny sizes)
    const s = size;
    const cx = s / 2;
    const cy = s / 2;
    const r = s * 0.36;
    const n = DIM_KEYS.length;
    const angleOffset = -Math.PI / 2;
    const angles = Array.from({ length: n }, (_, i) => angleOffset + (2 * Math.PI * i) / n);
    function pt(angle: number, ratio: number) {
      return { x: cx + Math.cos(angle) * r * ratio, y: cy + Math.sin(angle) * r * ratio };
    }
    const pts = DIM_KEYS.map((k, i) => pt(angles[i], Math.min(values[k] / maxValue, 1)));
    const dataPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
    const gridLevels = [0.33, 0.67, 1.0];
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-label="宠物能力雷达图缩略图">
        {gridLevels.map((lv, li) => {
          const gpts = angles.map(a => pt(a, lv));
          const gpath = gpts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
          return <path key={li} d={gpath} fill="none" stroke="#e0d7f7" strokeWidth="0.8" />;
        })}
        {angles.map((a, i) => {
          const ep = pt(a, 1);
          return <line key={i} x1={cx} y1={cy} x2={ep.x} y2={ep.y} stroke="#e0d7f7" strokeWidth="0.8" />;
        })}
        <path d={dataPath} fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />
        ))}
        {angles.map((a, i) => {
          const labelR = r + 11;
          return (
            <text
              key={i}
              x={cx + Math.cos(a) * labelR}
              y={cy + Math.sin(a) * labelR}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="#7c6d9a"
              fontWeight="bold"
            >
              {DIM_LABEL_MAP[DIM_KEYS[i]]}
            </text>
          );
        })}
      </svg>
    );
  }

  const data = [
    { subject: '头脑', value: values.mind, fullMark: maxValue },
    { subject: '情感', value: values.emotion, fullMark: maxValue },
    { subject: '好奇', value: values.curiosity, fullMark: maxValue },
    { subject: '力量', value: values.power, fullMark: maxValue },
    ...(sparkle !== undefined ? [{ subject: '闪光', value: Math.min(Math.round(sparkle), maxValue), fullMark: maxValue }] : []),
  ];

  return (
    <div style={{ width: size, height: size }} aria-label="宠物五维能力雷达图">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
          <PolarGrid stroke="#e0d7f7" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fill: '#7c6d9a', fontWeight: 700 }}
          />
          <Radar
            name="能力值"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.35}
            dot={{ r: 3, fill: color }}
          />
          <Tooltip
            formatter={(value) => [typeof value === 'number' ? value : Number(value), '能力值'] as [number, string]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${color}55`, background: 'rgba(255,255,255,0.97)' }}
            labelStyle={{ color: '#333', fontWeight: 700 }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
