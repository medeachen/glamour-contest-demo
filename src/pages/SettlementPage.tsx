import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS } from '../data/gameData';
import { getGradeInfo } from '../utils/scoring';

const GRADE_EFFECTS: Record<string, { emoji: string; bg: string; title: string; subtitle: string }> = {
  S: {
    emoji: '🏆',
    bg: 'linear-gradient(160deg, #1a0a00, #3a2000, #5a3000)',
    title: '完美演出！',
    subtitle: '令人叹为观止的表演，全场起立鼓掌！',
  },
  A: {
    emoji: '🌟',
    bg: 'linear-gradient(160deg, #0a0a1a, #1a1a3a, #2a2a5a)',
    title: '精彩绝伦！',
    subtitle: '出色的表演赢得了热烈掌声！',
  },
  B: {
    emoji: '⭐',
    bg: 'linear-gradient(160deg, #0a1a0a, #1a2a1a, #2a3a2a)',
    title: '发挥稳健！',
    subtitle: '令观众留下深刻印象，继续努力！',
  },
  C: {
    emoji: '💫',
    bg: 'linear-gradient(160deg, #0a0a1a, #1a1a2a, #1a2a3a)',
    title: '努力表演！',
    subtitle: '还有很大进步空间，加油！',
  },
  D: {
    emoji: '🎈',
    bg: 'linear-gradient(160deg, #0d0021, #1a0a2e, #0a1628)',
    title: '勇于参与！',
    subtitle: '参与比赛本身就很勇敢！',
  },
};

// Particle-style confetti emojis for S/A grades
const CONFETTI = ['🎊', '✨', '🎉', '⭐', '🌟', '💫', '🎊'];

