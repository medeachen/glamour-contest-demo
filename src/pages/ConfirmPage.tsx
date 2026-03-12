import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, CONTESTS, FOODS, DIM_LABELS } from '../data/gameData';
import { AppRadarChart } from '../components/AppRadarChart';
import { MoodBadge } from '../components/MoodBadge';
import { calculateMood, calculateSparkle, calculateCritRate, calculateCritMultiplier, calculateFoodBonus } from '../utils/gameLogic';
import { mapScoreToRank } from '../utils/scoring';
import type { DimValues } from '../types';

export function ConfirmPage() {
  const { setPhase, selectedPet, selectedContest, selectedFoods } = useGameStore();
  const [showDetails, setShowDetails] = useState(false);

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

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = contestColors[selectedContest];

  // Overall grade based on combined stats average
  const statAvg = (combinedStats.mind + combinedStats.emotion + combinedStats.curiosity + combinedStats.power) / 4;
  const grade = mapScoreToRank(Math.round(statAvg));

  const GRADE_COLORS: Record<string, string> = { S: '#ffd700', A: '#c0c0c0', B: '#cd7f32', C: '#7ec8e3' };
  const GRADE_BG: Record<string, string> = {
    S: 'linear-gradient(135deg, #fff8dc, #ffd700)',
    A: 'linear-gradient(135deg, #f0f0f0, #c0c0c0)',
    B: 'linear-gradient(135deg, #f5deb3, #cd7f32)',
    C: 'linear-gradient(135deg, #e0f7ff, #7ec8e3)',
  };

  const radarData = [
    { name: '头脑', value: combinedStats.mind },
    { name: '情感', value: combinedStats.emotion },
    { name: '好奇', value: combinedStats.curiosity },
    { name: '力量', value: combinedStats.power },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f8f4ff, #e8f5e9)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16 }}>
          <button onClick={() => setPhase('feeding')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>← 返回</button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>确认参赛 📋</h1>
        </div>

        {/* Main info card */}
        <div style={{ background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pet info */}
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 48 }}>{pet.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#333' }}>{pet.name}</div>
              <div style={{ color: '#888', fontSize: 12, margin: '4px 0' }}>× {contest.icon} {contest.name}</div>
            </div>

            {/* Radar */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <AppRadarChart data={radarData} maxValue={150} color={accentColor} size={180} ariaLabel={`${pet.name}参赛属性雷达`} />
            </div>

            {/* Grade + Mood */}
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>综合评级</div>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: GRADE_BG[grade],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px',
                fontSize: 32, fontWeight: 900, color: '#fff',
                boxShadow: `0 4px 16px ${GRADE_COLORS[grade]}88`,
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}>
                {grade}
              </div>
              <MoodBadge mood={mood} />
            </div>
          </div>
        </div>

        {/* Food summary */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>已选食物</h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {selectedFoods.map((fid, i) => {
              const food = FOODS.find(f => f.id === fid);
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32 }}>{food?.icon}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{food?.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>表演技能</h3>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {pet.skills.map((skill, i) => (
              <div key={i} style={{ background: `${accentColor}11`, borderRadius: 12, padding: '8px 14px', textAlign: 'center', minWidth: 100 }}>
                <span style={{ background: accentColor, color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginRight: 4 }}>{i + 1}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details toggle */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{ background: 'white', border: `1px solid ${accentColor}44`, borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontSize: 13, color: accentColor, fontWeight: 600 }}
          >
            {showDetails ? '▲ 收起详情' : '▼ 查看详情'}
          </button>
        </div>

        {/* Numeric details (hidden by default) */}
        {showDetails && (
          <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', marginBottom: 20, animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 12px', color: '#666', fontSize: 14 }}>详细数值</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {(Object.entries(combinedStats) as [string, number][]).map(([dim, val]) => (
                <span key={dim} style={{ fontSize: 12, background: '#f5f0ff', borderRadius: 8, padding: '3px 8px', color: '#7c4dff', fontWeight: 600 }}>
                  {DIM_LABELS[dim]}: {val}
                </span>
              ))}
            </div>
            {[
              { label: '心情值', value: `${mood}/100`, icon: '😊' },
              { label: '闪光值', value: sparkle.toFixed(1), icon: '✨' },
              { label: '暴击率', value: `${(critRate * 100).toFixed(1)}%`, icon: '⚡' },
              { label: '暴击倍率', value: `×${critMult.toFixed(2)}`, icon: '💥' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>
                <span style={{ color: '#666' }}>{item.icon} {item.label}</span>
                <b style={{ color: accentColor }}>{item.value}</b>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>技能加成明细</div>
              {pet.skills.map((skill, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 12, borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: accentColor, fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>
                  <span style={{ color: '#444', fontWeight: 600 }}>{skill.name}</span>
                  <span style={{ color: '#888' }}>{Object.entries(skill.bonus).map(([d, v]) => `${DIM_LABELS[d]}+${v}`).join(' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <button onClick={() => setPhase('performance')}
            style={{ background: `linear-gradient(135deg, ${accentColor}, #9c27b0)`, color: 'white', border: 'none', borderRadius: 16, padding: '16px 56px', fontSize: 20, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: 2 }}>
            🎭 开始表演！
          </button>
        </div>
      </div>
    </div>
  );
}
