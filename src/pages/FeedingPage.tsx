import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, FOODS } from '../data/gameData';
import type { FoodId, DimValues } from '../types';
import { calculateMood, calculateFoodBonus } from '../utils/gameLogic';
import { DynamicRadar } from '../components/DynamicRadar';
import { MoodBadge } from '../components/MoodBadge';
import { PetModel } from '../components/PetModel';

export function FeedingPage() {
  const { setPhase, selectedPet, selectedFoods, addFood, removeFood, clearFoods, selectedContest } = useGameStore();
  const [feedAnim, setFeedAnim] = useState<FoodId | null>(null);

  if (!selectedPet) { setPhase('petSelect'); return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const mood = calculateMood(selectedPet, selectedFoods);
  const foodBonus = calculateFoodBonus(selectedFoods);

  const currentStats: DimValues = { ...pet.baseStats };
  const predictedStats: DimValues = {
    mind: pet.baseStats.mind + foodBonus.mind,
    emotion: pet.baseStats.emotion + foodBonus.emotion,
    curiosity: pet.baseStats.curiosity + foodBonus.curiosity,
    power: pet.baseStats.power + foodBonus.power,
  };

  const contestColors: Record<string, string> = {
    elegance: '#3a5080',
    sweet: '#e91e8c',
    dashing: '#f57c00',
    fresh: '#2e7d32',
    charm: '#c62828',
  };
  const accentColor = selectedContest ? contestColors[selectedContest] : '#9c27b0';

  function handleFeed(fid: FoodId) {
    if (selectedFoods.length >= 3) return;
    addFood(fid);
    setFeedAnim(fid);
    setTimeout(() => setFeedAnim(null), 600);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #fff8e1, #f3e5f5, #e8f5e9)',
      padding: '20px',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 16 }}>
          <button onClick={() => setPhase('petSelect')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            ← 返回
          </button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>给 {pet.name} 喂食 🍽️</h1>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Left: pet + radar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260 }}>
            {/* Pet card */}
            <div style={{ background: 'white', borderRadius: 24, padding: 20, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <PetModel petId={selectedPet} size={160} animate={true} />
              <h2 style={{ margin: '8px 0 4px', color: '#444', fontWeight: 800 }}>{pet.icon} {pet.name}</h2>

              {/* Mood – 3-tier only, no raw number in UI */}
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#999' }}>心情</span>
                <MoodBadge mood={mood} size="lg" />
              </div>
            </div>

            {/* Dynamic radar */}
            <div style={{ background: 'white', borderRadius: 24, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
                {selectedFoods.length > 0 ? '📈 喂食后预测' : '当前能力'}
              </div>
              <DynamicRadar
                current={currentStats}
                predicted={selectedFoods.length > 0 ? predictedStats : undefined}
                maxValue={150}
                color={accentColor}
                size={220}
              />
              {selectedFoods.length > 0 && (
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>悬停查看精确数值</div>
              )}
            </div>
          </div>

          {/* Right: food selection */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Food slots */}
            <div style={{ background: 'white', borderRadius: 24, padding: 20, marginBottom: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#555', fontSize: 16 }}>已选食物 ({selectedFoods.length}/3)</h3>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {[0, 1, 2].map(i => {
                  const fid = selectedFoods[i];
                  const food = fid ? FOODS.find(f => f.id === fid) : null;
                  return (
                    <div key={i}
                      onClick={() => fid && removeFood(i)}
                      style={{
                        width: 72, height: 72, borderRadius: 16,
                        border: fid ? `2px solid ${accentColor}` : '2px dashed #ddd',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: fid ? '#faf5ff' : '#fafafa',
                        cursor: fid ? 'pointer' : 'default',
                        fontSize: 28, transition: 'all 0.2s',
                        boxShadow: feedAnim === fid ? `0 0 16px ${accentColor}88` : 'none',
                      }}>
                      {food ? (
                        <>
                          <span>{food.icon}</span>
                          <span style={{ fontSize: 9, color: '#888', marginTop: 2 }}>点击移除</span>
                        </>
                      ) : (
                        <span style={{ color: '#ccc', fontSize: 24 }}>+</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => clearFoods()} style={{ marginTop: 10, background: '#fff0f5', border: '1px solid #ffb6c1', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#e91e8c' }}>
                清空
              </button>
            </div>

            {/* Food list */}
            <div style={{ background: 'white', borderRadius: 24, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#555', fontSize: 16 }}>选择食物</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FOODS.map(food => {
                  const pref = pet.tastePreference[food.id];
                  const prefColor = pref > 0 ? '#4caf50' : pref < 0 ? '#f44336' : '#888';
                  const prefEmoji = pref > 0 ? '😍' : pref < 0 ? '😣' : '😐';
                  const prefLabel = pref > 0 ? '很喜欢' : pref < 0 ? '不喜欢' : '无感';
                  const dimLabels: Record<string, string> = { mind: '头脑', emotion: '情感', curiosity: '好奇', power: '力量' };
                  return (
                    <button key={food.id}
                      onClick={() => handleFeed(food.id)}
                      disabled={selectedFoods.length >= 3}
                      style={{
                        background: selectedFoods.length < 3 ? 'linear-gradient(90deg, #fafafa, #f5f0ff)' : '#f5f5f5',
                        border: '1px solid #e0d7f7',
                        borderRadius: 14, padding: '10px 16px',
                        cursor: selectedFoods.length < 3 ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                      }}>
                      <span style={{ fontSize: 26 }}>{food.icon}</span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#444', fontSize: 14 }}>{food.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          {Object.entries(food.statBonus).map(([d]) => `${dimLabels[d] ?? d}↑`).join(' ')}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: prefColor }}>
                        {prefEmoji} {prefLabel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Next button */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button onClick={() => setPhase('confirm')} disabled={selectedFoods.length === 0}
            style={{
              background: selectedFoods.length > 0 ? `linear-gradient(135deg, ${accentColor}, #9c27b0)` : '#ccc',
              color: 'white', border: 'none', borderRadius: 16, padding: '14px 48px', fontSize: 18,
              fontWeight: 700, cursor: selectedFoods.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: selectedFoods.length > 0 ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
            }}>
            确认喂食 ✅
          </button>
        </div>
      </div>
    </div>
  );
}
