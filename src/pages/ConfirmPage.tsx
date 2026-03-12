import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS, FOODS, DIM_LABELS } from '../data/gameData';
import { RadarChart } from '../components/RadarChart';
import { MoodBadge } from '../components/MoodBadge';
import { calculateMood, calculateSparkle, calculateFoodBonus } from '../utils/gameLogic';
import { computeRecommendation, getGrade } from '../utils/scoring';
import type { DimValues } from '../types';

const GRADE_STYLES: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  S: { bg: 'linear-gradient(135deg, #fff8dc, #ffd700)', color: '#b8860b', icon: '🏆', label: '传奇' },
  A: { bg: 'linear-gradient(135deg, #f0f0f0, #c0c0c0)', color: '#555', icon: '🥈', label: '出色' },
  B: { bg: 'linear-gradient(135deg, #f5deb3, #cd7f32)', color: '#6b3a1f', icon: '🥉', label: '良好' },
  C: { bg: 'linear-gradient(135deg, #e0f7ff, #7ec8e3)', color: '#2c6e8e', icon: '⭐', label: '普通' },
  D: { bg: 'linear-gradient(135deg, #f5f5f5, #aaa)', color: '#555', icon: '📜', label: '加油' },
};

// Key ability highlights based on top dimensions
function getKeyAbilities(stats: DimValues): { icon: string; label: string; desc: string }[] {
  const sorted = (Object.entries(stats) as [keyof DimValues, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  const abilityMap: Record<keyof DimValues, { icon: string; label: string; desc: string }> = {
    mind: { icon: '🧠', label: '头脑', desc: '思维敏捷，表演层次丰富' },
    emotion: { icon: '💕', label: '情感', desc: '感情真挚，打动评委' },
    curiosity: { icon: '✨', label: '好奇', desc: '灵动活泼，充满新奇' },
    power: { icon: '💪', label: '力量', desc: '气势十足，震撼全场' },
  };
  return sorted.map(([dim]) => abilityMap[dim]);
}

export function ConfirmPage() {
  const { setPhase, selectedPet, selectedContest, selectedFoods } = useGameStore();
  const [detailOpen, setDetailOpen] = useState(false);

  if (!selectedPet || !selectedContest) { setPhase('lobby'); return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const contest = CONTESTS.find(c => c.id === selectedContest)!;
  const mood = calculateMood(selectedPet, selectedFoods);
  const sparkle = calculateSparkle(pet.affection, mood);
  const foodBonus = calculateFoodBonus(selectedFoods);

  const combinedStats: DimValues = {
    mind: pet.baseStats.mind + foodBonus.mind,
    emotion: pet.baseStats.emotion + foodBonus.emotion,
    curiosity: pet.baseStats.curiosity + foodBonus.curiosity,
    power: pet.baseStats.power + foodBonus.power,
  };

  // Estimate grade using recommendation score mapped to a 0-1000 scale
  const recScore = computeRecommendation(pet, contest.weights);
  // Map 0–100 rec score + food bonus effect to approximate grade range
  const estimatedTotal = recScore * 8 + (selectedFoods.length * 40);
  const estimatedGrade = getGrade(estimatedTotal);
  const gradeStyle = GRADE_STYLES[estimatedGrade] ?? GRADE_STYLES['C'];
  const keyAbilities = getKeyAbilities(combinedStats);

  const contestColors: Record<string, string> = {
    elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828',
  };
  const accentColor = contestColors[selectedContest];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f4ff, #e8f5e9)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <button onClick={() => setPhase('feeding')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>← 返回</button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>确认参赛 📋</h1>
        </div>

        {/* Main card */}
        <div style={{ background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          {/* Top: pet + contest */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 52 }}>{pet.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#333' }}>{pet.name}</div>
            </div>
            <div style={{ fontSize: 28, color: '#ccc' }}>→</div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 36 }}>{contest.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#555' }}>{contest.name}</div>
            </div>
          </div>

          {/* Grade badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              background: gradeStyle.bg,
              color: gradeStyle.color,
              borderRadius: 20,
              padding: '10px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255,255,255,0.7)',
            }}>
              <span style={{ fontSize: 28 }}>{gradeStyle.icon}</span>
              <div>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 1 }}>预期等级</div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>{estimatedGrade} · {gradeStyle.label}</div>
              </div>
            </div>
          </div>

          {/* Mood badge */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: '#888' }}>当前心情</span>
            <MoodBadge mood={mood} size="md" />
          </div>

          {/* Key abilities */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 10, textAlign: 'center' }}>关键能力</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {keyAbilities.map((ab) => (
                <div key={ab.label} style={{ background: `${accentColor}11`, border: `1px solid ${accentColor}33`, borderRadius: 14, padding: '10px 16px', textAlign: 'center', minWidth: 110 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{ab.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>{ab.label}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{ab.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected foods summary */}
          {selectedFoods.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {selectedFoods.map((fid, i) => {
                const food = FOODS.find(f => f.id === fid);
                return <span key={i} style={{ fontSize: 28 }}>{food?.icon}</span>;
              })}
            </div>
          )}

          {/* View details toggle */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={() => setDetailOpen(v => !v)}
              style={{ background: 'none', border: `1px solid ${accentColor}55`, color: accentColor, borderRadius: 10, padding: '6px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              {detailOpen ? '收起详情 ▲' : '查看详情 ▼'}
            </button>
          </div>

          {/* Detail panel */}
          {detailOpen && (
            <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <RadarChart values={combinedStats} sparkle={sparkle} maxValue={150} color={accentColor} size={200} />
              </div>
              <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', marginBottom: 12 }}>悬停雷达图查看精确数值</div>

              {/* Stat bonuses from food */}
              {selectedFoods.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
                  {(Object.entries(foodBonus) as [string, number][]).map(([dim, val]) => (
                    val > 0 && (
                      <span key={dim} style={{ fontSize: 12, background: '#e8f5e9', color: '#2e7d32', borderRadius: 8, padding: '3px 8px', fontWeight: 600 }}>
                        {DIM_LABELS[dim]}+{val}
                      </span>
                    )
                  ))}
                </div>
              )}

              {/* Skills */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 8, textAlign: 'center' }}>表演技能</div>
                {pet.skills.map((skill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                    <span style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 8, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{skill.name}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{skill.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => setPhase('performance')}
            style={{ background: `linear-gradient(135deg, ${accentColor}, #9c27b0)`, color: 'white', border: 'none', borderRadius: 16, padding: '16px 56px', fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: 2 }}>
            🎭 开始表演！
          </button>
        </div>
      </div>
    </div>
  );
}
