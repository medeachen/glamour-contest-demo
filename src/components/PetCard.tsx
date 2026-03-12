import type { Pet, DimValues } from '../types';
import { RadarChart } from './RadarChart';

interface Props {
  pet: Pet;
  isSelected?: boolean;
  isRecommended?: boolean;
  recommendRank?: number;
  accentColor?: string;
  onSelect?: () => void;
  onHover?: (id: string | null) => void;
  isHovered?: boolean;
  radarMaxValue?: number;
}

const GRADE_BADGE: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '⭐ 推荐', color: '#b8860b', bg: 'linear-gradient(135deg, #fff8dc, #ffd700)' },
  2: { label: '✦ 次选', color: '#666', bg: 'linear-gradient(135deg, #f5f5f5, #c0c0c0)' },
};

export function PetCard({
  pet,
  isSelected = false,
  isRecommended = false,
  recommendRank,
  accentColor = '#9c27b0',
  onSelect,
  onHover,
  isHovered = false,
  radarMaxValue = 100,
}: Props) {
  const badge = recommendRank !== undefined ? GRADE_BADGE[recommendRank] : null;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHover?.(pet.id)}
      onMouseLeave={() => onHover?.(null)}
      role="button"
      tabIndex={0}
      aria-label={`选择宠物 ${pet.name}${isRecommended ? '（推荐）' : ''}`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
      style={{
        background: 'white',
        borderRadius: 24,
        padding: 20,
        cursor: 'pointer',
        width: 220,
        boxShadow: isSelected
          ? `0 8px 32px ${accentColor}44`
          : isHovered
          ? '0 8px 24px rgba(0,0,0,0.12)'
          : '0 4px 12px rgba(0,0,0,0.07)',
        border: isSelected
          ? `2px solid ${accentColor}`
          : isRecommended
          ? '2px solid #ffd700'
          : '2px solid transparent',
        transform: isHovered || isSelected ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s',
        textAlign: 'center',
        position: 'relative',
        outline: 'none',
      }}
    >
      {/* Recommendation badge */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: badge.bg,
            color: badge.color,
            borderRadius: 12,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            border: '1.5px solid rgba(255,255,255,0.8)',
          }}
        >
          {badge.label}
        </div>
      )}

      {/* Pet icon */}
      <div style={{ fontSize: 52, marginBottom: 6 }}>{pet.icon}</div>

      {/* Name (no element badge) */}
      <h2 style={{ margin: '4px 0 6px', fontSize: 18, color: '#333', fontWeight: 800 }}>
        {pet.name}
      </h2>

      <p style={{ color: '#888', fontSize: 11, margin: '0 0 10px', lineHeight: 1.5 }}>
        {pet.description}
      </p>

      {/* Mini radar thumbnail */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <RadarChart values={pet.baseStats} maxValue={radarMaxValue} color={accentColor} size={100} mini />
      </div>

      {isSelected && (
        <div style={{ marginTop: 8, color: accentColor, fontWeight: 700, fontSize: 13 }}>
          ✅ 已选择
        </div>
      )}
    </div>
  );
}

/** Small inline dimension bars – shows relative strength without raw numbers */
export function DimBars({ values, color = '#a78bfa', maxValue = 100 }: { values: DimValues; color?: string; maxValue?: number }) {
  const labels: Record<keyof DimValues, string> = { mind: '头脑', emotion: '情感', curiosity: '好奇', power: '力量' };
  const dims: (keyof DimValues)[] = ['mind', 'emotion', 'curiosity', 'power'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      {dims.map((d) => (
        <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#888', width: 28, flexShrink: 0 }}>{labels[d]}</span>
          <div style={{ flex: 1, height: 5, background: '#f0ecfa', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min((values[d] / maxValue) * 100, 100)}%`,
                height: '100%',
                background: color,
                borderRadius: 3,
                transition: 'width 0.4s',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
