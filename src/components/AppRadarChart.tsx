import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface RadarDataPoint {
  name: string;
  value: number;
  preview?: number;
}

interface Props {
  data: RadarDataPoint[];
  maxValue?: number;
  color?: string;
  previewColor?: string;
  size?: number;
  showValues?: boolean;
  ariaLabel?: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: RadarDataPoint }[] }) => {
  if (active && payload && payload.length > 0) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #e0d7f7',
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 13,
        color: '#444',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
        <b>{d.name}</b>: {d.value}
        {d.preview !== undefined && d.preview !== d.value && (
          <div style={{ color: d.preview > d.value ? '#4caf50' : '#f44336', fontSize: 12 }}>
            预测: {d.preview}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function AppRadarChart({
  data,
  maxValue = 100,
  color = '#a78bfa',
  previewColor = '#4caf50',
  size = 200,
  showValues = false,
  ariaLabel,
}: Props) {
  const hasPreview = data.some(d => d.preview !== undefined && d.preview !== d.value);
  const chartData = data.map(d => ({ ...d, fullMark: maxValue }));
  const label = ariaLabel ?? data.map(d => `${d.name}:${d.value}`).join(', ');

  return (
    <div
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#e0d7f7" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: '#7c6d9a', fontSize: size < 150 ? 9 : 11, fontWeight: 'bold' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={hasPreview ? 0.2 : 0.35}
            strokeWidth={hasPreview ? 1.5 : 2}
            dot={{ r: 3, fill: color }}
            label={showValues ? { fill: '#444', fontSize: 11 } : false}
          />
          {hasPreview && (
            <Radar
              dataKey="preview"
              stroke={previewColor}
              fill={previewColor}
              fillOpacity={0.3}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: previewColor }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
