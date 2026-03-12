import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS } from '../data/gameData';

const GRADE_COLORS: Record<string, string> = { S: '#ffd700', A: '#c0c0c0', B: '#cd7f32', C: '#7ec8e3', D: '#aaa' };
const GRADE_BG: Record<string, string> = {
  S: 'linear-gradient(135deg, #fff8dc, #ffd700, #ff8c00)',
  A: 'linear-gradient(135deg, #f0f0f0, #c0c0c0, #888)',
  B: 'linear-gradient(135deg, #f5deb3, #cd7f32, #8b4513)',
  C: 'linear-gradient(135deg, #e0f7ff, #7ec8e3, #5599bb)',
  D: 'linear-gradient(135deg, #f5f5f5, #aaa, #777)',
};

const GRADE_PARTICLES: Record<string, string[]> = {
  S: ['🏆', '✨', '🌟', '💫', '🎊', '🎉'],
  A: ['🌟', '⭐', '🎉', '👏', '🎈'],
  B: ['⭐', '👏', '🎈', '💪'],
  C: ['💪', '🌱', '😊', '🙌'],
  D: ['😊', '🌱', '💚'],
};

export function SettlementPage() {
  const { finalScore, selectedPet, selectedContest, highScores, resetGame } = useGameStore();
  const [gradeVisible, setGradeVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; delay: number }[]>([]);

  useEffect(() => {
    setTimeout(() => setGradeVisible(true), 300);
    setTimeout(() => setContentVisible(true), 1000);
  }, []);

  useEffect(() => {
    if (!finalScore) return;
    const emojis = GRADE_PARTICLES[finalScore.grade] ?? ['🌟'];
    const items = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: 5 + Math.random() * 90,
      delay: Math.random() * 2,
    }));
    setParticles(items);
  }, [finalScore?.grade]);

  if (!finalScore || !selectedPet || !selectedContest) { return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const contest = CONTESTS.find(c => c.id === selectedContest)!;
  const hs = highScores[selectedContest];
  const isNewRecord = hs && hs.score === finalScore.total && hs.grade === finalScore.grade;
  const gradeColor = GRADE_COLORS[finalScore.grade] ?? '#aaa';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a0a2e, #0d1a3a, #0a2a1a)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>

      {/* Floating particles */}
      {gradeVisible && particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: '100vh', opacity: 1 }}
          animate={{ y: '-20vh', opacity: 0 }}
          transition={{ duration: 3.5 + Math.random(), delay: p.delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
          style={{
            position: 'fixed',
            left: `${p.x}%`,
            bottom: 0,
            fontSize: finalScore.grade === 'S' ? 28 : 20,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Contest info */}
        <div style={{ fontSize: 14, color: '#aaa', marginBottom: 12, marginTop: 20 }}>{contest.icon} {contest.name}</div>

        {/* Pet icon + grade circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={gradeVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 72, marginBottom: 8 }}>{pet.icon}</div>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', background: GRADE_BG[finalScore.grade],
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            fontSize: 60, fontWeight: 900, color: 'white',
            boxShadow: `0 0 40px ${gradeColor}88`,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            {finalScore.grade}
          </div>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={gradeVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 12 }}
        >
          <div style={{ fontSize: 38, fontWeight: 900, color: '#ffd700', textShadow: '0 0 20px #ffd700' }}>
            {Math.round(finalScore.total)} 分
          </div>
          {isNewRecord && (
            <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 800, marginTop: 4 }}>
              🎉 新纪录！
            </div>
          )}
          <div style={{ color: '#ccc', marginTop: 8, fontSize: 15, maxWidth: 360 }}>
            {finalScore.comment}
          </div>
        </motion.div>

        {contentVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', marginTop: 28 }}
          >
            {/* Grade-specific banner */}
            {finalScore.grade === 'S' && (
              <div style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 24 }}>🏆✨🏆</div>
                <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 16, marginTop: 4 }}>完美表演！评审们感动得热泪盈眶！</div>
              </div>
            )}
            {finalScore.grade === 'A' && (
              <div style={{ background: 'rgba(192,192,192,0.15)', border: '1px solid rgba(192,192,192,0.4)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 24 }}>🌟🎉🌟</div>
                <div style={{ color: '#c0c0c0', fontWeight: 800, fontSize: 16, marginTop: 4 }}>出色表演！观众报以热烈掌声！</div>
              </div>
            )}
            {(finalScore.grade === 'B' || finalScore.grade === 'C') && (
              <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 24 }}>⭐💪⭐</div>
                <div style={{ color: '#ddd', fontWeight: 700, fontSize: 15, marginTop: 4 }}>继续努力，下次一定更出色！</div>
              </div>
            )}

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
              {[
                { label: '💥 暴击次数', value: `${finalScore.critCount}次` },
                { label: '😊 心情', value: finalScore.mood >= 68 ? '高兴' : finalScore.mood >= 34 ? '一般' : '难过' },
                { label: '✨ 闪光', value: finalScore.sparkle.toFixed(0) },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 100, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#aaa', fontSize: 11, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Back button */}
            <div style={{ textAlign: 'center', paddingBottom: 40 }}>
              <button onClick={resetGame}
                style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', color: 'white', border: 'none', borderRadius: 16, padding: '14px 48px', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(167,139,250,0.4)' }}>
                🏠 回到大厅
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
