import { useEffect, useState } from 'react';

interface Props {
  skillName: string;
  isCrit: boolean;
  visible: boolean;
  color?: string;
}

export function SkillEffect({ skillName, isCrit, visible, color = '#a78bfa' }: Props) {
  const [show, setShow] = useState(false);
  const [showCrit, setShowCrit] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      if (isCrit) {
        setTimeout(() => setShowCrit(true), 300);
        setTimeout(() => setShowCrit(false), 1500);
      }
      setTimeout(() => setShow(false), 2200);
    } else {
      setShow(false);
      setShowCrit(false);
    }
  }, [visible, isCrit]);

  if (!show) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
      {/* Skill name card */}
      <div style={{
        background: `linear-gradient(135deg, ${color}cc, #fff8)`,
        border: `2px solid ${color}`,
        borderRadius: 16,
        padding: '12px 28px',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textShadow: `0 0 12px ${color}`,
        boxShadow: `0 4px 24px ${color}88`,
        animation: 'skillSlideIn 0.4s ease-out',
        marginBottom: 16,
      }}>
        ✨ {skillName}
      </div>

      {/* CRITICAL text */}
      {showCrit && (
        <div style={{
          fontSize: 36,
          fontWeight: 900,
          color: '#ffd700',
          textShadow: '0 0 20px #ff8800, 0 0 40px #ffd700',
          animation: 'critBounce 0.3s ease-out',
          letterSpacing: 4,
        }}>
          CRITICAL! ⚡
        </div>
      )}

      {/* Sparkle circles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: color,
          opacity: 0.7,
          top: `${30 + Math.sin(i / 6 * Math.PI * 2) * 35}%`,
          left: `${50 + Math.cos(i / 6 * Math.PI * 2) * 30}%`,
          animation: `sparkleFloat ${0.8 + i * 0.15}s ease-out infinite`,
        }} />
      ))}
    </div>
  );
}
