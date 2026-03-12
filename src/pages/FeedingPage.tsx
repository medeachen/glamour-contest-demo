import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS, FOODS, DIM_LABELS } from '../data/gameData';
import type { FoodId } from '../types';
import { PetModel } from '../components/PetModel';
import { RadarChart } from '../components/RadarChart';
import { MoodBadge } from '../components/MoodBadge';
import { calculateMood, calculateFoodBonus } from '../utils/gameLogic';
import { getMoodInfo, buildDisplayStats, previewFeeding } from '../utils/scoring';

export function FeedingPage() {
  const { setPhase, selectedPet, selectedFoods, addFood, removeFood, clearFoods, selectedContest } = useGameStore();
  const [feedAnim, setFeedAnim] = useState<FoodId | null>(null);

  if (!selectedPet) { setPhase('petSelect'); return null; }

  const pet = PETS.find(p => p.id === selectedPet)!;
  const mood = calculateMood(selectedPet, selectedFoods);
  const moodInfo = getMoodInfo(mood);
  const foodBonus = calculateFoodBonus(selectedFoods);

  // Build 5D display stats for radar
  const baseDisplay = buildDisplayStats(pet.baseStats, pet.affection, mood);
  const preview = previewFeeding(selectedPet, selectedFoods);
  const previewDisplay = selectedFoods.length > 0
    ? buildDisplayStats(preview.after, pet.affection, mood)
    : undefined;

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = selectedContest ? contestColors[selectedContest] : '#9c27b0';

  function handleFeed(fid: FoodId) {
    if (selectedFoods.length >= 3) return;
    addFood(fid);
    setFeedAnim(fid);
    setTimeout(() => setFeedAnim(null), 600);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fff8e1, #f3e5f5, #e8f5e9)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 16 }}>
          <button onClick={() => setPhase('petSelect')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            ← 返回
          </button>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#444' }}>给 {pet.name} 喂食 🍽️</h1>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Left: pet display + mood + radar */}
          <div style={{ background: 'white', borderRadius: 24, padding: 24, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minWidth: 260, flex: '0 0 auto' }}>
            <PetModel petId={selectedPet} size={180} animate={true} />
            <h2 style={{ margin: '8px 0 12px', color: '#444', fontWeight: 800 }}>{pet.icon} {pet.name}</h2>

            {/* 3-tier mood badge */}
            <div style={{ marginBottom: 16 }}>
              <MoodBadge mood={mood} moodInfo={moodInfo} />
            </div>

            {/* Dynamic 5D radar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>
                五维能力{selectedFoods.length > 0 ? '（预览变化）' : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RadarChart
                  values={baseDisplay}
                  maxValue={100}
                  color={accentColor}
                  size={180}
                  previewValues={previewDisplay}
                  previewColor="#86efac"
                />
              </div>
              {selectedFoods.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
                  {(Object.entries(foodBonus) as [string, number][])
                    .filter(([, v]) => v !== 0)
                    .map(([dim, val]) => (
                      <span key={dim} style={{
                        fontSize: 11, borderRadius: 8, padding: '2px 8px', fontWeight: 700,
                        background: val > 0 ? '#e8f5e9' : '#fce4ec',
                        color: val > 0 ? '#2e7d32' : '#c62828',
                      }}>
                        {DIM_LABELS[dim]} {val > 0 ? `+${val}` : val}
                      </span>
                    ))}
                </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FOODS.map(food => {
                  const pref = pet.tastePreference[food.id];
                  const moodDelta = pref > 0 ? `😍 +${pref}心情` : pref < 0 ? `😣 ${pref}心情` : '😐 无感';
                  const moodDeltaColor = pref > 0 ? '#4caf50' : pref < 0 ? '#f44336' : '#888';
                  const bonusText = Object.entries(food.statBonus)
                    .map(([d, v]) => `${DIM_LABELS[d]}+${v}`)
                    .join(' ');
                  return (
                    <button key={food.id}
                      onClick={() => handleFeed(food.id)}
                      disabled={selectedFoods.length >= 3}
                      style={{
                        background: selectedFoods.length < 3 ? 'linear-gradient(90deg, #fafafa, #f5f0ff)' : '#f5f5f5',
                        border: '1px solid #e0d7f7',
                        borderRadius: 14, padding: '10px 16px', cursor: selectedFoods.length < 3 ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                      }}>
                      <span style={{ fontSize: 26 }}>{food.icon}</span>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#444', fontSize: 14 }}>{food.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{bonusText}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: moodDeltaColor }}>{moodDelta}</div>
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
