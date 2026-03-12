import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface DynamicRadarDataPoint {
  name: string;
  current: number;
  predicted?: number;
}

interface Props {
  data: DynamicRadarDataPoint[];
  maxValue?: number;
  currentColor?: string;
  predictedColor?: string;
  size?: number;
  ariaLabel?: string;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DynamicRadarDataPoint }[];
}) => {
  if (active && payload && payload.length > 0) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid #e0d7f7',
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 13,
        color: '#444',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
        <b>{d.name}</b>
        <div>当前: {d.current}</div>
        {d.predicted !== undefined && d.predicted !== d.current && (
          <div style={{ color: d.predicted > d.current ? '#4caf50' : '#f44336' }}>
            预测: {d.predicted} ({d.predicted > d.current ? '+' : ''}{d.predicted - d.current})
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function DynamicRadar({
  data,
  maxValue = 150,
  currentColor = '#a78bfa',
  predictedColor = '#4caf50',
  size = 220,
  ariaLabel,
}: Props) {
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  const hasPredicted = data.some(d => d.predicted !== undefined && d.predicted !== d.current);

  // Build recharts data format
  const chartData = data.map(d => ({
    ...d,
    fullMark: maxValue,
  }));

  const label = ariaLabel ?? data.map(d =>
    `${d.name}:${d.current}${d.predicted !== undefined ? `→${d.predicted}` : ''}`
  ).join(', ');

  return (
    <div style={{ position: 'relative', width: size, height: size + (hasPredicted ? 40 : 0) }}>
      <div
        style={{ width: size, height: size }}
        role="img"
        aria-label={label}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={chartData} margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
            <PolarGrid stroke="#e0d7f7" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: '#7c6d9a', fontSize: size < 160 ? 9 : 11, fontWeight: 'bold' }}
              onMouseEnter={(e) => setHoveredAxis((e as unknown as { value: string }).value)}
              onMouseLeave={() => setHoveredAxis(null)}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Current values radar */}
            <Radar
              name="当前"
              dataKey="current"
              stroke={currentColor}
              fill={currentColor}
              fillOpacity={hasPredicted ? 0.2 : 0.35}
              strokeWidth={hasPredicted ? 1.5 : 2}
              dot={{ r: 3, fill: currentColor }}
            />
            {/* Predicted values radar (animated) */}
            {hasPredicted && (
              <Radar
                name="预测"
                dataKey="predicted"
                stroke={predictedColor}
                fill={predictedColor}
                fillOpacity={0.3}
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ r: 3, fill: predictedColor }}
              />
            )}
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Floating +N/-N indicators */}
      <AnimatePresence>
        {hasPredicted && data.map((d, i) => {
          if (d.predicted === undefined || d.predicted === d.current) return null;
          const diff = d.predicted - d.current;
          const isIncrease = diff > 0;
          // Position indicators around the chart edges (approximate)
          const n = data.length;
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const r = size * 0.48;
          const cx = size / 2 + Math.cos(angle) * r;
          const cy = size / 2 + Math.sin(angle) * r;

          return (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: hoveredAxis === d.name ? 0 : 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: cx,
                top: cy,
                transform: 'translate(-50%, -50%)',
                background: isIncrease ? '#e8f5e9' : '#fce4ec',
                color: isIncrease ? '#2e7d32' : '#c62828',
                borderRadius: 6,
                padding: '1px 5px',
                fontSize: 11,
                fontWeight: 700,
                pointerEvents: 'none',
                zIndex: 10,
                border: `1px solid ${isIncrease ? '#a5d6a7' : '#f48fb1'}`,
              }}
            >
              {isIncrease ? '+' : ''}{diff}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Legend */}
      {hasPredicted && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, fontSize: 12 }}>
          <span style={{ color: currentColor }}>⬤ 当前</span>
          <span style={{ color: predictedColor }}>⬤ 预测</span>
        </div>
      )}
    </div>
  );
}
