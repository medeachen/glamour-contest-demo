import { mapMoodToTier } from '../utils/scoring';

interface Props {
  mood: number;
}

const TIER_CONFIG = {
  sad:     { emoji: '😢', label: '难过', bg: '#fce4ec', color: '#c62828' },
  neutral: { emoji: '😐', label: '一般', bg: '#fff8e1', color: '#f57f17' },
  happy:   { emoji: '😊', label: '高兴', bg: '#e8f5e9', color: '#2e7d32' },
};

export function MoodBadge({ mood }: Props) {
  const tier = mapMoodToTier(mood);
  const cfg = TIER_CONFIG[tier];

  return (
    <span
      aria-label={`心情值: ${mood}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: cfg.bg,
        color: cfg.color,
        borderRadius: 20,
        padding: '4px 14px',
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}
