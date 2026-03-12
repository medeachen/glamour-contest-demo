import type { MoodInfo } from '../utils/scoring';

interface Props {
  mood: number;
  moodInfo: MoodInfo;
  /** When true, shows a compact single-emoji+label badge instead of a full pill */
  compact?: boolean;
}

export function MoodBadge({ mood, moodInfo, compact = false }: Props) {
  if (compact) {
    return (
      <span
        aria-label={`心情: ${moodInfo.label} (${mood}/100)`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: `${moodInfo.color}22`,
          color: moodInfo.color,
          borderRadius: 20,
          padding: '3px 10px',
          fontWeight: 700,
          fontSize: 13,
          border: `1px solid ${moodInfo.color}55`,
        }}
      >
        <span role="img" aria-hidden="true">{moodInfo.emoji}</span>
        {moodInfo.label}
      </span>
    );
  }

  return (
    <div
      aria-label={`心情: ${moodInfo.label} (${mood}/100)`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
        background: `${moodInfo.color}18`,
        borderRadius: 16,
        padding: '10px 16px',
        border: `1px solid ${moodInfo.color}44`,
      }}
    >
      <span role="img" aria-hidden="true" style={{ fontSize: 32 }}>{moodInfo.emoji}</span>
      <span style={{ fontWeight: 800, color: moodInfo.color, fontSize: 15 }}>{moodInfo.label}</span>
      <span style={{ fontSize: 11, color: '#999' }}>心情</span>
    </div>
  );
}
