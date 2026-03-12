import { useState } from 'react';

interface Props {
  skillName: string;
  score: number;
  color?: string;
}

function getLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: '优秀', color: '#4caf50' };
  if (score >= 60) return { label: '良好', color: '#2196f3' };
  if (score >= 40) return { label: '一般', color: '#ff9800' };
  return { label: '差', color: '#f44336' };
}

export function SkillScore({ skillName, score, color = '#a78bfa' }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const level = getLevel(score);

  return (
    <div
      style={{ position: 'relative', minWidth: 160 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label={`技能 ${skillName}，得分 ${score}，评级 ${level.label}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#eee' }}>{skillName}</span>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          background: `${level.color}33`,
          color: level.color,
          borderRadius: 6,
          padding: '1px 7px',
        }}>{level.label}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(100, score)}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${level.color})`,
          borderRadius: 6,
          transition: 'width 0.6s ease-out',
        }} />
      </div>

      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '110%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
        }}>
          {skillName}: {score.toFixed(1)}分
        </div>
      )}
    </div>
  );
}
