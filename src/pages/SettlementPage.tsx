import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS, DIM_LABELS } from '../data/gameData';
import { RadarChart } from '../components/RadarChart';

const GRADE_COLORS: Record<string, string> = { S: '#ffd700', A: '#c0c0c0', B: '#cd7f32', C: '#7ec8e3', D: '#aaa' };
const GRADE_BG: Record<string, string> = {
  S: 'linear-gradient(135deg, #fff8dc, #ffd700, #ff8c00)',
  A: 'linear-gradient(135deg, #f0f0f0, #c0c0c0, #888)',
  B: 'linear-gradient(135deg, #f5deb3, #cd7f32, #8b4513)',
  C: 'linear-gradient(135deg, #e0f7ff, #7ec8e3, #5599bb)',
  D: 'linear-gradient(135deg, #f5f5f5, #aaa, #777)',
};

export function SettlementPage() {
  const { finalScore, selectedPet, selectedContest, highScores, resetGame } = useGameStore();
  const [gradeVisible, setGradeVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setGradeVisible(true), 300);
    setTimeout(() => setContentVisible(true), 1000);
  }, []);

  if (!finalScore || !selectedPet || !selectedContest) { return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const contest = CONTESTS.find(c => c.id === selectedContest)!;
  const hs = highScores[selectedContest];
  const isNewRecord = hs && hs.score === finalScore.total && hs.grade === finalScore.grade;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a0a2e, #0d1a3a, #0a2a1a)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Grade big display */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: '#aaa', marginBottom: 8 }}>{contest.icon} {contest.name}</div>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', background: GRADE_BG[finalScore.grade],
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
          fontSize: 72, fontWeight: 900, color: 'white',
          boxShadow: `0 0 40px ${GRADE_COLORS[finalScore.grade]}88`,
          transform: gradeVisible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
          transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          {finalScore.grade}
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, color: '#ffd700', marginTop: 12, textShadow: '0 0 20px #ffd700' }}>
          {Math.round(finalScore.total)} 分
        </div>
        {isNewRecord && (
          <div style={{ fontSize: 20, color: '#ffd700', fontWeight: 800, marginTop: 6, animation: 'pulse 1s ease infinite' }}>
            🎉 新纪录！
          </div>
        )}
        <div style={{ color: '#ccc', marginTop: 8, fontSize: 15, maxWidth: 360 }}>
          {finalScore.comment}
        </div>
      </div>

      {contentVisible && (
        <div style={{ maxWidth: 700, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Score breakdown */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 14px', fontSize: 16 }}>📊 得分明细</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#ddd' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', color: '#aaa' }}>维度</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>基础</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>食物</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>技能</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>合计</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', color: '#aaa' }}>权重</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#aaa' }}>得分</th>
                  </tr>
                </thead>
                <tbody>
                  {(['mind', 'emotion', 'curiosity', 'power'] as const).map(dim => (
                    <tr key={dim} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700, color: '#e8d5ff' }}>{DIM_LABELS[dim]}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>{finalScore.baseStats[dim]}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#86efac' }}>+{finalScore.foodBonus[dim]}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#7dd3fc' }}>+{finalScore.skillBonus[dim]}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>{Math.round(finalScore.afterCrit[dim])}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#fbbf24' }}>×{finalScore.weights[dim]}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#ffd700' }}>{Math.round(finalScore.weighted[dim])}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid rgba(255,255,255,0.3)' }}>
                    <td colSpan={6} style={{ padding: '8px', fontWeight: 700, color: '#fff' }}>总分</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 900, color: '#ffd700', fontSize: 18 }}>{Math.round(finalScore.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: '💕 暴击次数', value: `${finalScore.critCount}次` },
              { label: '😊 心情值', value: `${finalScore.mood}/100` },
              { label: '✨ 闪光值', value: finalScore.sparkle.toFixed(1) },
              { label: '⚡ 暴击率', value: `${(finalScore.critRate * 100).toFixed(1)}%` },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 20px', textAlign: 'center', minWidth: 120, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Radar */}
          <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
            <RadarChart values={finalScore.afterBonus} maxValue={200} color="#a78bfa" size={180} />
          </div>

          {/* Back button */}
          <div style={{ textAlign: 'center', marginTop: 8, paddingBottom: 40 }}>
            <button onClick={resetGame}
              style={{ background: 'linear-gradient(135deg, #a78bfa, #f472b6)', color: 'white', border: 'none', borderRadius: 16, padding: '14px 48px', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(167,139,250,0.4)' }}>
              🏠 回到大厅
            </button>
          </div>
        </div>
      )}

      {/* Unused variable suppression */}
      <span style={{ display: 'none' }}>{pet.name}</span>
    </div>
  );
}
