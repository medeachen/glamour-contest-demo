
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS, FOODS, DIM_LABELS } from '../data/gameData';
import { RadarChart } from '../components/RadarChart';
import { calculateMood, calculateSparkle, calculateCritRate, calculateCritMultiplier, calculateFoodBonus } from '../utils/gameLogic';
import type { DimValues } from '../types';

export function ConfirmPage() {
  const { setPhase, selectedPet, selectedContest, selectedFoods } = useGameStore();

  if (!selectedPet || !selectedContest) { setPhase('lobby'); return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const contest = CONTESTS.find(c => c.id === selectedContest)!;
  const mood = calculateMood(selectedPet, selectedFoods);
  const sparkle = calculateSparkle(pet.affection, mood);
  const critRate = calculateCritRate(mood);
  const critMult = calculateCritMultiplier(pet.affection);
  const foodBonus = calculateFoodBonus(selectedFoods);

  const combinedStats: DimValues = {
    mind: pet.baseStats.mind + foodBonus.mind,
    emotion: pet.baseStats.emotion + foodBonus.emotion,
    curiosity: pet.baseStats.curiosity + foodBonus.curiosity,
    power: pet.baseStats.power + foodBonus.power,
  };

  const contestColors: Record<string, string> = { elegance: '#e91e8c', wild: '#f57c00', creative: '#1565c0' };
  const accentColor = contestColors[selectedContest];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f4ff, #e8f5e9)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <button onClick={() => setPhase('feeding')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>← 返回</button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>确认参赛 📋</h1>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Left column */}
          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Pet summary */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>参赛宠物</h3>
              <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 4 }}>{pet.icon}</div>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 20, color: '#333' }}>{pet.name}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <RadarChart values={combinedStats} maxValue={150} color={accentColor} size={140} />
              </div>
            </div>

            {/* Contest summary */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>参赛项目</h3>
              <div style={{ fontSize: 28, textAlign: 'center' }}>{contest.icon}</div>
              <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 20, color: '#333' }}>{contest.name}</div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Food summary */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>喂食记录</h3>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {selectedFoods.map((fid, i) => {
                  const food = FOODS.find(f => f.id === fid);
                  return <span key={i} style={{ fontSize: 28 }}>{food?.icon}</span>;
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, justifyContent: 'center' }}>
                {(Object.entries(foodBonus) as [string, number][]).map(([dim, val]) => (
                  val > 0 && <span key={dim} style={{ fontSize: 12, background: '#e8f5e9', color: '#2e7d32', borderRadius: 8, padding: '3px 8px', fontWeight: 600 }}>
                    {DIM_LABELS[dim]}+{val}
                  </span>
                ))}
              </div>
            </div>

            {/* Combat stats */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>临场数值</h3>
              {[
                { label: '心情值', value: `${mood}/100`, icon: '😊' },
                { label: '闪光值', value: sparkle.toFixed(1), icon: '✨' },
                { label: '暴击率', value: `${(critRate * 100).toFixed(1)}%`, icon: '⚡' },
                { label: '暴击倍率', value: `×${critMult.toFixed(2)}`, icon: '💥' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
                  <span style={{ color: '#666' }}>{item.icon} {item.label}</span>
                  <b style={{ color: accentColor }}>{item.value}</b>
                </div>
              ))}
            </div>

            {/* Skills preview */}
            <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>表演技能</h3>
              {pet.skills.map((skill, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none' }}>
                  <span style={{ background: `${accentColor}22`, color: accentColor, borderRadius: 8, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{skill.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {Object.entries(skill.bonus).map(([d, v]) => `${DIM_LABELS[d]}+${v}`).join(' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button onClick={() => setPhase('performance')}
            style={{ background: `linear-gradient(135deg, ${accentColor}, #9c27b0)`, color: 'white', border: 'none', borderRadius: 16, padding: '16px 56px', fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: 2 }}>
            🎭 开始表演！
          </button>
        </div>
      </div>
    </div>
  );
}
