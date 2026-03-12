
import { useState } from 'react';
import type { DimValues } from '../types';
import type { DisplayStats5D } from '../utils/scoring';

interface Props {
  values: DimValues | DisplayStats5D;
  maxValue?: number;
  color?: string;
  showLabels?: boolean;
  size?: number;
  /** Optional predicted/target values to show a second overlay (e.g. after feeding) */
  previewValues?: DimValues | DisplayStats5D;
  previewColor?: string;
}

const LABELS_4D = ['头脑', '情感', '好奇', '力量'];
const KEYS_4D: string[] = ['mind', 'emotion', 'curiosity', 'power'];

const LABELS_5D = ['头脑', '情感', '好奇', '力量', '闪光'];
const KEYS_5D: string[] = ['mind', 'emotion', 'curiosity', 'power', 'sparkle'];

function has5D(v: DimValues | DisplayStats5D): v is DisplayStats5D {
  return (v as DisplayStats5D).sparkle !== undefined;
}

export function RadarChart({
  values,
  maxValue = 150,
  color = '#a78bfa',
  showLabels = true,
  size = 120,
  previewValues,
  previewColor = '#86efac',
}: Props) {
  const [tooltip, setTooltip] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  const use5D = has5D(values);
  const LABELS = use5D ? LABELS_5D : LABELS_4D;
  const KEYS = use5D ? KEYS_5D : KEYS_4D;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const n = KEYS.length;

  const angleOffset = -Math.PI / 2;
  const angles = Array.from({ length: n }, (_, i) => angleOffset + (2 * Math.PI * i) / n);

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  function polarPoint(angle: number, ratio: number) {
    return {
      x: cx + Math.cos(angle) * r * ratio,
      y: cy + Math.sin(angle) * r * ratio,
    };
  }

  function buildPath(vals: DimValues | DisplayStats5D) {
    return KEYS.map((k, i) => {
      const val = (vals as unknown as Record<string, number>)[k] ?? 0;
      const ratio = Math.min(val / maxValue, 1);
      return polarPoint(angles[i], ratio);
    });
  }

  const dataPoints = buildPath(values);
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  let previewPath: string | null = null;
  let previewPoints: { x: number; y: number }[] | null = null;
  if (previewValues) {
    previewPoints = buildPath(previewValues);
    previewPath =
      previewPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Grid */}
        {gridLevels.map((level, li) => {
          const pts = angles.map(a => polarPoint(a, level));
          const path =
            pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
          return <path key={li} d={path} fill="none" stroke="#e0d7f7" strokeWidth="1" />;
        })}

        {/* Axes */}
        {angles.map((a, i) => {
          const pt = polarPoint(a, 1);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#e0d7f7" strokeWidth="1" />;
        })}

        {/* Preview overlay */}
        {previewPath && (
          <path d={previewPath} fill={previewColor} fillOpacity="0.25" stroke={previewColor} strokeWidth="1.5" strokeDasharray="4 2" />
        )}

        {/* Data shape */}
        <path d={dataPath} fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2" />

        {/* Data dots — interactive */}
        {dataPoints.map((p, i) => {
          const val = (values as unknown as Record<string, number>)[KEYS[i]] ?? 0;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={size < 100 ? 3 : 4}
              fill={color}
              style={{ cursor: 'pointer' }}
              tabIndex={0}
              role="img"
              aria-label={`${LABELS[i]}: ${Math.round(val)}`}
              onMouseEnter={() => setTooltip({ label: LABELS[i], value: val, x: p.x, y: p.y })}
              onMouseLeave={() => setTooltip(null)}
              onFocus={() => setTooltip({ label: LABELS[i], value: val, x: p.x, y: p.y })}
              onBlur={() => setTooltip(null)}
            />
          );
        })}

        {/* Preview dots */}
        {previewPoints &&
          previewPoints.map((p, i) => {
            const val = (previewValues as unknown as Record<string, number>)[KEYS[i]] ?? 0;
            const base = (values as unknown as Record<string, number>)[KEYS[i]] ?? 0;
            const delta = val - base;
            return (
              <circle
                key={`prev-${i}`}
                cx={p.x}
                cy={p.y}
                r={size < 100 ? 2 : 3}
                fill={previewColor}
                stroke={previewColor}
                strokeWidth="1"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() =>
                  setTooltip({
                    label: `${LABELS[i]} (预测)`,
                    value: val,
                    x: p.x,
                    y: p.y,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
                aria-label={`${LABELS[i]}: ${val}${delta !== 0 ? ` (${delta > 0 ? '+' : ''}${delta})` : ''}`}
              />
            );
          })}

        {/* Labels */}
        {showLabels &&
          angles.map((a, i) => {
            const labelR = r + (size < 100 ? 12 : 16);
            const lx = cx + Math.cos(a) * labelR;
            const ly = cy + Math.sin(a) * labelR;
            return (
              <text
                key={i}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size < 100 ? 9 : 11}
                fill="#7c6d9a"
                fontWeight="bold"
              >
                {LABELS[i]}
              </text>
            );
          })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 8,
            top: tooltip.y - 28,
            background: 'rgba(50,30,80,0.92)',
            color: '#fff',
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {tooltip.label}: {Math.round(tooltip.value)}
        </div>
      )}
    </div>
  );
}