export function SettlementPage() {
  const { finalScore, selectedPet, selectedContest, highScores, resetGame } = useGameStore();
  const [gradeVisible, setGradeVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [confettiItems] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: CONFETTI[i % CONFETTI.length],
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
    }))
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setGradeVisible(true), 300);
    setTimeout(() => setContentVisible(true), 900);
  }, []);

  // Focus the modal when opened; allow closing with Escape key
  useEffect(() => {
    if (showDetailsModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showDetailsModal]);

  function handleModalKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setShowDetailsModal(false);
  }

  if (!finalScore || !selectedPet || !selectedContest) { return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const contest = CONTESTS.find(c => c.id === selectedContest)!;
  const hs = highScores[selectedContest];
  const isNewRecord = hs && hs.score === finalScore.total && hs.grade === finalScore.grade;
  const gradeInfo = getGradeInfo(finalScore.grade);
  const effect = GRADE_EFFECTS[finalScore.grade] ?? GRADE_EFFECTS['D'];
  const isHighGrade = finalScore.grade === 'S' || finalScore.grade === 'A';

  return (
    <div style={{
      minHeight: '100vh',
      background: effect.bg,
      padding: '20px',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti (S/A only) */}
      {isHighGrade && confettiItems.map(c => (
        <div key={c.id} style={{
          position: 'absolute',
          left: `${c.left}%`,
          top: '-40px',
          fontSize: 20,
          animation: `fall ${c.duration}s ${c.delay}s linear infinite`,
          pointerEvents: 'none',
        }}>
          {c.emoji}
        </div>
      ))}

      <style>{`
        @keyframes fall {
          from { transform: translateY(0) rotate(0deg); opacity: 1; }
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Contest label */}
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 16, marginTop: 10 }}>
        {contest.icon} {contest.name}
      </div>

      {/* Hero section: pet + grade + title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 64, marginBottom: 8, animation: gradeVisible ? 'pulse 2s ease infinite' : 'none' }}>
          {effect.emoji} {pet.icon}
        </div>
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: gradeInfo.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 64, fontWeight: 900, color: 'white',
          boxShadow: `0 0 50px ${gradeInfo.color}88`,
          transform: gradeVisible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
          transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          {finalScore.grade}
        </div>
        <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: '0 0 8px', textShadow: `0 0 20px ${gradeInfo.color}` }}>
          {effect.title}
        </h2>
        <p style={{ color: '#ddd', fontSize: 15, margin: 0 }}>{effect.subtitle}</p>
        {isNewRecord && (
          <div style={{ fontSize: 18, color: '#ffd700', fontWeight: 800, marginTop: 10, animation: 'pulse 1s ease infinite' }}>
            🎉 新纪录！
          </div>
        )}
        <div style={{ color: '#ffd700', fontSize: 22, fontWeight: 900, marginTop: 10, textShadow: '0 0 20px #ffd700' }}>
          {Math.round(finalScore.total)} 分
        </div>
        <div style={{ marginTop: 6 }}>
          <span style={{
            background: gradeInfo.bg, color: 'white', borderRadius: 20,
            padding: '4px 16px', fontSize: 14, fontWeight: 700,
            boxShadow: `0 2px 8px ${gradeInfo.color}88`,
          }}>{gradeInfo.label}</span>
        </div>
        <div style={{ color: '#ccc', marginTop: 10, fontSize: 14, maxWidth: 360, margin: '10px auto 0' }}>
          {finalScore.comment}
        </div>
      </div>

      {/* Content */}
      {contentVisible && (
        <div style={{ maxWidth: 500, width: '100%', animation: 'fadeInUp 0.5s ease-out' }}>
          {/* Quick stats — grade-level only, no raw numbers */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              { label: '心情', value: finalScore.mood >= 68 ? '😊 高兴' : finalScore.mood >= 34 ? '😐 一般' : '😢 难过' },
              { label: '爆发', value: finalScore.critCount > 0 ? `⚡ ${finalScore.critCount}次暴击` : '😤 0暴击' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '10px 18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ color: '#aaa', fontSize: 11, marginBottom: 3 }}>{item.label}</div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* View details button */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <button
              onClick={() => setShowDetailsModal(true)}
              style={{ background: 'rgba(255,255,255,0.12)', color: '#ccc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
            >
              📊 查看详细评分
            </button>
          </div>

          {/* Back button */}
          <div style={{ textAlign: 'center', paddingBottom: 40 }}>
            <button onClick={resetGame}
              style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', color: 'white', border: 'none', borderRadius: 16, padding: '14px 48px', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(167,139,250,0.4)' }}>
              🏠 回到大厅
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div
          onClick={() => setShowDetailsModal(false)}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="详细评分"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a0a2e', borderRadius: 24, padding: 28, maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.15)',
              outline: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: 18 }}>📊 详细评分</h3>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>

            {/* Score table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#ddd' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    {['维度', '基础', '食物', '技能', '合计', '权重', '得分'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: h === '得分' ? 'right' : 'center', color: '#aaa', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(['mind', 'emotion', 'curiosity', 'power'] as const).map(dim => {
                    const labels: Record<string, string> = { mind: '头脑', emotion: '情感', curiosity: '好奇', power: '力量' };
                    return (
                      <tr key={dim} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700, color: '#e8d5ff' }}>{labels[dim]}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{finalScore.baseStats[dim]}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#86efac' }}>+{finalScore.foodBonus[dim]}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#7dd3fc' }}>+{finalScore.skillBonus[dim]}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{Math.round(finalScore.afterCrit[dim])}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: '#fbbf24' }}>×{finalScore.weights[dim]}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#ffd700' }}>{Math.round(finalScore.weighted[dim])}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: '2px solid rgba(255,255,255,0.3)' }}>
                    <td colSpan={6} style={{ padding: '8px', fontWeight: 700, color: '#fff' }}>总分</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 900, color: '#ffd700', fontSize: 18 }}>{Math.round(finalScore.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Extra stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              {[
                { label: '💕 暴击次数', value: `${finalScore.critCount}次` },
                { label: '😊 心情值', value: `${finalScore.mood}/100` },
                { label: '✨ 闪光值', value: finalScore.sparkle.toFixed(1) },
                { label: '⚡ 暴击率', value: `${(finalScore.critRate * 100).toFixed(1)}%` },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#aaa', fontSize: 11, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
