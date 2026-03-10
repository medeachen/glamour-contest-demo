import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS } from '../data/gameData';
import type { PetId } from '../types';
import { PetModel } from '../components/PetModel';
import { RadarChart } from '../components/RadarChart';

const TASTE_LABELS: Record<string, string> = { sweet: '甜', sour: '酸', bitter: '苦', spicy: '辣', salty: '咸' };

export function PetSelectPage() {
  const { setPhase, selectPet, selectedPet, selectedContest } = useGameStore();
  const [hovered, setHovered] = useState<PetId | null>(null);

  function handleSelect(id: PetId) {
    selectPet(id);
  }

  function handleNext() {
    if (selectedPet) setPhase('feeding');
  }

  const contestColors: Record<string, string> = { elegance: '#3a5080', sweet: '#e91e8c', dashing: '#f57c00', fresh: '#2e7d32', charm: '#c62828' };
  const accentColor = selectedContest ? contestColors[selectedContest] : '#9c27b0';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f3e5f5, #e8eaf6, #e0f2f1)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <button onClick={() => setPhase('lobby')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            ← 返回大厅
          </button>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#444' }}>选择你的宠物 🐾</h1>
        </div>

        {/* Pet cards */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PETS.map((pet) => {
            const isSelected = selectedPet === pet.id;
            const isHov = hovered === pet.id;
            const prefs = Object.entries(pet.tastePreference).sort((a, b) => b[1] - a[1]);
            return (
              <div key={pet.id}
                onClick={() => handleSelect(pet.id)}
                onMouseEnter={() => setHovered(pet.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: 'white',
                  borderRadius: 24,
                  padding: 24,
                  cursor: 'pointer',
                  width: 260,
                  boxShadow: isSelected ? `0 8px 32px ${accentColor}44` : isHov ? '0 8px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.07)',
                  border: isSelected ? `2px solid ${accentColor}` : '2px solid transparent',
                  transform: isHov || isSelected ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.3s',
                  textAlign: 'center',
                }}>
                {/* 3D Model */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <PetModel petId={pet.id} size={160} animate={true} />
                </div>

                <h2 style={{ margin: '8px 0 4px', fontSize: 20, color: '#333', fontWeight: 800 }}>
                  {pet.icon} {pet.name}
                  <span style={{ fontSize: 13, marginLeft: 8, background: '#f0f4ff', borderRadius: 8, padding: '2px 8px', color: '#5566aa', fontWeight: 600 }}>{pet.element}属性</span>
                </h2>
                <p style={{ color: '#777', fontSize: 12, margin: '0 0 12px', lineHeight: 1.6 }}>{pet.description}</p>

                {/* Radar */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                  <RadarChart values={pet.baseStats} maxValue={100} color={accentColor} size={120} />
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', margin: '8px 0' }}>
                  {Object.entries(pet.baseStats).map(([dim, val]) => {
                    const labels: Record<string, string> = { mind: '头脑', emotion: '情感', curiosity: '好奇', power: '力量' };
                    return (
                      <span key={dim} style={{ fontSize: 11, background: '#f5f0ff', borderRadius: 8, padding: '3px 8px', color: '#7c4dff', fontWeight: 600 }}>
                        {labels[dim]}: {val}
                      </span>
                    );
                  })}
                </div>

                {/* Affection */}
                <div style={{ margin: '8px 0', fontSize: 13, color: '#555' }}>
                  💕 好感度 <b style={{ color: '#e91e8c' }}>{pet.affection}</b>
                </div>

                {/* Taste prefs */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>味道偏好</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {prefs.map(([taste, val]) => (
                      <span key={taste} style={{ fontSize: 11, background: val > 0 ? '#e8f5e9' : '#fce4ec', color: val > 0 ? '#2e7d32' : '#c62828', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
                        {TASTE_LABELS[taste]} {val > 0 ? '+' : ''}{val}
                      </span>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div style={{ marginTop: 12, color: accentColor, fontWeight: 700, fontSize: 14 }}>✅ 已选择</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next button */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button onClick={handleNext} disabled={!selectedPet}
            style={{
              background: selectedPet ? `linear-gradient(135deg, ${accentColor}, #9c27b0)` : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              padding: '14px 48px',
              fontSize: 18,
              fontWeight: 700,
              cursor: selectedPet ? 'pointer' : 'not-allowed',
              boxShadow: selectedPet ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.3s',
            }}>
            前往喂食 🍰
          </button>
        </div>
      </div>
    </div>
  );
}
