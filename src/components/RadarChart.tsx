
import {
  RadarChart as RC,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DimValues } from '../types';

interface Props {
  values: DimValues;
  /** Optional 5th dimension value (闪光值 / sparkle). */
  sparkle?: number;
  maxValue?: number;
  color?: string;
  /** @deprecated showLabels is always true; kept for backward compatibility */
  showLabels?: boolean;
  size?: number;
}

function buildData(values: DimValues, sparkle: number | undefined, maxValue: number) {
  const rows = [
    { subject: '头脑', value: values.mind },
    { subject: '情感', value: values.emotion },
    { subject: '好奇', value: values.curiosity },
    { subject: '力量', value: values.power },
  ];
  if (sparkle !== undefined) {
    rows.push({ subject: '闪光值', value: sparkle });
  }
  return rows.map(r => ({ ...r, fullMark: maxValue }));
}

export function RadarChart({ values, sparkle, maxValue = 150, color = '#a78bfa', size = 120 }: Props) {
  const data = buildData(values, sparkle, maxValue);

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RC data={data} outerRadius="68%">
          <PolarGrid stroke="#e0d7f7" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: size < 100 ? 9 : 11, fill: '#7c6d9a', fontWeight: 'bold' }}
          />
          <Tooltip
            formatter={(val: number) => [val, '']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Radar
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.35}
            isAnimationActive
          />
        </RC>
      </ResponsiveContainer>
    </div>
  );
}
