import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PETS } from '../data/gameData';
import type { PetId } from '../types';
import { PetCard } from '../components/PetCard';
import { computeRecommendation } from '../utils/scoring';

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

  // Sort pets: highest recommendation score first
  const petsWithScore = PETS.map(pet => ({ pet, score: computeRecommendation(pet) }));
  const maxScore = Math.max(...petsWithScore.map(p => p.score));
  const sortedPets = [...petsWithScore].sort((a, b) => b.score - a.score);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f3e5f5, #e8eaf6, #e0f2f1)', padding: '20px', fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <button onClick={() => setPhase('lobby')} style={{ background: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            ← 返回大厅
          </button>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#444' }}>选择你的宠物 🐾</h1>
        </div>

        {/* Hint */}
        <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 13, color: '#888' }}>
          ⭐ 推荐排名已根据综合评分排序。将鼠标移到宠物上查看详细数值。
        </div>

        {/* Pet cards */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {sortedPets.map(({ pet, score }) => {
            const isRecommended = score === maxScore;
            return (
              <div
                key={pet.id}
                onMouseEnter={() => setHovered(pet.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ transform: hovered === pet.id || selectedPet === pet.id ? 'translateY(-4px)' : 'none', transition: 'transform 0.3s' }}
              >
                <PetCard
                  pet={pet}
                  recommended={isRecommended}
                  accentColor={accentColor}
                  isSelected={selectedPet === pet.id}
                  onClick={() => handleSelect(pet.id)}
                />
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
