import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CONTESTS } from '../data/gameData';
import type { ContestId } from '../types';

const CONTEST_BG: Record<ContestId, string> = {
  elegance: 'linear-gradient(135deg, #d0d8f0, #b8c8e8)',
  sweet: 'linear-gradient(135deg, #fce4ec, #f8bbd0)',
  dashing: 'linear-gradient(135deg, #fff0e0, #ffd0a0)',
  fresh: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
  charm: 'linear-gradient(135deg, #fce4ec, #f9b8c0)',
};

export function LobbyPage() {
  const { selectContest, setPhase, highScores } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<ContestId | null>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  function handleSelect(id: ContestId) {
    selectContest(id);
    setPhase('petSelect');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #fce4ec 0%, #e8eaf6 50%, #e0f7fa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
      transition: 'opacity 0.6s',
      opacity: visible ? 1 : 0,
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🌟</div>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #e91e8c, #9c27b0, #3f51b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          华丽大赛！
        </h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 16 }}>选择你的赛事，带领宠物登上荣耀舞台！</p>
      </div>

      {/* Contest cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900, width: '100%' }}>
        {CONTESTS.map((c) => {
          const hs = highScores[c.id];
          const isHovered = hovered === c.id;
          return (
            <div key={c.id}
              onClick={() => handleSelect(c.id)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: CONTEST_BG[c.id],
                borderRadius: 24,
                padding: '28px 32px',
                cursor: 'pointer',
                width: 240,
                boxShadow: isHovered ? '0 12px 40px rgba(0,0,0,0.15)' : '0 4px 16px rgba(0,0,0,0.08)',
                transform: isHovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s ease',
                border: '2px solid rgba(255,255,255,0.8)',
              }}>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{c.icon}</div>
              <h2 style={{ margin: 0, fontSize: 20, textAlign: 'center', color: '#444', fontWeight: 800 }}>
                {c.name}
              </h2>
              <p style={{ color: '#666', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>{c.description}</p>
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>关键能力</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {Object.entries(c.weights).sort((a, b) => b[1] - a[1]).map(([dim, w]) => {
                    const labels: Record<string, string> = { mind: '头脑', emotion: '情感', curiosity: '好奇', power: '力量' };
                    return (
                      <span key={dim} style={{ fontSize: 12, background: '#fff', borderRadius: 8, padding: '2px 8px', color: '#555', fontWeight: 600 }}>
                        {labels[dim]} ×{w}
                      </span>
                    );
                  })}
                </div>
              </div>
              {hs && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255,215,0,0.25)', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#a07800' }}>历史最高</div>
                  <div style={{ fontWeight: 800, color: '#c08000', fontSize: 18 }}>{hs.grade} · {Math.round(hs.score)}分</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
