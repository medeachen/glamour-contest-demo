import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, FOODS } from '../data/gameData';
import type { FoodId } from '../types';
import { PetModel } from '../components/PetModel';
import { DynamicRadar } from '../components/DynamicRadar';
import { MoodBadge } from '../components/MoodBadge';
import { calculateMood, calculateFoodBonus } from '../utils/gameLogic';

export function FeedingPage() {
  const { setPhase, selectedPet, selectedFoods, addFood, removeFood, clearFoods, selectedContest } = useGameStore();
  const [feedAnim, setFeedAnim] = useState<FoodId | null>(null);
  const [previewFood, setPreviewFood] = useState<FoodId | null>(null);

  if (!selectedPet) { setPhase('petSelect'); return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const mood = calculateMood(selectedPet, selectedFoods);
  const foodBonus = calculateFoodBonus(selectedFoods);

  // Preview calculation when hovering a food
  const previewFoods = previewFood && selectedFoods.length < 3
    ? [...selectedFoods, previewFood]
    : selectedFoods;
  const previewMood = previewFood && selectedFoods.length < 3
    ? calculateMood(selectedPet, previewFoods)
    : mood;
  const previewBonus = previewFood && selectedFoods.length < 3
    ? calculateFoodBonus(previewFoods)
    : foodBonus;

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = selectedContest ? contestColors[selectedContest] : '#9c27b0';

  function handleFeed(fid: FoodId) {
    if (selectedFoods.length >= 3) return;
    addFood(fid);
    setFeedAnim(fid);
    setPreviewFood(null);
    setTimeout(() => setFeedAnim(null), 600);
  }

  // Build radar data for DynamicRadar
  const currentRadarData = [
    { name: '头脑', current: pet.baseStats.mind + foodBonus.mind, predicted: pet.baseStats.mind + previewBonus.mind },
    { name: '情感', current: pet.baseStats.emotion + foodBonus.emotion, predicted: pet.baseStats.emotion + previewBonus.emotion },
    { name: '好奇', current: pet.baseStats.curiosity + foodBonus.curiosity, predicted: pet.baseStats.curiosity + previewBonus.curiosity },
    { name: '力量', current: pet.baseStats.power + foodBonus.power, predicted: pet.baseStats.power + previewBonus.power },
  ];

  const hasPreview = previewFood !== null && selectedFoods.length < 3 &&
    currentRadarData.some(d => d.predicted !== d.current);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff8e1, #f3e5f5, #e8f5e9)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 16 }}>
          <button onClick={() => setPhase('petSelect')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            ← 返回
          </button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>给 {pet.name} 喂食 🍽️</h1>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Left: pet + radar */}
          <div style={{ background: 'white', borderRadius: 24, padding: 24, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minWidth: 260 }}>
            <PetModel petId={selectedPet} size={160} animate={true} />
            <h2 style={{ margin: '8px 0 4px', color: '#444', fontWeight: 800 }}>{pet.icon} {pet.name}</h2>

            {/* Mood badge */}
            <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#888' }}>当前心情</span>
              <MoodBadge mood={previewFood && selectedFoods.length < 3 ? previewMood : mood} />
            </div>

            {/* Dynamic radar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <DynamicRadar
                data={currentRadarData}
                maxValue={150}
                size={200}
                currentColor={accentColor}
                ariaLabel={`${pet.name}五维属性雷达`}
              />
            </div>

            {hasPreview && (
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                虚线为喂食 {FOODS.find(f => f.id === previewFood)?.name} 后的预测值
              </div>
            )}
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
                        width: 72, height: 72, borderRadius: 16, border: fid ? `2px solid ${accentColor}` : '2px dashed #ddd',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: fid ? '#faf5ff' : '#fafafa', cursor: fid ? 'pointer' : 'default',
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

            {/* Food buttons */}
            <div style={{ background: 'white', borderRadius: 24, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#555', fontSize: 16 }}>选择食物</h3>
              <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 10px' }}>悬停食物可预览属性变化</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FOODS.map(food => {
                  const pref = pet.tastePreference[food.id];
                  const prefColor = pref > 0 ? '#4caf50' : pref < 0 ? '#f44336' : '#888';
                  const moodLabel = pref > 0 ? '😊' : pref < 0 ? '😟' : '😐';
                  return (
                    <button key={food.id}
                      onClick={() => handleFeed(food.id)}
                      onMouseEnter={() => setPreviewFood(food.id)}
                      onMouseLeave={() => setPreviewFood(null)}
                      disabled={selectedFoods.length >= 3}
                      style={{
                        background: selectedFoods.length < 3 ? (previewFood === food.id ? '#f5f0ff' : 'linear-gradient(90deg, #fafafa, #f5f0ff)') : '#f5f5f5',
                        border: previewFood === food.id ? `1.5px solid ${accentColor}` : '1px solid #e0d7f7',
                        borderRadius: 14, padding: '10px 16px', cursor: selectedFoods.length < 3 ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                      }}>
                      <span style={{ fontSize: 26 }}>{food.icon}</span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#444', fontSize: 14 }}>{food.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{food.taste}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: prefColor }}>
                        {moodLabel} 心情{pref > 0 ? `+${pref}` : pref < 0 ? `${pref}` : ''}
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
