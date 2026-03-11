interface Props {
  skillName: string;
  /** Raw score 0–300+ */
  score: number;
  maxScore?: number;
  isCrit: boolean;
  /** 'idle' | 'active' | 'done' */
  state: 'idle' | 'active' | 'done';
  color?: string;
}

const STAR_THRESHOLDS = [0.4, 0.65, 0.85]; // fraction of maxScore for 1/2/3 stars

function getStars(fraction: number): number {
  if (fraction >= STAR_THRESHOLDS[2]) return 3;
  if (fraction >= STAR_THRESHOLDS[1]) return 2;
  if (fraction >= STAR_THRESHOLDS[0]) return 1;
  return 0;
}

export function SkillScore({ skillName, score, maxScore = 300, isCrit, state, color = '#a78bfa' }: Props) {
  const fraction = Math.min(score / maxScore, 1);
  const stars = state === 'done' ? getStars(fraction) : 0;
  const pct = Math.round(fraction * 100);

  return (
    <div
      style={{
        background: state === 'active' ? `${color}22` : 'rgba(255,255,255,0.07)',
        border: `1px solid ${state === 'active' ? color : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 14,
        padding: '10px 14px',
        transition: 'all 0.3s',
        boxShadow: state === 'active' ? `0 0 16px ${color}55` : 'none',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: state === 'active' ? '#fff' : '#ccc', fontWeight: 700, fontSize: 13 }}>
          {skillName}
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {isCrit && state !== 'idle' && (
            <span
              style={{
                fontSize: 10,
                background: '#ffd700',
                color: '#7a5c00',
                borderRadius: 6,
                padding: '1px 6px',
                fontWeight: 800,
              }}
            >
              CRIT!
            </span>
          )}
          {state === 'done' && (
            <span style={{ fontSize: 14, letterSpacing: 1 }}>
              {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div
          style={{
            width: state === 'idle' ? '0%' : `${pct}%`,
            height: '100%',
            background: isCrit
              ? 'linear-gradient(90deg, #ffd700, #ff8c00)'
              : `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 6,
            transition: 'width 0.6s ease-out',
          }}
        />
      </div>

      {/* Score text */}
      {state === 'done' && (
        <div style={{ marginTop: 5, fontSize: 11, color: '#aaa', textAlign: 'right' }}>
          {Math.round(score)} 分
        </div>
      )}
    </div>
  );
}
