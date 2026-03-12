interface Props {
  skillName: string;
  score: number;
  maxScore?: number;
  color?: string;
  active?: boolean;
}

function scoreToLevel(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.85) return 'S';
  if (ratio >= 0.70) return 'A';
  if (ratio >= 0.55) return 'B';
  if (ratio >= 0.40) return 'C';
  return 'D';
}

export function SkillScore({ skillName, score, maxScore = 300, color = '#a78bfa', active = false }: Props) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const level = scoreToLevel(score, maxScore);

  return (
    <div
      style={{
        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: '10px 14px',
        minWidth: 160,
        border: active ? `1px solid ${color}88` : '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s',
        boxShadow: active ? `0 0 12px ${color}55` : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: active ? '#fff' : '#ccc', fontSize: 13, fontWeight: 700 }}>{skillName}</span>
        <span
          style={{
            background: color,
            color: '#fff',
            borderRadius: 6,
            padding: '1px 8px',
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {score > 0 ? level : '—'}
        </span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${color}bb)`,
            borderRadius: 6,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      {score > 0 && (
        <div style={{ textAlign: 'right', fontSize: 11, color: '#bbb', marginTop: 3 }}>
          {Math.round(score)} 分
        </div>
      )}
    </div>
  );
}
