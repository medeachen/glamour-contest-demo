import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DimValues } from '../types';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DeltaHint {
  dim: string;
  delta: number;
}

interface Props {
  current: DimValues;
  predicted?: DimValues;
  maxValue?: number;
  color?: string;
  size?: number;
}

const DIM_ORDER: (keyof DimValues)[] = ['mind', 'emotion', 'curiosity', 'power'];
const DIM_LABELS: Record<keyof DimValues, string> = {
  mind: '头脑',
  emotion: '情感',
  curiosity: '好奇',
  power: '力量',
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpValues(from: DimValues, to: DimValues, t: number): DimValues {
  return {
    mind: lerp(from.mind, to.mind, t),
    emotion: lerp(from.emotion, to.emotion, t),
    curiosity: lerp(from.curiosity, to.curiosity, t),
    power: lerp(from.power, to.power, t),
  };
}

export function DynamicRadar({ current, predicted, maxValue = 150, color = '#a78bfa', size = 220 }: Props) {
  const [displayValues, setDisplayValues] = useState<DimValues>(current);
  const [deltas, setDeltas] = useState<DeltaHint[]>([]);
  const [showDeltas, setShowDeltas] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const DURATION = 800; // ms

  useEffect(() => {
    // Snap to new current when current changes with no prediction
    if (!predicted) {
      setDisplayValues(current);
      setDeltas([]);
      setShowDeltas(false);
    }
  }, [current, predicted]);

  useEffect(() => {
    if (!predicted) return;

    // Compute deltas for floating hints
    const newDeltas: DeltaHint[] = DIM_ORDER
      .map((k) => ({ dim: DIM_LABELS[k], delta: Math.round(predicted[k] - current[k]) }))
      .filter((d) => d.delta !== 0);
    setDeltas(newDeltas);
    setShowDeltas(true);

    // Animate from current → predicted
    const from = { ...current };
    const to = { ...predicted };

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
    startTimeRef.current = null;

    function tick(timestamp: number) {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
      setDisplayValues(lerpValues(from, to, eased));
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [predicted]);

  const data = DIM_ORDER.map((k) => ({
    subject: DIM_LABELS[k],
    value: Math.round(displayValues[k]),
    fullMark: maxValue,
  }));

  const activeColor = predicted ? '#f472b6' : color;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ width: size, height: size }} aria-label="宠物能力动态雷达图">
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
              stroke={activeColor}
              fill={activeColor}
              fillOpacity={0.35}
              dot={{ r: 3, fill: activeColor }}
            />
            <Tooltip
            formatter={(value) => [typeof value === 'number' ? value : Number(value), '能力值'] as [number, string]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${activeColor}55`, background: 'rgba(255,255,255,0.97)' }}
              labelStyle={{ color: '#333', fontWeight: 700 }}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Floating delta hints */}
      <AnimatePresence>
        {showDeltas && deltas.map((d, i) => (
          <motion.div
            key={`${d.dim}-${d.delta}`}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -28 - i * 22 }}
            exit={{ opacity: 0, y: -50 - i * 22 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              fontSize: 13,
              fontWeight: 800,
              color: d.delta > 0 ? '#4caf50' : '#f44336',
              textShadow: '0 1px 4px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            {d.dim} {d.delta > 0 ? `+${d.delta}` : d.delta}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
