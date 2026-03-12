import { useState } from 'react';
import { mapMoodToTier } from '../utils/scoring';

interface Props {
  mood: number;
}

const TIER_CONFIG = {
  sad: { emoji: '😢', label: '难过', color: '#5c6bc0', bg: '#e8eaf6' },
  neutral: { emoji: '😐', label: '一般', color: '#f57c00', bg: '#fff3e0' },
  happy: { emoji: '😊', label: '高兴', color: '#2e7d32', bg: '#e8f5e9' },
} as const;

export function MoodBadge({ mood }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tier = mapMoodToTier(mood);
  const config = TIER_CONFIG[tier];

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: config.bg,
          color: config.color,
          borderRadius: 20,
          padding: '6px 14px',
          fontWeight: 700,
          fontSize: 15,
          border: `1.5px solid ${config.color}44`,
          cursor: 'default',
        }}
        aria-label={`心情：${config.label}（实际值 ${mood}/100）`}
        role="status"
      >
        <span role="img" aria-hidden="true">{config.emoji}</span>
        <span>{config.label}</span>
      </div>

      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
        }}>
          心情值: {mood}/100
        </div>
      )}
    </div>
  );
}
