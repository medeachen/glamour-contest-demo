import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS, FOODS, DIM_LABELS } from '../data/gameData';
import { calculateMood, calculateFoodBonus } from '../utils/gameLogic';
import { calcRecommendScore, getMoodInfo, mapScoreToRank, getGradeInfo } from '../utils/scoring';
import { MoodBadge } from '../components/MoodBadge';

export function ConfirmPage() {
  const { setPhase, selectedPet, selectedContest, selectedFoods } = useGameStore();
  const [showDetails, setShowDetails] = useState(false);

  if (!selectedPet || !selectedContest) { setPhase('lobby'); return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const contest = CONTESTS.find(c => c.id === selectedContest)!;
  const mood = calculateMood(selectedPet, selectedFoods);
  const moodInfo = getMoodInfo(mood);
  const foodBonus = calculateFoodBonus(selectedFoods);
  const recScore = calcRecommendScore(selectedPet, selectedContest);
  const grade = mapScoreToRank(recScore);
  const gradeInfo = getGradeInfo(grade);

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = contestColors[selectedContest];

  // Top 3 relevant dimensions for this contest
  const topDims = Object.entries(contest.weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) as [string, number][];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f4ff, #e8f5e9)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <button onClick={() => setPhase('feeding')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>← 返回</button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>确认参赛 📋</h1>
        </div>

        {/* ── Main card ── */}
        <div style={{ background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          {/* Pet + contest row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44 }}>{pet.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#333', marginTop: 4 }}>{pet.name}</div>
            </div>
            <div style={{ color: '#aaa', fontSize: 20 }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44 }}>{contest.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#555', marginTop: 4 }}>{contest.name}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
              {/* Grade badge */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: gradeInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 900, color: 'white',
                boxShadow: `0 0 20px ${gradeInfo.color}88`,
              }}>{gradeInfo.grade}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>预估等级</div>
            </div>
          </div>

          {/* Mood */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <MoodBadge mood={mood} moodInfo={moodInfo} compact />
            <span style={{ fontSize: 13, color: '#aaa' }}>出场心情</span>
          </div>

          {/* Key abilities */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8 }}>关键能力</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {topDims.map(([dim, weight]) => {
                const base = pet.baseStats[dim as keyof typeof pet.baseStats];
                const bonus = foodBonus[dim as keyof typeof foodBonus];
                const total = base + bonus;
                const level = total >= 90 ? '极强' : total >= 75 ? '较强' : total >= 60 ? '一般' : '偏弱';
                const levelColor = total >= 90 ? '#c62828' : total >= 75 ? '#e65100' : total >= 60 ? '#1565c0' : '#555';
                return (
                  <div key={dim} style={{ background: `${accentColor}12`, borderRadius: 14, padding: '10px 16px', textAlign: 'center', border: `1px solid ${accentColor}33` }}>
                    <div style={{ fontWeight: 800, color: accentColor, fontSize: 15 }}>{DIM_LABELS[dim]}</div>
                    <div style={{ fontSize: 12, color: levelColor, fontWeight: 700, marginTop: 2 }}>{level}</div>
                    <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>权重 ×{weight}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Food selection summary */}
          {selectedFoods.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#888' }}>喂食：</span>
              {selectedFoods.map((fid, i) => {
                const food = FOODS.find(f => f.id === fid);
                return <span key={i} style={{ fontSize: 22 }}>{food?.icon}</span>;
              })}
            </div>
          )}
        </div>

        {/* ── Collapsible details ── */}
        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              width: '100%', background: 'none', border: 'none', padding: '14px 20px',
              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 14, color: '#666', fontWeight: 600,
            }}
          >
            <span>📊 查看详细数值</span>
            <span style={{ transition: 'transform 0.3s', transform: showDetails ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>

          {showDetails && (
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f5f5f5' }}>
              {/* Skills */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>表演技能</div>
                {pet.skills.map((skill, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                    <span style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 8, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>{skill.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        {Object.entries(skill.bonus).map(([d, v]) => `${DIM_LABELS[d]}+${v}`).join(' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => setPhase('performance')}
            style={{ background: `linear-gradient(135deg, ${accentColor}, #9c27b0)`, color: 'white', border: 'none', borderRadius: 16, padding: '16px 56px', fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: 2 }}>
            🎭 开始表演！
          </button>
        </div>
      </div>
    </div>
  );
}
