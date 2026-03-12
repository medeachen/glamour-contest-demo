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
}

interface Props {
  data: RadarDataPoint[];
  maxValue?: number;
  color?: string;
  previewColor?: string;
  previewValues?: RadarDataPoint[];
  size?: number;
  showValues?: boolean;
  ariaLabel?: string;
}

interface TooltipPayloadEntry {
  payload: RadarDataPoint & { previewValue?: number };
  dataKey: string;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) => {
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
        {d.previewValue !== undefined && d.previewValue !== d.value && (
          <div style={{ color: d.previewValue > d.value ? '#4caf50' : '#f44336', fontSize: 12 }}>
            预测: {d.previewValue} ({d.previewValue > d.value ? '+' : ''}{d.previewValue - d.value})
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
  previewValues,
  size = 200,
  showValues = false,
  ariaLabel,
}: Props) {
  // Merge preview values into chart data as a second key
  const chartData = data.map((d, i) => {
    const pv = previewValues?.[i];
    return {
      ...d,
      fullMark: maxValue,
      previewValue: pv !== undefined ? pv.value : undefined,
    };
  });

  const hasPreviews = previewValues !== undefined &&
    previewValues.length === data.length &&
    previewValues.some((p, i) => p.value !== data[i].value);

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
          {/* Preview overlay (dashed) */}
          {hasPreviews && (
            <Radar
              dataKey="previewValue"
              stroke={previewColor}
              fill={previewColor}
              fillOpacity={0.2}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: previewColor }}
              label={false}
            />
          )}
          {/* Primary values */}
          <Radar
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={hasPreviews ? 0.2 : 0.35}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            label={showValues ? { fill: '#444', fontSize: 11 } : false}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
