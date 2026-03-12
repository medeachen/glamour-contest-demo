import { motion } from 'framer-motion';
import {
  RadarChart as RC,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { DimValues } from '../types';

interface Props {
  currentValues: DimValues;
  predictedValues?: DimValues;
  sparkle?: number;
  predictedSparkle?: number;
  maxValue?: number;
  color?: string;
  predictedColor?: string;
  size?: number;
}

function buildData(
  current: DimValues,
  predicted: DimValues | undefined,
  sparkle: number | undefined,
  predictedSparkle: number | undefined,
  maxValue: number
) {
  const rows = [
    { subject: '头脑',   current: current.mind,      predicted: predicted?.mind ?? current.mind },
    { subject: '情感',   current: current.emotion,   predicted: predicted?.emotion ?? current.emotion },
    { subject: '好奇',   current: current.curiosity, predicted: predicted?.curiosity ?? current.curiosity },
    { subject: '力量',   current: current.power,     predicted: predicted?.power ?? current.power },
  ];
  if (sparkle !== undefined) {
    rows.push({
      subject: '闪光值',
      current: sparkle,
      predicted: predictedSparkle ?? sparkle,
    });
  }
  return rows.map(r => ({ ...r, fullMark: maxValue }));
}

export function DynamicRadar({
  currentValues,
  predictedValues,
  sparkle,
  predictedSparkle,
  maxValue = 200,
  color = '#a78bfa',
  predictedColor = '#f472b6',
  size = 240,
}: Props) {
  const data = buildData(currentValues, predictedValues, sparkle, predictedSparkle, maxValue);
  const hasPrediction = !!predictedValues;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RC data={data} outerRadius="65%">
          <PolarGrid stroke="#e0d7f7" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: '#7c6d9a', fontWeight: 'bold' }}
          />
          <Tooltip
            formatter={(val: number, name: string) => [val, name === 'current' ? '当前' : '预测']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          {hasPrediction && <Legend formatter={(v) => (v === 'current' ? '当前' : '预测')} />}
          <Radar
            name="current"
            dataKey="current"
            stroke={color}
            fill={color}
            fillOpacity={0.35}
            isAnimationActive
          />
          {hasPrediction && (
            <Radar
              name="predicted"
              dataKey="predicted"
              stroke={predictedColor}
              fill={predictedColor}
              fillOpacity={0.2}
              strokeDasharray="4 2"
              isAnimationActive
            />
          )}
        </RC>
      </ResponsiveContainer>
    </motion.div>
  );
}
