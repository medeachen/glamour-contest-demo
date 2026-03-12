import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  skillName: string;
  /** 0–100 score progress */
  score: number;
  isActive: boolean;
  isCrit?: boolean;
  color?: string;
  index: number;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'S 完美！', color: '#ffd700' };
  if (score >= 75) return { label: 'A 出色', color: '#4caf50' };
  if (score >= 55) return { label: 'B 不错', color: '#2196f3' };
  if (score >= 35) return { label: 'C 普通', color: '#ff9800' };
  return { label: 'D 加油', color: '#aaa' };
}

export function SkillScore({ skillName, score, isActive, isCrit = false, color = '#a78bfa', index }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const scoreLabel = getScoreLabel(displayScore);

  useEffect(() => {
    if (!isActive) return;
    let current = 0;
    const target = score;
    const step = target / 40;
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayScore(Math.round(current));
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [isActive, score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '10px 14px',
        border: `1px solid ${isActive ? color + '88' : 'rgba(255,255,255,0.1)'}`,
        minWidth: 180,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
          {skillName}
          {isCrit && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ marginLeft: 6, color: '#ffd700', fontSize: 11 }}
            >
              ⚡暴击
            </motion.span>
          )}
        </span>
        <span style={{ color: scoreLabel.color, fontWeight: 800, fontSize: 13 }}>
          {isActive ? scoreLabel.label : '—'}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isActive ? `${displayScore}%` : '0%' }}
          transition={{ duration: 0.05 }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}, ${scoreLabel.color})`,
            borderRadius: 6,
          }}
        />
      </div>
    </motion.div>
  );
}
