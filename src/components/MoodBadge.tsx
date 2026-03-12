import { getMoodTier } from '../utils/scoring';

interface Props {
  mood: number;
  size?: 'sm' | 'md' | 'lg';
}

const TIER_COLORS = {
  '难过': { bg: '#fce4ec', text: '#c62828', border: '#ef9a9a' },
  '一般': { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
  '高兴': { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
};

const SIZE_STYLES = {
  sm: { fontSize: 11, padding: '2px 8px', emojiSize: 14 },
  md: { fontSize: 14, padding: '5px 14px', emojiSize: 18 },
  lg: { fontSize: 18, padding: '8px 20px', emojiSize: 24 },
};

export function MoodBadge({ mood, size = 'md' }: Props) {
  const tier = getMoodTier(mood);
  const colors = TIER_COLORS[tier.label];
  const sizing = SIZE_STYLES[size];

  return (
    <span
      aria-label={`心情：${tier.label}（精确值：${mood}/100）`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: colors.bg,
        color: colors.text,
        border: `1.5px solid ${colors.border}`,
        borderRadius: 20,
        padding: sizing.padding,
        fontSize: sizing.fontSize,
        fontWeight: 700,
        lineHeight: 1.2,
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: sizing.emojiSize, lineHeight: 1 }}>{tier.emoji}</span>
      {tier.label}
    </span>
  );
}
