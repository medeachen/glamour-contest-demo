
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS, FOODS } from '../data/gameData';
import { RadarChart } from '../components/RadarChart';
import { MoodBadge } from '../components/MoodBadge';
import { calculateMood, calculateSparkle, calculateFoodBonus } from '../utils/gameLogic';
import { computeRecommendation, mapScoreToRank } from '../utils/scoring';
import type { DimValues } from '../types';

const GRADE_COLORS: Record<string, string> = { S: '#ffd700', A: '#c0c0c0', B: '#cd7f32', C: '#7ec8e3', D: '#aaa' };

export function ConfirmPage() {
  const { setPhase, selectedPet, selectedContest, selectedFoods } = useGameStore();

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

  const recScore = computeRecommendation(pet);
  const grade = mapScoreToRank(recScore);
  const gradeColor = GRADE_COLORS[grade] ?? '#aaa';

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = contestColors[selectedContest];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f4ff, #e8f5e9)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <button onClick={() => setPhase('feeding')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>← 返回</button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>确认参赛 📋</h1>
        </div>

        {/* Pet card + grade */}
        <div style={{ background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 48 }}>{pet.icon}</div>
          <div style={{ fontWeight: 900, fontSize: 24, color: '#333', marginTop: 4 }}>{pet.name}</div>

          {/* Overall grade badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, background: `${gradeColor}22`, borderRadius: 16, padding: '6px 20px', border: `2px solid ${gradeColor}` }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: gradeColor }}>{grade}</span>
            <span style={{ fontSize: 14, color: '#666' }}>综合评级</span>
          </div>

          {/* Radar chart (5-dim) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <RadarChart values={combinedStats} sparkle={sparkle} maxValue={200} color={accentColor} size={200} />
          </div>

          {/* Mood */}
          <div style={{ marginTop: 12 }}>
            <MoodBadge mood={mood} />
          </div>
        </div>

        {/* Contest + skills summary */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: 32 }}>{contest.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#333', marginTop: 4 }}>{contest.name}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              {selectedFoods.map((fid, i) => {
                const food = FOODS.find(f => f.id === fid);
                return <span key={i} style={{ fontSize: 24 }}>{food?.icon}</span>;
              })}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 10, fontWeight: 600 }}>表演技能</div>
            {pet.skills.map((skill, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                <span style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>{i + 1}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button onClick={() => setPhase('performance')}
            style={{ background: `linear-gradient(135deg, ${accentColor}, #9c27b0)`, color: 'white', border: 'none', borderRadius: 16, padding: '16px 56px', fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: 2 }}>
            🎭 开始表演！
          </button>
        </div>
      </div>
    </div>
  );
}
